import { z } from "zod";
import { normalizeText, plainText } from "./plain-text";

export const fieldTypes = ["text", "email", "tel", "number", "date", "select", "textarea", "checkbox"] as const;
export const fieldSchema = z.object({
  id: z.string().regex(/^[a-z][a-z0-9_]{0,63}$/),
  label: plainText(100).refine(value => value.length > 0, "This field is required."),
  placeholder: plainText(150).default(""),
  type: z.enum(fieldTypes),
  required: z.boolean(),
  options: z.array(plainText(100).refine(value => value.length > 0, "Provide an option.")).max(50).default([]),
  width: z.enum(["half", "full"]).default("half"),
}).strict();
export type FormField = z.infer<typeof fieldSchema>;
export type Answers = Record<string, string | boolean>;
export type PublishedForm = { version: number; fields: FormField[] };
export const fieldsSchema = z.array(fieldSchema).min(1).max(30).superRefine((fields, ctx) => {
  const ids = new Set<string>();
  for (const [i, field] of fields.entries()) {
    if (ids.has(field.id) || ["consent", "website", "__proto__", "constructor", "prototype"].includes(field.id)) {
      ctx.addIssue({ code: "custom", path: [i, "id"], message: "Use a unique field ID." });
    }
    ids.add(field.id);
    if (field.type === "select" && (!field.options.length || new Set(field.options).size !== field.options.length)) {
      ctx.addIssue({ code: "custom", path: [i, "options"], message: "Provide unique dropdown options." });
    }
  }
});

export const defaultFields: FormField[] = [
  { id: "first_name", label: "First name", placeholder: "First name", type: "text", required: true, options: [], width: "half" },
  { id: "last_name", label: "Last name", placeholder: "Last name", type: "text", required: true, options: [], width: "half" },
  { id: "email", label: "Email address", placeholder: "you@example.com", type: "email", required: true, options: [], width: "half" },
  { id: "phone", label: "Phone number", placeholder: "(555) 123-4567", type: "tel", required: true, options: [], width: "half" },
  { id: "zipcode", label: "ZIP code", placeholder: "e.g. 10001", type: "text", required: true, options: [], width: "half" },
  { id: "interest_product", label: "Type of coverage", placeholder: "Select an option", type: "select", required: true, options: ["Final Expense", "Burial Insurance", "Cremation Plan", "Medicare Advantage", "Medicare Supplement", "Hospital Indemnity Insurance", "Dental & Vision Coverage", "Cancer Insurance", "Other"], width: "half" },
  { id: "message", label: "Anything else we should know?", placeholder: "Tell us how we can help.", type: "textarea", required: false, options: [], width: "full" },
];

export const leadStatuses = ["new", "contacted", "qualified", "closed"] as const;
export const consentVersion = "2026-10-10-v2";
export function consentText(button: string) {
  return `By clicking "${button}", you agree to the Terms & Conditions, Privacy Policy, and TCPA disclosure available on our Legal page and authorize TheSafeQuote and its marketing partners to contact you at the phone number and email address you provided, including by live agents, automated telephone dialing systems, pre-recorded or artificial voice messages, and text messages, even if your number is on a Do Not Call list. Message and data rates may apply. Your consent is not a condition of purchase and you may opt out at any time.`;
}

export function validateAnswers(fields: FormField[], input: unknown): { answers: Answers; errors: Record<string, string> } {
  if (!input || typeof input !== "object" || Array.isArray(input) || Object.keys(input).some(id => ["__proto__", "constructor", "prototype"].includes(id))) return { answers: {}, errors: { form: "The form has changed. Refresh it and try again." } };
  const parsed = z.record(z.string(), z.union([z.string().max(2500), z.boolean()])).safeParse(input);
  if (!parsed.success) return { answers: {}, errors: { form: "Please check your form entries." } };
  const errors: Record<string, string> = {};
  const answers: Answers = {};
  for (const field of fields) {
    const raw = parsed.data[field.id];
    const value = field.type === "checkbox" ? raw === true : typeof raw === "string" ? normalizeText(raw) : "";
    answers[field.id] = value;
    if (raw !== undefined && (field.type === "checkbox" ? typeof raw !== "boolean" : typeof raw !== "string")) { errors[field.id] = "Invalid field value."; continue; }
    if (typeof value === "string" && /[<>]/.test(value)) { errors[field.id] = "Use plain text without HTML or angle brackets."; continue; }
    if (field.required && !value) { errors[field.id] = `${field.label} is required.`; continue; }
    if (typeof value !== "string" || !value) continue;
    if (value.length > (field.type === "textarea" ? 2500 : 254)) errors[field.id] = "This entry is too long.";
    if (field.type === "email" && !z.email().safeParse(value).success) errors[field.id] = "Enter a valid email address.";
    if (field.type === "tel" && !/^(?:\+?1[\s.\-]?)?\(?[0-9]{3}\)?[\s.\-]?[0-9]{3}[\s.\-]?[0-9]{4}$/.test(value)) errors[field.id] = "Enter a 10-digit US phone number.";
    if (field.type === "select" && !field.options.includes(value)) errors[field.id] = "Choose an available option.";
    if (field.type === "number" && (!/^-?\d+(\.\d+)?$/.test(value) || !Number.isFinite(Number(value)))) errors[field.id] = "Enter a valid number.";
    if (field.type === "date" && (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value)) || new Date(value).toISOString().slice(0, 10) !== value)) errors[field.id] = "Enter a valid date.";
    if (field.id === "zipcode" && !/^\d{5}(-\d{4})?$/.test(value)) errors[field.id] = "Enter a US ZIP code.";
  }
  if (Object.keys(parsed.data).some(id => !fields.some(field => field.id === id))) errors.form = "The form has changed. Refresh it and try again.";
  return { answers, errors };
}
