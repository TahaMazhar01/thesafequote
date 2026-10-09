"use client";
/* eslint-disable @next/next/no-img-element */
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { RotateCcw, ArrowUpRight } from "lucide-react";

type Notice = { title: string; message: string; action?: { label: string; run?: () => void | Promise<void>; href?: string } };
const Context = createContext<{ notify: (notice: Notice) => void; dismiss: () => void }>({ notify: () => {}, dismiss: () => {} });
export const useNotification = () => useContext(Context);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notice, setNotice] = useState<(Notice & { id: number }) | null>(null);
  const sequence = useRef(0);
  const notify = useCallback((value: Notice) => setNotice({ ...value, id: ++sequence.current }), []);
  const dismiss = useCallback(() => setNotice(null), []);
  return <Context.Provider value={{ notify, dismiss }}>{children}{notice && <Notification key={notice.id} notice={notice} dismiss={() => setNotice(current => current?.id === notice.id ? null : current)} />}</Context.Provider>;
}

function Notification({ notice, dismiss }: { notice: Notice; dismiss: () => void }) {
  const [remaining, setRemaining] = useState(12000);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const locked = useRef(false);
  useEffect(() => {
    if (hovered || focused || busy || error) return;
    let last = performance.now();
    const timer = window.setInterval(() => {
      const now = performance.now();
      const elapsed = now - last;
      last = now;
      if (!document.hidden) setRemaining(value => Math.max(0, value - elapsed));
    }, 50);
    return () => window.clearInterval(timer);
  }, [hovered, focused, busy, error]);
  useEffect(() => { if (remaining === 0) dismiss(); }, [remaining, dismiss]);
  async function act() {
    if (locked.current) return;
    locked.current = true; setBusy(true); setError("");
    try { await notice.action?.run?.(); dismiss(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to complete this action. Please try again."); }
    finally { locked.current = false; setBusy(false); }
  }
  return <aside className="admin-notification" aria-label="Notification" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
    <div className="admin-notification-body" role="status" aria-live="polite"><div className="admin-notification-heading"><span className="admin-notification-bell"><img src="/images/ui/notification-bell.png" width="56" height="56" alt="" /></span><div><span className="admin-notification-kicker">WORKSPACE UPDATE</span><h2>{notice.title}</h2></div></div><p>{notice.message}</p></div>
    {error && <p className="admin-notification-error" role="alert">{error}</p>}
    <div className="admin-notification-actions"><button type="button" disabled={busy} onClick={dismiss}>Dismiss</button>{notice.action && (notice.action.href ? <a href={notice.action.href} target="_blank" rel="noopener noreferrer" onClick={dismiss}>{notice.action.label}<ArrowUpRight size={17}/></a> : <button type="button" disabled={busy} onClick={() => void act()}><RotateCcw size={17}/>{busy ? "Please wait…" : notice.action.label}</button>)}</div>
    <div className="admin-notification-timer" aria-hidden="true"><span style={{ transform: `scaleX(${remaining / 12000})` }}/></div>
  </aside>;
}
