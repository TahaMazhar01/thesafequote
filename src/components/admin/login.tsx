"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";

export function AdminLogin() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/auth/sign-in/email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: data.get("email"), password: data.get("password"), rememberMe: false }), signal: AbortSignal.timeout(15_000) });
      if (!response.ok) throw new Error(response.status === 429 ? "Too many attempts. Please wait a minute." : response.status >= 500 ? "The sign-in service is unavailable. Please try again." : "Check your email and password and try again.");
      router.replace("/admin"); router.refresh();
    } catch (error) { setError(error instanceof Error ? error.message : "Unable to sign in."); setBusy(false); }
  }
  return <div className="login-stage">
    <div className="login-card">
      <section className="login-story" aria-label="The Safe Quote workspace">
        <Link href="/" className="login-brand"><Image src="/images/logo/logo.png" alt="The Safe Quote home" width={210} height={63} priority /></Link>
        <div className="login-story-copy"><span className="login-kicker">CARE BEGINS WITH A CONVERSATION</span><h2>Every connection.<br/><em>A little more peace of mind.</em></h2><p>A thoughtful space to help people plan for the ones they love.</p></div>
        <div className="login-photo"><Image src="/images/admin-welcome.webp" alt="An older couple enjoying a walk together in the park" fill sizes="(max-width: 760px) 90vw, 480px" priority/><span>More moments together.</span></div>
        <svg className="login-wave" viewBox="0 0 100 720" preserveAspectRatio="none" aria-hidden="true"><path fill="#55838a" d="M40 0C16 30 16 60 40 90C64 120 64 150 40 180C16 210 16 240 40 270C64 300 64 330 40 360C16 390 16 420 40 450C64 480 64 510 40 540C16 570 16 600 40 630C64 660 64 690 40 720H100V0Z"/><path fill="#fff" d="M58 0C34 30 34 60 58 90C82 120 82 150 58 180C34 210 34 240 58 270C82 300 82 330 58 360C34 390 34 420 58 450C82 480 82 510 58 540C34 570 34 600 58 630C82 660 82 690 58 720H100V0Z"/></svg>
      </section>
      <section className="login-form-panel" aria-labelledby="login-title">
        <Link href="/" className="login-home"><ArrowLeft size={17}/>Back to website</Link>
        <div className="login-form-content"><span className="login-kicker">ADMIN WORKSPACE</span><h1 id="login-title">Welcome back.</h1><p>Your conversations and content.<br/>All in one place.</p>
          <form onSubmit={submit} aria-busy={busy}>
            <label htmlFor="login-email">Email address</label><div className="login-input"><Mail size={19}/><input id="login-email" name="email" type="email" placeholder="you@company.com" required autoComplete="username" disabled={busy}/></div>
            <label htmlFor="login-password">Password</label><div className="login-input"><LockKeyhole size={19}/><input id="login-password" name="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" required autoComplete="current-password" disabled={busy}/><button className="login-reveal" type="button" aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} onClick={()=>setShowPassword(value=>!value)}>{showPassword ? <EyeOff size={19}/> : <Eye size={19}/>}</button></div>
            {error && <p className="login-error" role="alert">{error}</p>}
            <button className="login-submit" disabled={busy}>{busy ? "Signing in…" : "Sign in to workspace"}<ArrowRight size={19}/></button>
          </form><p className="login-footnote"><LockKeyhole size={14}/>For authorised team members</p>
        </div>
        <span className="login-copyright">The Safe Quote · A thoughtful next step.</span>
      </section>
    </div>
  </div>;
}
