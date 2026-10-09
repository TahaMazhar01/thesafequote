import { z } from "zod";
import { plainText } from "@/lib/plain-text";
import { fieldsSchema, leadStatuses, validateAnswers } from "@/lib/forms";
import { requireAdmin } from "@/lib/server/auth";
import { getPool, transaction } from "@/lib/server/db";
import { checkOrigin, failure, HttpError, json, readJson } from "@/lib/server/http";
export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };
export async function GET(request: Request, context: Context) {
  try {
    await requireAdmin(request.headers, "leads");
    const id = z.uuid().parse((await context.params).id);
    const result = await getPool().query("SELECT l.*, v.fields FROM fa_leads l JOIN fa_form_versions v ON v.id = l.form_version WHERE l.id = $1", [id]);
    if (!result.rows[0]) throw new HttpError(404, "Lead not found.");
    const lead = { ...result.rows[0] };
    delete lead.request_hash;
    delete lead.request_id;
    return json(lead);
  } catch (error) { return failure(error); }
}
export async function PATCH(request: Request, context: Context) {
  try {
    checkOrigin(request);
    const admin = await requireAdmin(request.headers, "leads");
    const id = z.uuid().parse((await context.params).id);
    const body = z.union([
      z.object({ revision: z.number().int().positive(), status: z.enum(leadStatuses), notes: plainText(5000), archived: z.boolean(), answers: z.unknown() }).strict(),
      z.object({ revision: z.number().int().positive(), status: z.enum(leadStatuses) }).strict(),
      z.object({ revision: z.number().int().positive(), action: z.enum(["delete", "restore"]) }).strict(),
    ]).parse(await readJson(request, 40_960));
    await transaction(async client => {
      const result = await client.query("SELECT l.revision, l.deleted_at, v.fields FROM fa_leads l JOIN fa_form_versions v ON v.id = l.form_version WHERE l.id = $1 FOR UPDATE OF l", [id]);
      if (!result.rows[0]) throw new HttpError(404, "Lead not found.");
      if (result.rows[0].revision !== body.revision) throw new HttpError(409, "This lead was changed by another admin. Reload it before saving.");
      if ("action" in body) {
        const deleting = body.action === "delete";
        if (Boolean(result.rows[0].deleted_at) === deleting) throw new HttpError(409, "This lead has already been changed. Refresh the table.");
        await client.query(`UPDATE fa_leads SET deleted_at = CASE WHEN $2 THEN now() ELSE NULL END,
          deleted_by_email = CASE WHEN $2 THEN $3 ELSE NULL END, revision = revision + 1, updated_at = now() WHERE id = $1`, [id, deleting, admin.email]);
        await client.query("INSERT INTO fa_audit_events (actor_id, actor_email, action, entity_id) VALUES ($1,$2,$3,$4)", [admin.id, admin.email, deleting ? "lead.delete" : "lead.restore", id]);
        return;
      }
      if (result.rows[0].deleted_at) throw new HttpError(409, "Restore this lead before editing it.");
      if (!("answers" in body)) {
        await client.query("UPDATE fa_leads SET status = $2, revision = revision + 1, updated_at = now() WHERE id = $1", [id, body.status]);
        await client.query("INSERT INTO fa_audit_events (actor_id, actor_email, action, entity_id) VALUES ($1,$2,'lead.status',$3)", [admin.id, admin.email, id]);
        return;
      }
      const { answers, errors } = validateAnswers(fieldsSchema.parse(result.rows[0].fields), body.answers);
      if (Object.keys(errors).length) throw new HttpError(422, "Check the lead details.", errors);
      await client.query(`UPDATE fa_leads SET answers = $1, status = $2, notes = $3,
        archived_at = CASE WHEN $4::boolean THEN coalesce(archived_at, now()) ELSE NULL END,
        revision = revision + 1, updated_at = now() WHERE id = $5`, [JSON.stringify(answers), body.status, body.notes, body.archived, id]);
      await client.query("INSERT INTO fa_audit_events (actor_id, actor_email, action, entity_id) VALUES ($1, $2, $3, $4)", [admin.id, admin.email, body.archived ? "lead.archive" : "lead.update", id]);
    });
    return json({ message: "Lead saved." });
  } catch (error) { return failure(error); }
}
