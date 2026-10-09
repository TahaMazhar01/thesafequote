import { z } from "zod";
import { requireAdmin } from "@/lib/server/auth";
import { getPool, transaction } from "@/lib/server/db";
import { leadFilter } from "@/lib/server/lead-filter";
import { getPublishedForm } from "@/lib/server/form-store";
import { checkOrigin, failure, HttpError, readJson } from "@/lib/server/http";
import { consumeLimit } from "@/lib/server/rate-limit";
import { exportTable } from "@/lib/lead-export";
import type { FormField } from "@/lib/forms";
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const admin = await requireAdmin(request.headers, false, "leads");
    await consumeLimit(`export:${admin.id}`, 5, 300);
    const body = z.object({ format: z.enum(["csv", "xlsx"]), search: z.string().max(254), status: z.string().max(20), archived: z.enum(["true", "false"]), deleted: z.enum(["true", "false"]), range: z.enum(["all", "today", "yesterday", "custom", "time"]), from: z.string().max(40), to: z.string().max(40) }).strict().parse(await readJson(request, 4096));
    const { where, values, timezone } = leadFilter(new URLSearchParams(body));
    const result = await transaction(async client => {
      await client.query("SET TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY");
      const budget = await client.query(`SELECT count(*)::int AS total, coalesce(sum(bytes),0)::int AS bytes FROM (SELECT octet_length(answers::text) AS bytes FROM fa_leads WHERE ${where.join(" AND ")} ORDER BY created_at DESC,id DESC LIMIT 2001) chosen`,values);
      if(budget.rows[0].total>2000)throw new HttpError(422,"More than 2,000 leads match. Choose a smaller date range before downloading.");
      if(budget.rows[0].bytes>8*1024*1024)throw new HttpError(422,"This export is too large. Choose a smaller date range.");
      return client.query(`SELECT id, source, status, created_at, answers, form_version FROM fa_leads WHERE ${where.join(" AND ")} ORDER BY created_at DESC, id DESC LIMIT 2000`, values);
    });
    if (result.rows.length > 2000) throw new HttpError(422, "More than 2,000 leads match. Choose a smaller date range before downloading.");
    if (Buffer.byteLength(JSON.stringify(result.rows)) > 8 * 1024 * 1024) throw new HttpError(422, "This export is too large. Choose a smaller date range.");
    const current = await getPublishedForm();
    const columns = new Map(current.fields.map(field => [field.id, field.label]));
    const versions = await getPool().query("SELECT fields FROM fa_form_versions WHERE id = ANY($1::int[]) ORDER BY id DESC", [[...new Set(result.rows.map(row => row.form_version))]]);
    for (const version of versions.rows) for (const field of version.fields as FormField[]) if (!columns.has(field.id)) columns.set(field.id, `${field.label} (previous field)`);
    if(columns.size>100)throw new HttpError(422,"Too many historical fields. Choose a smaller date range.");
    const date = new Intl.DateTimeFormat("en-GB", { timeZone: timezone, dateStyle: "medium", timeStyle: "medium" });
    const headers = ["Sr. no.", "Lead ID", ...columns.values(), "Source", `Received (${timezone})`, "Received (UTC)", "Status"];
    const rows = result.rows.map((row, index) => [String(index + 1), row.id, ...[...columns.keys()].map(id => typeof row.answers[id] === "boolean" ? row.answers[id] ? "Yes" : "No" : String(row.answers[id] ?? "")), row.source, date.format(new Date(row.created_at)), new Date(row.created_at).toISOString(), row.status]);
    const bytes = await exportTable(body.format, headers, rows);
    await getPool().query("INSERT INTO fa_audit_events(actor_id,actor_email,action,entity_id) VALUES($1,$2,$3,$4)", [admin.id, admin.email, "lead.export", `${body.format}:${rows.length}`]);
    return new Response(new Uint8Array(bytes), { headers: { "Content-Type": body.format === "csv" ? "text/csv; charset=utf-8" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Content-Disposition": `attachment; filename="leads-${new Date().toISOString().slice(0,10)}.${body.format}"`, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", "X-Export-Count": String(rows.length) } });
  } catch (error) { return failure(error); }
}
