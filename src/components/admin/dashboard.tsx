"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { ArrowLeft, ArrowRight, PanelLeftClose, PanelLeftOpen, Home, ExternalLink, FileSliders, Inbox, LogOut, RefreshCw, ShieldCheck, Trash2, RotateCcw, X } from "lucide-react";
import { leadStatuses, type Answers, type FormField } from "@/lib/forms";
import { DynamicFields } from "@/components/dynamic-fields";
import { NotificationProvider, useNotification } from "./notifications";
import { LeadDownload } from "./lead-download";
import { LeadStats } from "./lead-stats";
const BlogManager = dynamic(() => import("./blog-manager").then(module => module.BlogManager));
const FormBuilder = dynamic(() => import("./form-builder").then(module => module.FormBuilder), { loading: () => <p>Loading form builder…</p> });

type LeadRow = { id: string; first_name: string | null; last_name: string | null; values: Answers; status: string; source: string; created_at: string; archived_at: string | null; revision: number; deleted_at: string | null; deleted_by_email: string | null };
type Lead = LeadRow & { fields: FormField[]; answers: Answers; notes: string; revision: number; consent_at: string; consent_text: string; form_version: number };
export async function adminRequest(url: string, options?: RequestInit) {
  const response = await fetch(url, { cache: "no-store", ...options, headers: { "Content-Type": "application/json", ...options?.headers }, signal: options?.signal || AbortSignal.timeout(15_000) });
  if (response.status === 401) { window.location.reload(); throw new Error("Your session has expired. Please sign in again."); }
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Unable to complete this request.");
  return result;
}

export function Dashboard({ email }: { email: string }) {
  const router = useRouter();
  const [tab, setTab] = useState<"leads" | "form" | "blog">("leads");
  const [collapsed, setCollapsed] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const [builderOpened, setBuilderOpened] = useState(false);
  const [blogOpened, setBlogOpened] = useState(false);
  async function signOut() {
    try { await adminRequest("/api/auth/sign-out", { method: "POST", body: "{}" }); router.replace("/admin/login"); router.refresh(); }
    catch { setLogoutError("Unable to sign out. Please try again."); }
  }
  return <NotificationProvider><div className={`admin-shell${collapsed ? " admin-shell-collapsed" : ""}`}><aside className="admin-sidebar" id="workspace-sidebar"><Link className="admin-wordmark" href="/" title="The Safe Quote home"><Image src="/images/logo/logo.png" alt="The Safe Quote" width={180} height={54} priority /><Home className="admin-compact-brand" size={25}/><span className="sr-only">Home</span></Link><Link className="admin-home-link" href="/" title="Back to home"><ArrowLeft size={18}/><span>Back to home</span></Link><p className="admin-nav-label">WORKSPACE</p><nav aria-label="Admin navigation"><button title="Leads" aria-label="Leads" className={tab === "leads" ? "active" : ""} onClick={() => setTab("leads")}><Inbox size={19} /><span>Leads</span></button><button title="Form builder" aria-label="Form builder" className={tab === "form" ? "active" : ""} onClick={() => { setBuilderOpened(true); setTab("form"); }}><FileSliders size={19} /><span>Form builder</span></button><button title="Blog articles" aria-label="Blog articles" className={tab === "blog" ? "active" : ""} onClick={() => { setBlogOpened(true); setTab("blog"); }}><FileSliders size={19} /><span>Blog articles</span></button></nav><div className="admin-sidebar-bottom"><Link href="/" target="_blank" title="View website" aria-label="View website"><ExternalLink size={18}/><span className="admin-nav-text">View website</span></Link><span className="admin-account-email">{email}</span><button onClick={signOut} title="Sign out" aria-label="Sign out"><LogOut size={18}/><span className="admin-nav-text">Sign out</span></button>{logoutError && <p role="alert">{logoutError}</p>}</div></aside><div className="admin-content"><header className="admin-topbar"><div className="admin-topbar-start"><button className="admin-sidebar-toggle" onClick={() => setCollapsed(value => !value)} aria-expanded={!collapsed} aria-controls="workspace-sidebar" aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>{collapsed ? <PanelLeftOpen size={21}/> : <PanelLeftClose size={21}/>}</button><span>YOUR BUSINESS, ORGANIZED</span></div><span className="admin-secure"><ShieldCheck size={15} />Private workspace</span></header>{tab === "leads" && <Leads email={email} />}{builderOpened && <div hidden={tab !== "form"}><FormBuilder /></div>}{blogOpened && <div hidden={tab !== "blog"}><BlogManager /></div>}</div></div></NotificationProvider>;
}

function leadName(lead: LeadRow) { return [lead.first_name, lead.last_name].filter(Boolean).join(" ") || "this enquiry"; }

function Leads({ email }: { email: string }) {
  const [data, setData] = useState<{ leads: LeadRow[]; columns: Pick<FormField, "id" | "label" | "type">[]; nextCursor: string | null; timezone?: string; refreshedAt?: string }>({ leads: [], columns: [], nextCursor: null });
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState({ search: "", status: "", view: "active", range: "all", from: "", to: "" });
  const [dateDraft, setDateDraft] = useState({from:"",to:""});
  const [cursors, setCursors] = useState<string[]>([""]);
  const [revision, setRevision] = useState(0);
  const [busy, setBusy] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState("");
  const { notify, dismiss } = useNotification();
  const [selected, setSelected] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<LeadRow | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const actionLock = useRef(false);
  const cursor = cursors.at(-1) || "";
  useEffect(() => { if (deleting) dialog.current?.showModal(); }, [deleting]);
  useEffect(() => {
    const controller = new AbortController();
    let alive = true;
    async function load() {
      setBusy(true); setError("");
      try {
        const params = new URLSearchParams({ search: filter.search, status: filter.status, archived: String(filter.view === "archived"), deleted: String(filter.view === "trash"), range: filter.range === "custom" && (!filter.from || !filter.to) ? "all" : filter.range, from: filter.from, to: filter.to, cursor });
        const result = await adminRequest("/api/admin/leads", { method:"POST", body:JSON.stringify(Object.fromEntries(params)), signal: controller.signal });
        if (alive) setData(result);
      } catch (error) { if (alive && !controller.signal.aborted) setError(error instanceof Error ? error.message : "Unable to load leads."); }
      finally { if (alive) setBusy(false); }
    }
    void load();
    return () => { alive = false; controller.abort(); };
  }, [filter, cursor, revision]);
  function appliedDates(range:string,dates:{from:string;to:string}) { return range==="time" ? {from:new Date(dates.from).toISOString(),to:new Date(dates.to).toISOString()} : dates; }
  function applySearch(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setCursors([""]); setSelected(null); setFilter(current => ({ ...current, search })); }
  async function updateRow(lead: LeadRow, change: { status: string } | { action: "delete" | "restore" }) {
    if (actionLock.current) return;
    actionLock.current = true; setSaving(lead.id); setError(""); dismiss();
    try {
      await adminRequest(`/api/admin/leads/${lead.id}`, { method: "PATCH", body: JSON.stringify({ revision: lead.revision, ...change }) });
      const message = "status" in change ? `${leadName(lead)}: status changed to ${change.status}.` : change.action === "delete" ? `${leadName(lead)} was deleted by ${email}. You can restore this lead from Trash.` : `${leadName(lead)} was restored by ${email}.`;
      notify({ title: "status" in change ? "Lead status updated" : change.action === "delete" ? "Lead moved to Trash" : "Lead restored", message, action: { label: "Undo", run: async () => {
        await adminRequest(`/api/admin/leads/${lead.id}`, { method: "PATCH", body: JSON.stringify({ revision: lead.revision + 1, ...("status" in change ? {status: lead.status} : {action: change.action === "delete" ? "restore" : "delete"}) }) });
        setRevision(value => value + 1);
      } } }); setDeleting(null); setSelected(null); setRevision(value => value + 1);
    } catch (error) { setError(error instanceof Error ? error.message : "Unable to save this change."); }
    finally { actionLock.current = false; setSaving(null); }
  }
  return <section className="admin-section">
    <div className="admin-title"><div><span className="admin-eyebrow">CONVERSATIONS START HERE</span><h1>Your leads</h1><p>Every enquiry. One clear workspace.</p></div><button className="admin-button secondary" onClick={() => { setSelected(null); setCursors([""]); setRevision(value => value + 1); }} disabled={busy || !!saving}><RefreshCw size={17} />Refresh</button></div>
    <LeadStats revision={revision} />
    <div className="admin-view-tabs" role="group" aria-label="Lead views">{[["active", "Active leads"], ["archived", "Archived"], ["trash", "Trash"]].map(([view, label]) => <button key={view} aria-pressed={filter.view === view} disabled={!!saving} onClick={() => { setCursors([""]); setSelected(null); setFilter(current => ({ ...current, view })); }}>{view === "trash" ? <Trash2 size={17} /> : <Inbox size={17} />}{label}</button>)}</div>
    <div className="admin-toolbar"><form onSubmit={applySearch}><label className="sr-only" htmlFor="lead-search">Search name, email or phone</label><input id="lead-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Name, exact email or phone" maxLength={254} /><button className="admin-button">Search</button></form><label>Filter by status<select value={filter.status} onChange={e => { setCursors([""]); setSelected(null); setFilter(current => ({ ...current, status: e.target.value })); }}><option value="">All statuses</option>{leadStatuses.map(status => <option key={status}>{status}</option>)}</select></label></div>

    <div className="admin-lead-tools"><div className="admin-lead-date-filters"><div className="admin-tool-heading"><strong>Filter by received date</strong><p>Choose the leads to view and download.</p></div><div className="admin-date-controls"><label>Received<select aria-label="Received date filter" value={filter.range} onChange={event=>{setCursors([""]);setSelected(null);const range=event.target.value;const today=new Intl.DateTimeFormat("en-CA",{timeZone:data.timezone||"Asia/Karachi"}).format(new Date());const dates=range==="time"?{from:today+"T00:00",to:today+"T23:59"}:{from:today,to:today};setDateDraft(dates);setFilter(current=>({...current,range,...appliedDates(range,dates)}));}}><option value="all">All dates</option><option value="today">Today</option><option value="yesterday">Yesterday</option><option value="custom">Custom dates</option><option value="time">Date & time</option></select></label>{(filter.range==="custom"||filter.range==="time")&&<form onSubmit={event=>{event.preventDefault();setCursors([""]);setFilter(current=>({...current,...appliedDates(filter.range,dateDraft)}));}}><label>From<input aria-label="Leads from date" type={filter.range==="time"?"datetime-local":"date"} required min="1900-01-01" max={filter.range==="time"?"2100-12-31T23:59":"2100-12-31"} value={dateDraft.from} onInput={event=>{const value=event.currentTarget.value;setDateDraft(current=>({...current,from:value}));}}/></label><label>To<input aria-label="Leads to date" type={filter.range==="time"?"datetime-local":"date"} required min={dateDraft.from||"1900-01-01"} max={filter.range==="time"?"2100-12-31T23:59":"2100-12-31"} value={dateDraft.to} onInput={event=>{const value=event.currentTarget.value;setDateDraft(current=>({...current,to:value}));}}/></label><button className="admin-button" type="submit">Apply dates</button>{filter.range==="time"&&<span>Times use your device timezone. End time is exclusive.</span>}</form>}<button className="admin-button secondary" onClick={()=>{setSearch("");setDateDraft({from:"",to:""});setCursors([""]);setFilter(current=>({...current,search:"",status:"",range:"all",from:"",to:""}));}}>Clear filters</button></div><span>{data.timezone||""}{data.refreshedAt ? " · Updated " + new Date(data.refreshedAt).toLocaleTimeString():""}</span></div>
    <LeadDownload filter={filter} disabled={busy||!!saving}/></div>
    {error && !deleting && <p className="admin-error" role="alert">{error}</p>}
    <div className="admin-table-wrap" aria-busy={busy}><table className="admin-table"><caption className="sr-only">Submitted quote and callback requests</caption>
      <thead><tr><th scope="col">Sr. no.</th>{data.columns.map(column => <th scope="col" key={column.id}>{column.label}</th>)}<th scope="col">Source</th><th scope="col">Received</th>{filter.view === "trash" && <><th scope="col">Deleted by</th><th scope="col">Deleted on</th></>}<th scope="col">Status</th><th scope="col">Actions</th></tr></thead>
      <tbody>{!busy && data.leads.map((lead, index) => <tr key={lead.id}><td className="admin-serial">{(cursors.length - 1) * 25 + index + 1}</td>

        {data.columns.map(column => <td key={column.id} title={String(lead.values[column.id] ?? "")}>{typeof lead.values[column.id] === "boolean" ? lead.values[column.id] ? "Yes" : "No" : lead.values[column.id] || "—"}</td>)}
        <td>{lead.source === "callback" ? "Callback" : "Quote"}</td><td>{new Date(lead.created_at).toLocaleString("en-GB", { timeZone: data.timezone })}</td>
        {filter.view === "trash" && <><td>{lead.deleted_by_email || "Unknown admin"}</td><td>{lead.deleted_at && new Date(lead.deleted_at).toLocaleString()}</td></>}
        <td><select className={`admin-status-select status-${lead.status}`} aria-label={`Status for ${leadName(lead)}`} value={lead.status} disabled={!!saving || !!lead.deleted_at} onChange={e => void updateRow(lead, { status: e.target.value })}>{leadStatuses.map(status => <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>)}</select>{saving === lead.id && <span role="status">Saving…</span>}</td>
        <td><div className="admin-row-actions">{lead.deleted_at ? <button className="admin-open" disabled={!!saving} onClick={() => void updateRow(lead, { action: "restore" })} aria-label={`Restore ${leadName(lead)}`}><RotateCcw size={17} />Restore</button> : <><button className="admin-open" disabled={!!saving} onClick={() => setSelected(lead.id)} aria-label={`Open lead ${leadName(lead)}`}>Details<ArrowRight size={16} /></button><button className="admin-delete" disabled={!!saving} onClick={() => { setError(""); setDeleting(lead); }} aria-label={`Delete ${leadName(lead)}`}><Trash2 size={17} />Delete</button></>}</div></td>
      </tr>)}</tbody></table>
      {busy && <div className="admin-empty" role="status">Loading leads…</div>}{!busy && !error && !data.leads.length && <div className="admin-empty"><Inbox size={36} /><h2>{filter.view === "trash" ? "Trash is empty" : "No leads here yet"}</h2><p>{filter.search || filter.status ? "Try another filter or search." : "Your enquiries will appear here."}</p></div>}
    </div>
    <div className="admin-pagination"><span>Page {cursors.length} · {data.leads.length} leads on this page</span><div><button className="admin-button secondary" disabled={busy || !!saving || cursors.length === 1} onClick={() => setCursors(items => items.slice(0, -1))}><ArrowLeft size={15} />Previous</button><button className="admin-button secondary" disabled={busy || !!saving || Boolean(error) || !data.nextCursor} onClick={() => setCursors(items => [...items, data.nextCursor!])}>Next<ArrowRight size={15} /></button></div></div>
    {selected && <LeadEditor key={selected} id={selected} close={() => setSelected(null)} saved={() => { setSelected(null); setRevision(value => value + 1); }} />}
    {deleting && <dialog ref={dialog} className="admin-confirm" aria-labelledby="delete-title" aria-describedby="delete-description" onCancel={event => { if (saving) event.preventDefault(); else setDeleting(null); }} onClose={() => setDeleting(null)}><div className="admin-delete-symbol"><Trash2 size={26} /></div><h2 id="delete-title">Delete {leadName(deleting)}?</h2><p id="delete-description">This lead will move to Trash. You can restore it later.</p><div className="admin-delete-attribution"><span>Deletion will be recorded under</span><strong>{email}</strong></div>{error && <p className="admin-error" role="alert">{error}</p>}<div className="admin-actions"><button autoFocus className="admin-button secondary" disabled={!!saving} onClick={() => setDeleting(null)}>Keep lead</button><button className="admin-button danger" disabled={!!saving} onClick={() => void updateRow(deleting, { action: "delete" })}>{saving ? "Deleting…" : "Delete lead"}</button></div></dialog>}
  </section>;
}

function LeadEditor({ id, close, saved }: { id: string; close: () => void; saved: () => void }) {
  const { notify } = useNotification();
  const initial = useRef<Lead | null>(null);
  const panel = useRef<HTMLElement>(null);
  const [lead, setLead] = useState<Lead | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    panel.current?.scrollIntoView({ behavior: "instant", block: "start" });
    panel.current?.focus({ preventScroll: true });
    const controller = new AbortController();
    adminRequest(`/api/admin/leads/${id}`, { signal: controller.signal }).then(value => { initial.current = value; setLead(value); }).catch(error => { if (!controller.signal.aborted) setError(error.message); });
    return () => controller.abort();
  }, [id]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!lead) return;
    setBusy(true); setError("");
    try { await adminRequest(`/api/admin/leads/${id}`, { method: "PATCH", body: JSON.stringify({ revision: lead.revision, status: lead.status, notes: lead.notes, archived: Boolean(lead.archived_at), answers: lead.answers }) }); const previous = initial.current!; notify({ title: "Lead details saved", message: "The enquiry details and internal notes have been updated.", action: { label: "Undo", run: async () => { await adminRequest(`/api/admin/leads/${id}`, { method: "PATCH", body: JSON.stringify({revision: lead.revision + 1, status: previous.status, notes: previous.notes, archived: Boolean(previous.archived_at), answers: previous.answers}) }); saved(); } } }); saved(); }
    catch (error) { setError(error instanceof Error ? error.message : "Unable to save."); setBusy(false); }
  }
  return <section ref={panel} tabIndex={-1} className="admin-detail" aria-labelledby="lead-detail-heading"><div className="admin-title"><div><span className="admin-eyebrow">LEAD DETAILS</span><h2 id="lead-detail-heading">Review this enquiry</h2><p>Every field is shown using the form version submitted by this visitor.</p></div><button className="admin-icon-button" onClick={close} aria-label="Close lead details"><X size={22} /></button></div>{error && <p className="admin-error" role="alert">{error}</p>}{!lead ? <p>Loading details…</p> : <form onSubmit={submit}><fieldset disabled={busy}><DynamicFields fields={lead.fields} prefix={`lead-${id}`} values={lead.answers} onChange={(key, value) => setLead({ ...lead, answers: { ...lead.answers, [key]: value } })} /><div className="admin-edit-meta"><label>Status<select value={lead.status} onChange={e => setLead({ ...lead, status: e.target.value })}>{leadStatuses.map(status => <option key={status}>{status}</option>)}</select></label><label className="admin-check"><input type="checkbox" checked={Boolean(lead.archived_at)} onChange={e => setLead({ ...lead, archived_at: e.target.checked ? new Date().toISOString() : null })} />Archive this lead</label></div><label>Internal notes<textarea rows={4} maxLength={5000} value={lead.notes} onChange={e => setLead({ ...lead, notes: e.target.value })} /></label><details className="admin-consent"><summary>Consent record · {new Date(lead.consent_at).toLocaleString()}</summary><p>{lead.consent_text}</p></details><div className="admin-actions"><button className="admin-button" disabled={busy}>{busy ? "Saving…" : "Save changes"}</button><button type="button" className="admin-button secondary" onClick={close}>Cancel</button></div></fieldset></form>}</section>;
}
