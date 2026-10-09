import { z } from "zod";
import { leadFilter } from "@/lib/server/lead-filter";
import { requireAdmin } from "@/lib/server/auth";
import { getPool } from "@/lib/server/db";
import { getPublishedForm } from "@/lib/server/form-store";
import { checkOrigin, readJson, failure, HttpError, json } from "@/lib/server/http";
export const runtime = "nodejs";
export async function GET(request: Request) {
  try {
    await requireAdmin(request.headers, false, "leads");
    const params = new URL(request.url).searchParams;
    const limit = z.coerce.number().int().min(1).max(50).parse(params.get("limit") || 25);
    const {where,values,timezone}=leadFilter(params);
    const cursor = params.get("cursor");
    if (cursor) {
      let decoded: unknown;
      try { decoded = JSON.parse(Buffer.from(cursor, "base64url").toString()); } catch { throw new HttpError(400, "Invalid page cursor."); }
      const parsed = z.object({ created: z.iso.datetime({ offset: true }), id: z.uuid() }).parse(decoded);
      values.push(parsed.created, parsed.id);
      where.push(`(created_at, id) < ($${values.length - 1}::timestamptz, $${values.length}::uuid)`);
    }
    values.push(limit + 1);
    const schema = await getPublishedForm();
    const result = await getPool().query(`SELECT id, source, status, created_at, archived_at, deleted_at, deleted_by_email, revision, answers,
      answers->>'first_name' AS first_name, answers->>'last_name' AS last_name,
      answers->>'email' AS email, answers->>'phone' AS phone,
      answers->>'interest_product' AS coverage,
      to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS cursor_created
      FROM fa_leads WHERE ${where.join(" AND ")} ORDER BY created_at DESC, id DESC LIMIT $${values.length}`, values);
    const hasMore = result.rows.length > limit;
    const rows = result.rows.slice(0, limit);
    const last = rows.at(-1);
    return json({ timezone, refreshedAt: new Date().toISOString(), columns: schema.fields.map(({ id, label, type }) => ({ id, label, type })), leads: rows.map(row => ({
      id: row.id, source: row.source, status: row.status, created_at: row.created_at, archived_at: row.archived_at,
      revision: row.revision, deleted_at: row.deleted_at, deleted_by_email: row.deleted_by_email,
      first_name: row.first_name, last_name: row.last_name,
      values: Object.fromEntries(schema.fields.map(field => { const value = row.answers[field.id]; return [field.id, typeof value === "string" ? value.slice(0, 120) : value ?? ""]; })),
    })), nextCursor: hasMore && last ? Buffer.from(JSON.stringify({ created: last.cursor_created, id: last.id })).toString("base64url") : null });
  } catch (error) { return failure(error); }
}

// The dashboard sends sensitive search terms in a no-store POST body, not a URL.
export async function POST(request:Request) {
  try {
    checkOrigin(request);
    await requireAdmin(request.headers,false,"leads");
    const body=z.object({search:z.string().max(254),status:z.string().max(20),archived:z.enum(["true","false"]),deleted:z.enum(["true","false"]),range:z.enum(["all","today","yesterday","custom","time"]),from:z.string().max(40),to:z.string().max(40),cursor:z.string().max(1000)}).strict().parse(await readJson(request,4096));
    const url=new URL(request.url);url.search=new URLSearchParams(body).toString();
    return GET(new Request(url,{headers:request.headers}));
  } catch(error){return failure(error);}
}
