import { requireAdmin } from "@/lib/server/auth";
import { getPool } from "@/lib/server/db";
import { failure, json } from "@/lib/server/http";
export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await requireAdmin(request.headers, false, "leads");
    const timezone = process.env.ADMIN_TIMEZONE || "Asia/Karachi";
    // Only scan this month / the last fourteen days, rather than the full history.
    const result = await getPool().query(`WITH bounds AS (
      SELECT (now() AT TIME ZONE $1)::date AS today,
        date_trunc('month', now() AT TIME ZONE $1)::date AS month
    ), recent AS (
      SELECT (l.created_at AT TIME ZONE $1)::date AS day, l.status
      FROM fa_leads l, bounds b
      WHERE l.deleted_at IS NULL
        AND l.created_at >= (least(b.month, b.today - 13)::timestamp AT TIME ZONE $1)
        AND l.created_at <= now()
    ) SELECT b.today::text AS today, b.month::text AS month,
      (SELECT count(*)::int FROM recent WHERE day = b.today) AS today_total,
      (SELECT count(*)::int FROM recent WHERE day >= b.month) AS month_total,
      (SELECT coalesce(jsonb_object_agg(status, total), '{}'::jsonb) FROM
        (SELECT status, count(*)::int AS total FROM recent WHERE day >= b.month GROUP BY status) s) AS statuses,
      (SELECT jsonb_agg(jsonb_build_object('date', d.day::date::text, 'count',
        (SELECT count(*)::int FROM recent r WHERE r.day = d.day::date)) ORDER BY d.day)
        FROM generate_series((b.today - 13)::timestamp, b.today::timestamp, interval '1 day') d(day)) AS daily
      FROM bounds b`, [timezone]);
    return json({ ...result.rows[0], timezone, updated_at: new Date().toISOString() });
  } catch (error) { return failure(error); }
}
