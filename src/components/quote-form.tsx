"use client";
import Link from "next/link";
import { useId, useRef, useState, type FormEvent } from "react";
import { coverageLabels, coverageOptions } from "@/lib/content";
import { Icon } from "./icon";

export function QuoteForm({ callback = false, initialCoverage = "" }: { callback?: boolean; initialCoverage?: string }) {
  const id = useId();
  const [ready, setReady] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);
  const buttonText = callback ? "Request A Call" : "Get My Free Quote";
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Frontend handoff: connect the validated FormData to the approved backend here.
    // No fetch, analytics event, browser storage, or external transmission occurs.
    setReady(true);
    requestAnimationFrame(() => statusRef.current?.focus());
  }
  return <div className="quote-card" id="quote-form"><div className="quote-card-top"><span className="form-kicker"><Icon name="shield" size={18} /> YOUR NEXT CHAPTER STARTS HERE</span><h2>{callback ? "Let’s find a time to talk." : "A little peace of mind starts here."}</h2><p>{callback ? "Share a few details for a conversation about your options." : "Tell us a little about yourself to explore personalized options."}</p></div>
    <form onSubmit={onSubmit} className="quote-form">
      <div className="form-grid">
        <div className="field"><label htmlFor={`${id}-first`}>First name <span>*</span></label><input id={`${id}-first`} name="first_name" type="text" autoComplete="given-name" required maxLength={80} placeholder="First name" /></div>
        <div className="field"><label htmlFor={`${id}-last`}>Last name <span>*</span></label><input id={`${id}-last`} name="last_name" type="text" autoComplete="family-name" required maxLength={80} placeholder="Last name" /></div>
        <div className="field"><label htmlFor={`${id}-email`}>Email address <span>*</span></label><input id={`${id}-email`} name="email" type="email" autoComplete="email" required maxLength={254} placeholder="you@example.com" /></div>
        <div className="field"><label htmlFor={`${id}-phone`}>Phone number <span>*</span></label><input id={`${id}-phone`} name="phone" type="tel" autoComplete="tel" required pattern={String.raw`(?:\+?1[\s.\-]?)?\(?[0-9]{3}\)?[\s.\-]?[0-9]{3}[\s.\-]?[0-9]{4}`} title="Enter a 10-digit US phone number, with an optional +1 country code." placeholder="(555) 123-4567" maxLength={20} /></div>
        <div className="field"><label htmlFor={`${id}-zip`}>ZIP code <span>*</span></label><input id={`${id}-zip`} name="zipcode" type="text" autoComplete="postal-code" inputMode="numeric" pattern="[0-9]{5}(-[0-9]{4})?" title="Enter a 5-digit ZIP code or ZIP+4, such as 10001 or 10001-1234." required maxLength={10} placeholder="e.g. 10001" /></div>
        <div className="field"><label htmlFor={`${id}-coverage`}>Type of coverage <span>*</span></label><div className="select-wrap"><select id={`${id}-coverage`} name="interest_product" defaultValue={coverageOptions.some(value => value === initialCoverage) ? initialCoverage : ""} required><option value="" disabled>Select an option</option>{coverageOptions.map(option => <option key={option} value={option}>{coverageLabels[option]}</option>)}</select><Icon name="chevron" size={17} /></div></div>
        <div className="field field-full"><label htmlFor={`${id}-message`}>{callback ? "How can we help?" : "Anything else we should know?"} <span className="optional">(optional)</span></label><textarea id={`${id}-message`} name="message" maxLength={2500} rows={3} placeholder="For example: desired coverage amount or health details." /></div>
      </div>
      <input type="hidden" name="leadid_token" value="" /><input type="hidden" name="trustedform_url" value="" />
      <label className="consent"><input type="checkbox" name="consent" value="1" required /><span>By clicking &quot;{buttonText}&quot;, you agree to the <Link href="/legal#terms">Terms & Conditions</Link>, <Link href="/legal#privacy">Privacy Policy</Link>, and <Link href="/legal#tcpa">TCPA disclosure</Link> available on our Legal page and authorize TheSafeQuote and its marketing partners to contact you at the phone number and email address you provided, including by live agents, automated telephone dialing systems, pre-recorded or artificial voice messages, and text messages, even if your number is on a Do Not Call list. Message and data rates may apply. Your consent is not a condition of purchase and you may opt out at any time.</span></label>
      <button className="button form-submit" type="submit">{buttonText}<Icon name="arrow" size={20} /></button>
      <p className="form-reassurance"><Icon name="lock" size={13} /> Your information is handled in line with our <Link href="/legal#privacy">Privacy Policy</Link>.</p>
      <p className="form-preview-note">Website preview · Requests are not sent</p>
      {ready && <div className="form-status" role="status" tabIndex={-1} ref={statusRef}><Icon name="checks" size={23} /><div><strong>Your form is ready.</strong><p>This is a website preview. Your details passed validation, but no information has been sent or saved.</p></div><button type="button" aria-label="Dismiss preview message" onClick={() => setReady(false)}><Icon name="close" size={18} /></button></div>}
    </form>
  </div>;
}
