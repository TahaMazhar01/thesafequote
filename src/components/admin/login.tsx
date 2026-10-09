"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

export function AdminLogin() {
  const router = useRouter();
  const [challenge,setChallenge]=useState(false);
  const [recovery,setRecovery]=useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBusy(true); setError("");
    try {
      const response = await fetch(challenge ? (recovery ? "/api/auth/two-factor/verify-backup-code" : "/api/auth/two-factor/verify-totp") : "/api/auth/sign-in/email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(challenge ? { code:data.get("code"), trustDevice:false } : { email: data.get("email"), password: data.get("password"), rememberMe: false }), signal: AbortSignal.timeout(15_000) });
      if (!response.ok) throw new Error(response.status === 429 ? "Too many attempts. Please wait a minute." : response.status >= 500 ? "The sign-in service is unavailable. Please try again." : "Check your email and password and try again.");
      const result=await response.json();
      if(result.twoFactorRedirect){setChallenge(true);setBusy(false);return;}
      router.replace("/admin"); router.refresh();
    } catch (error) { setError(error instanceof Error ? error.message : "Unable to sign in."); setBusy(false); }
  }
  return <div className="admin-login"><Link href="/" className="admin-wordmark"><Image src="/images/logo/logo.png" alt="The Safe Quote" width={210} height={63} priority /></Link><span className="admin-eyebrow">ADMIN WORKSPACE</span><h1>A clearer view<br />of every enquiry.</h1><p>Sign in to manage leads and keep your forms up to date.</p><form onSubmit={submit}>{!challenge ? <><label>Email address<input name="email" type="email" required autoComplete="username" /></label><label>Password<input name="password" type="password" required autoComplete="current-password" /></label></> : <><label>{recovery?"Recovery code":"Authenticator code"}<input name="code" required autoComplete="one-time-code" maxLength={80}/></label><button type="button" className="admin-button secondary" onClick={()=>setRecovery(!recovery)}>{recovery?"Use authenticator":"Use recovery code"}</button></>}{error && <p className="admin-error" role="alert">{error}</p>}<button className="admin-button" disabled={busy}>{busy ? "Signing in…" : "Sign in"}<ArrowRight size={18} /></button></form><Link href="/" className="admin-back">Back to website</Link></div>;
}
