import { z } from "zod";
import { requireAdmin } from "@/lib/server/auth";
import { getPool } from "@/lib/server/db";
import { failure, json } from "@/lib/server/http";
export const runtime = "nodejs";
export async function GET(request: Request) {
  try {
    await requireAdmin(request.headers, false, "leads");
    const params = new URL(request.url).searchParams;
    const period = z.enum(["week", "month"]).parse(params.get("period") || "week");
    const dates = z.array(z.iso.date().refine(value => value >= "1900-01-01" && value <= "2100-12-31")).min(2).max(3).parse(params.getAll("date"));
    const timezone = process.env.ADMIN_TIMEZONE || "Asia/Karachi";
    // At most three bounded index scans. No full-history download to the browser.
    const result = await getPool().query(`WITH bounds AS (
      SELECT ordinal, date_trunc($2, anchor)::date AS start,
        (date_trunc($2, anchor) + CASE WHEN $2='week' THEN interval '7 days' ELSE interval '1 month' END)::date AS until
      FROM unnest($3::date[]) WITH ORDINALITY AS selected(anchor, ordinal)
    ) SELECT start::text, (until-1)::text AS end,
      (SELECT jsonb_agg(jsonb_build_object('date', day::date::text, 'count',
        CASE WHEN day::date > (now() AT TIME ZONE $1)::date THEN NULL ELSE coalesce(counts.total,0) END) ORDER BY day)
      FROM generate_series(start::timestamp,(until-1)::timestamp,interval '1 day') day
      LEFT JOIN (SELECT (created_at AT TIME ZONE $1)::date AS date,count(*)::int AS total FROM fa_leads
        WHERE deleted_at IS NULL AND created_at >= (start::timestamp AT TIME ZONE $1)
        AND created_at < (until::timestamp AT TIME ZONE $1) AND created_at <= now()
        GROUP BY 1) counts ON counts.date=day::date) AS daily
      FROM bounds ORDER BY ordinal`, [timezone, period, dates]);
    return json({period, timezone, series: result.rows});
  } catch (error) { return failure(error); }
}
