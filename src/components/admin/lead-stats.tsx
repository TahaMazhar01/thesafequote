"use client";
import { useEffect, useState } from "react";
import { CalendarDays, Inbox, CircleCheck, Clock3 } from "lucide-react";
import { LeadTrend } from "./lead-trend";
import { StatusBreakdown } from "./status-breakdown";
import { adminRequest } from "./dashboard";
import { leadStatuses } from "@/lib/forms";

type Stats = { today: string; month: string; today_total: number; month_total: number; statuses: Partial<Record<typeof leadStatuses[number], number>>; daily: { date: string; count: number }[]; timezone: string; updated_at: string };
export function LeadStats({ revision }: { revision: number }) {
  const [data, setData] = useState<Stats | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    adminRequest("/api/admin/stats", { signal: controller.signal }).then(value => { if (active) { setData(value); setError(false); } }).catch(() => { if (active) setError(true); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; controller.abort(); };
  }, [revision]);
  if (error) return <p className="admin-error" role="alert">Overview could not be updated. Use Refresh to try again.</p>;
  if (!data) return <div className="admin-stats-loading" role="status">Loading lead overview…</div>;
  const closed = data.statuses.closed || 0;
  const cards = [
    { label: "Today's leads", value: data.today_total, note: "Received today", icon: CalendarDays, tone: "blue" },
    { label: "This month's leads", value: data.month_total, note: "All enquiries received this month", icon: Inbox, tone: "teal" },
    { label: "Completed", value: closed, note: "This month's leads now closed", icon: CircleCheck, tone: "purple" },
    { label: "Still open", value: data.month_total - closed, note: "This month's leads awaiting closure", icon: Clock3, tone: "gold" },
  ];
  return <section className="admin-overview" aria-label="Lead overview" aria-busy={loading}>
    <div className="admin-overview-meta"><span>{new Date(`${data.month}T12:00:00Z`).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" })} overview</span><span>{data.timezone} · Updated {new Date(data.updated_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZone: data.timezone })}</span></div>
    <div className="admin-stat-cards">{cards.map(({ label, value, note, icon: Icon, tone }) => <article className={`admin-stat-card stat-${tone}`} key={label}><div><span>{label}</span><span className="admin-stat-icon"><Icon size={24} strokeWidth={1.7} /></span></div><strong>{value.toLocaleString()}</strong><p>{note}</p></article>)}</div>
    <div className="admin-stat-charts"><LeadTrend daily={data.daily} revision={revision} />
    <StatusBreakdown revision={revision}/></div>
    <p className="admin-stats-note">Includes archived leads. Deleted leads are excluded. Completed means status “Closed”. Overview is independent of table filters.</p>
  </section>;
}
