import { z } from "zod";
import { requireAdmin } from "@/lib/server/auth";
import { getPool } from "@/lib/server/db";
import { failure, json } from "@/lib/server/http";
export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await requireAdmin(request.headers, false, "leads");
    const params = new URL(request.url).searchParams;
    const anchor = z.iso.date().refine(value => value >= "1900-01-01" && value <= "2100-12-31").optional().parse(params.get("date") || undefined);
    const period = z.enum(["day", "week", "month", "quarter", "year"]).parse(params.get("period") || "month");
    const timezone = process.env.ADMIN_TIMEZONE || "Asia/Karachi";
    const result = await getPool().query(`WITH selected AS (
      SELECT coalesce($3::date,(now() AT TIME ZONE $1)::date) AS anchor,
        (now() AT TIME ZONE $1)::date AS today
    ), bounds AS (
      SELECT anchor,today,
        CASE $2
          WHEN 'day' THEN anchor
          WHEN 'week' THEN date_trunc('week',anchor)::date
          WHEN 'month' THEN date_trunc('month',anchor)::date
          WHEN 'quarter' THEN (date_trunc('month',anchor)-interval '2 months')::date
          WHEN 'year' THEN date_trunc('year',anchor)::date
        END AS start,
        CASE $2
          WHEN 'day' THEN anchor+1
          WHEN 'week' THEN date_trunc('week',anchor)::date+7
          WHEN 'month' THEN (date_trunc('month',anchor)+interval '1 month')::date
          WHEN 'quarter' THEN (date_trunc('month',anchor)+interval '1 month')::date
          WHEN 'year' THEN (date_trunc('year',anchor)+interval '1 year')::date
        END AS until FROM selected
    ), counts AS (
      SELECT status,count(*)::int AS count FROM fa_leads,bounds
      WHERE deleted_at IS NULL AND created_at >= (start::timestamp AT TIME ZONE $1)
        AND created_at < (until::timestamp AT TIME ZONE $1) AND created_at <= now()
      GROUP BY status
    ) SELECT anchor::text,today::text,start::text,(until-1)::text AS end,
      (SELECT coalesce(sum(count),0)::int FROM counts) AS total,
      (SELECT coalesce(jsonb_object_agg(status,count),'{}'::jsonb) FROM counts) AS statuses
    FROM bounds`, [timezone, period, anchor || null]);
    return json({ ...result.rows[0], period, timezone });
  } catch (error) { return failure(error); }
}
