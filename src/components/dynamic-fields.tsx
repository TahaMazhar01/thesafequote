"use client";
import type { Answers, FormField } from "@/lib/forms";

export function DynamicFields({ fields, prefix, values, errors = {}, onChange }: {
  fields: FormField[]; prefix: string; values: Answers; errors?: Record<string, string>;
  onChange: (id: string, value: string | boolean) => void;
}) {
  return <div className="form-grid">{fields.map(field => {
    const id = `${prefix}-${field.id}`;
    const common = { id, name: field.id, required: field.required, "aria-invalid": Boolean(errors[field.id]), "aria-describedby": errors[field.id] ? `${id}-error` : undefined };
    const value = typeof values[field.id] === "string" ? values[field.id] as string : "";
    return <div className={`field ${field.width === "full" || field.type === "checkbox" ? "field-full" : ""}`} key={field.id}>
      {field.type === "checkbox" ? <label className="dynamic-checkbox"><input {...common} type="checkbox" checked={values[field.id] === true} onChange={e => onChange(field.id, e.target.checked)} />{field.label}{field.required && " *"}</label> : <>
        <label htmlFor={id}>{field.label}{field.required ? <span> *</span> : <span className="optional"> (optional)</span>}</label>
        {field.type === "select" ? <select {...common} value={value} onChange={e => onChange(field.id, e.target.value)}><option value="">{field.placeholder || "Select an option"}</option>{field.options.map(option => <option key={option} value={option}>{option}</option>)}</select>
          : field.type === "textarea" ? <textarea {...common} value={value} placeholder={field.placeholder} maxLength={2500} rows={3} onChange={e => onChange(field.id, e.target.value)} />
          : <input {...common} type={field.type} value={value} placeholder={field.placeholder} maxLength={254} autoComplete={({ first_name: "given-name", last_name: "family-name", email: "email", phone: "tel", zipcode: "postal-code" } as Record<string, string>)[field.id]} onChange={e => onChange(field.id, e.target.value)} />}
      </>}
      {errors[field.id] && <small className="field-error" id={`${id}-error`}>{errors[field.id]}</small>}
    </div>;
  })}</div>;
}
