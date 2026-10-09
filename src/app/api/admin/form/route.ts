import { z } from "zod";
import { fieldsSchema } from "@/lib/forms";
import { requireAdmin } from "@/lib/server/auth";
import { transaction } from "@/lib/server/db";
import { clearFormCache, getPublishedForm } from "@/lib/server/form-store";
import { checkOrigin, failure, HttpError, json, readJson } from "@/lib/server/http";
export const runtime = "nodejs";
export async function GET(request: Request) {
  try { await requireAdmin(request.headers, "leads"); return json(await getPublishedForm(true)); }
  catch (error) { return failure(error); }
}
export async function PUT(request: Request) {
  try {
    checkOrigin(request);
    const admin = await requireAdmin(request.headers, "leads");
    const body = z.object({ version: z.number().int().positive(), fields: fieldsSchema }).strict().parse(await readJson(request));
    const version = await transaction(async client => {
      const current = await client.query("SELECT version_id FROM fa_form_current WHERE id = 1 FOR UPDATE");
      if (current.rows[0]?.version_id !== body.version) throw new HttpError(409, "Another admin has changed the form. Reload before publishing.");
      const result = await client.query("INSERT INTO fa_form_versions (fields, created_by) VALUES ($1, $2) RETURNING id", [JSON.stringify(body.fields), admin.id]);
      await client.query("UPDATE fa_form_current SET version_id = $1 WHERE id = 1", [result.rows[0].id]);
      await client.query("INSERT INTO fa_audit_events (actor_id, action, entity_id) VALUES ($1, 'form.publish', $2)", [admin.id, String(result.rows[0].id)]);
      return result.rows[0].id as number;
    });
    clearFormCache();
    return json({ version, fields: body.fields });
  } catch (error) { return failure(error); }
}
