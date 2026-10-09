"use client";
import Link from "next/link";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { defaultFields, validateAnswers, type Answers, type PublishedForm } from "@/lib/forms";
import { DynamicFields } from "./dynamic-fields";
import { Icon } from "./icon";

export function QuoteForm({ callback = false, initialCoverage = "" }: { callback?: boolean; initialCoverage?: string }) {
  const id = useId();
  const [schema, setSchema] = useState<PublishedForm>({ version: 0, fields: defaultFields });
  const [values, setValues] = useState<Answers>({});
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"loading" | "ready" | "sending" | "success" | "unavailable">("loading");
  const requestId = useRef("");
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const buttonText = "Submit request";
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/form", { signal: AbortSignal.any([controller.signal, AbortSignal.timeout(10_000)]), cache: "no-store" }).then(async response => {
      if (!response.ok) throw new Error("Unable to load the form.");
      const published: PublishedForm = await response.json();
      setSchema(published);
      const field = published.fields.find(item => item.id === "interest_product");
      setValues(field?.options.includes(initialCoverage) ? { interest_product: initialCoverage } : {});
      requestId.current = crypto.randomUUID();
      setState("ready");
    }).catch(error => {
      if (error.name === "AbortError") return;
      setState("unavailable");
      setMessage("The request form is temporarily unavailable. Please refresh the page or try again shortly.");
    });
    return () => controller.abort();
  }, [initialCoverage]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state !== "ready") return;
    const validation = validateAnswers(schema.fields, values);
    if (!consent) validation.errors.consent = "Please review and accept the contact consent.";
    setErrors(validation.errors);
    if (Object.keys(validation.errors).length) {
      setMessage("Please check the highlighted fields.");
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }
    setState("sending");
    setMessage("");
    try {
      const website = new FormData(event.currentTarget).get("website") || "";
      const response = await fetch("/api/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ requestId: requestId.current, version: schema.version, source: callback ? "callback" : "quote", answers: validation.answers, consent, website }), signal: AbortSignal.timeout(15_000) });
      const result = await response.json();
      if (!response.ok) { setErrors(result.errors || {}); throw new Error(result.error || "Please try again shortly."); }
      setState("success");
      setMessage(result.message);
    } catch (error) {
      setState("ready");
      setMessage(error instanceof Error && error.name !== "TimeoutError" ? error.message : "The request took too long. Please retry; duplicate submissions are prevented.");
    }
    requestAnimationFrame(() => statusRef.current?.focus());
  }
  return <div className="quote-card" id="quote-form">
    <div className="quote-card-top"><span className="form-kicker"><Icon name="shield" size={18} /> YOUR NEXT CHAPTER STARTS HERE</span><h2>{callback ? "Let’s find a time to talk." : "A little peace of mind starts here."}</h2><p>{callback ? "Share a few details for a conversation about your options." : "Tell us a little about yourself to explore personalized options."}</p></div>
    {state !== "success" && <form ref={formRef} onSubmit={onSubmit} className="quote-form">
      <fieldset disabled={state !== "ready"} className="dynamic-fieldset">
        <DynamicFields fields={schema.fields} prefix={id} values={values} errors={errors} onChange={(key, value) => setValues(current => ({ ...current, [key]: value }))} />
        <div className="form-honeypot" aria-hidden="true"><label htmlFor={`${id}-website`}>Website<input id={`${id}-website`} name="website" autoComplete="off" tabIndex={-1} /></label></div>
        <label className="consent"><input type="checkbox" name="consent" checked={consent} onChange={e => setConsent(e.target.checked)} required aria-invalid={Boolean(errors.consent)} /><span>By clicking &quot;{buttonText}&quot;, you agree to the <Link href="/legal#terms">Terms & Conditions</Link>, <Link href="/legal#privacy">Privacy Policy</Link>, and <Link href="/legal#tcpa">TCPA disclosure</Link> available on our Legal page and authorize TheSafeQuote and its marketing partners to contact you at the phone number and email address you provided, including by live agents, automated telephone dialing systems, pre-recorded or artificial voice messages, and text messages, even if your number is on a Do Not Call list. Message and data rates may apply. Your consent is not a condition of purchase and you may opt out at any time.</span></label>
        {errors.consent && <p className="field-error">{errors.consent}</p>}
        <button className="button form-submit" type="submit">{state === "sending" ? "Sending your request…" : state === "loading" ? "Loading form…" : buttonText}<Icon name="arrow" size={20} /></button>
      </fieldset>
      <p className="form-reassurance"><Icon name="lock" size={13} /> Your information is handled in line with our <Link href="/legal#privacy">Privacy Policy</Link>.</p>
    </form>}
    {message && <div className={`form-status ${state === "success" ? "" : "form-error"}`} role={state === "success" ? "status" : "alert"} tabIndex={-1} ref={statusRef}><Icon name={state === "success" ? "checks" : "message"} size={23} /><div><strong>{state === "success" ? "Form submitted successfully." : "Please check your request."}</strong><p>{message}</p></div></div>}
  </div>;
}
