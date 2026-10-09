"use client";
import { useEffect, useRef, useState } from "react";
import { GripVertical, Eye, Pencil, Plus, Save, Trash2 } from "lucide-react";
import { fieldsSchema, fieldTypes, type Answers, type FormField, type PublishedForm } from "@/lib/forms";
import { DynamicFields } from "@/components/dynamic-fields";
import { useNotification } from "./notifications";
import { adminRequest } from "./dashboard";

export function FormBuilder() {
  const { notify, dismiss } = useNotification();
  const [schema, setSchema] = useState<PublishedForm | null>(null);
  const [original, setOriginal] = useState("");
  const [preview, setPreview] = useState<Answers>({});
  const [editMode, setEditMode] = useState(false);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const drag = useRef<{ source: string; target: string } | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    adminRequest("/api/admin/form", { signal: controller.signal }).then((value: PublishedForm) => { setSchema(value); setOriginal(JSON.stringify(value.fields)); }).catch(error => { if (!controller.signal.aborted) setError(error.message); });
    return () => controller.abort();
  }, []);
  const dirty = schema && JSON.stringify(schema.fields) !== original;
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  function edit(index: number, change: Partial<FormField>) {
    if (!schema) return;
    dismiss();
    setSchema({ ...schema, fields: schema.fields.map((field, i) => i === index ? { ...field, ...change } : field) });
  }
  function move(index: number, target: number) {
    if (!schema || busy || target < 0 || target >= schema.fields.length || index === target) return;
    const fields = [...schema.fields];
    const [field] = fields.splice(index, 1);
    fields.splice(target, 0, field);
    notify({title:"Field order updated",message:`${field.label} moved to position ${target + 1}. Publish to save this order.`,action:{label:"Undo",run:()=>setSchema(schema)}});
    setSchema({ ...schema, fields });
  }
  async function publish() {
    if (!schema) return;
    const parsed = fieldsSchema.safeParse(schema.fields);
    if (!parsed.success) { setError(parsed.error.issues.map(issue => `Field ${Number(issue.path[0]) + 1}: ${issue.message}`).join(" ")); return; }
    setBusy(true); setError(""); dismiss();
    try {
      const value: PublishedForm = await adminRequest("/api/admin/form", { method: "PUT", body: JSON.stringify({ ...schema, fields: parsed.data }) });
      setSchema(value); setOriginal(JSON.stringify(value.fields));
      notify({ title: "Form published", message: "Your updated fields are now available for new enquiries.", action: { label: "Undo", run: async () => { const restored: PublishedForm = await adminRequest("/api/admin/form", {method:"PUT",body:JSON.stringify({version:value.version,fields:JSON.parse(original)})}); setSchema(restored); setOriginal(JSON.stringify(restored.fields)); } } });
    } catch (error) { setError(error instanceof Error ? error.message : "Unable to publish."); }
    finally { setBusy(false); }
  }
  return <section className="admin-section"><div className="admin-title"><div><span className="admin-eyebrow">MAKE EVERY QUESTION COUNT</span><h1>Form builder</h1><p>Manage the fields shared by your quote and callback forms.</p></div><button className="admin-button" disabled={!dirty || busy} onClick={publish}><Save size={17} />{busy ? "Publishing…" : "Publish changes"}</button></div>{error && <p className="admin-error" role="alert">{error}</p>}{!schema ? <p>Loading form configuration…</p> : <>
    <div className="admin-builder-note"><span>Version {schema.version} · {schema.fields.length}/30 fields{dirty ? " · Unpublished changes" : " · Published"}</span><p>Removing a field only changes future submissions. Existing lead details keep their original fields and labels. Contact consent is recorded separately.</p></div>
    <div className="admin-preview admin-inline-builder"><div><Eye size={18} /><strong>Live preview</strong><span>{dirty ? "Unsaved draft" : "Published"}</span><button type="button" className="admin-button secondary" aria-pressed={editMode} disabled={busy} onClick={() => { setEditMode(!editMode); setEditing(null); }}><Pencil size={16} />{editMode ? "Done editing" : "Edit form"}</button></div><p>{editMode ? "Edit a field with its pencil, or drag its handle to change the order." : "This preview does not submit a request."}</p>
    <fieldset disabled={busy}><legend className="sr-only">Editable form preview</legend>{!editMode ? <DynamicFields fields={schema.fields} prefix="preview" values={preview} onChange={(key, value) => setPreview(current => ({ ...current, [key]: value }))} /> : <><div className="admin-canvas-grid">{schema.fields.map((field, index) => <article className={`admin-canvas-field ${field.width === "full" || field.type === "checkbox" ? "field-full" : ""} ${editing === field.id ? "is-editing" : ""} ${dropTarget === field.id ? "is-drop-target" : ""}`} data-field-id={field.id} key={field.id}>
      <div className="admin-canvas-tools"><span>Field {index + 1}</span><div><button type="button" className="admin-icon-button" aria-label={`Edit ${field.label}`} aria-expanded={editing === field.id} aria-controls={`settings-${field.id}`} onClick={() => setEditing(editing === field.id ? null : field.id)}><Pencil size={16} /></button><button type="button" className="admin-icon-button admin-drag-handle" aria-label={`Drag ${field.label} to reorder`} title="Drag to reorder. With keyboard, use arrow keys." onKeyDown={event => { if (["ArrowUp", "ArrowLeft", "ArrowDown", "ArrowRight"].includes(event.key)) { event.preventDefault(); move(index, index + (["ArrowUp", "ArrowLeft"].includes(event.key) ? -1 : 1)); } }} onPointerDown={event => { if (event.button !== 0 || busy) return; event.preventDefault(); event.currentTarget.focus(); event.currentTarget.setPointerCapture(event.pointerId); drag.current = { source: field.id, target: field.id }; setDropTarget(field.id); }} onPointerMove={event => { if (!drag.current) return; const target = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>("[data-field-id]")?.dataset.fieldId; if (target) { drag.current.target = target; setDropTarget(target); } }} onPointerUp={event => { const current = drag.current; drag.current = null; setDropTarget(null); if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); if (current) move(schema.fields.findIndex(item => item.id === current.source), schema.fields.findIndex(item => item.id === current.target)); }} onPointerCancel={() => { drag.current = null; setDropTarget(null); }} onLostPointerCapture={() => { drag.current = null; setDropTarget(null); }}><GripVertical size={18} /></button><button type="button" className="admin-icon-button danger" onClick={() => { setSchema({ ...schema, fields: schema.fields.filter((_, i) => i !== index) }); setEditing(null); notify({title:"Field removed",message:`${field.label} was removed from this draft. Publish to update the website.`,action:{label:"Undo",run:()=>setSchema(schema)}}); }} aria-label={`Remove ${field.label}`}><Trash2 size={16} /></button></div></div>
      <DynamicFields fields={[field]} prefix="preview" values={preview} onChange={(key, value) => setPreview(current => ({ ...current, [key]: value }))} />
      {editing === field.id && <div className="admin-inline-settings" id={`settings-${field.id}`}><h3>Field settings</h3><div className="admin-field-inputs"><label>Field name / label<input value={field.label} maxLength={100} onChange={e => edit(index, { label: e.target.value })} /></label><label>Type<select value={field.type} onChange={e => edit(index, { type: e.target.value as FormField["type"] })}>{fieldTypes.map(type => <option key={type}>{type}</option>)}</select></label><label className="wide">Placeholder<input value={field.placeholder} maxLength={150} onChange={e => edit(index, { placeholder: e.target.value })} /></label>{field.type === "select" && <label className="wide">Dropdown choices — one per line<textarea rows={4} value={field.options.join("\n")} onChange={e => edit(index, { options: e.target.value.split("\n") })} /></label>}<label>Width<select value={field.width} onChange={e => edit(index, { width: e.target.value as FormField["width"] })}><option value="half">Half width</option><option value="full">Full width</option></select></label><label className="admin-check"><input type="checkbox" checked={field.required} onChange={e => edit(index, { required: e.target.checked })} />Required field</label></div><button type="button" className="admin-button secondary" onClick={() => setEditing(null)}>Done</button></div>}
    </article>)}</div><button type="button" className="admin-add-field" disabled={schema.fields.length >= 30} onClick={() => { const id = `field_${crypto.randomUUID().replaceAll("-", "")}`; setSchema({ ...schema, fields: [...schema.fields, { id, label: "New field", placeholder: "", type: "text", required: false, width: "half", options: [] }] }); setEditing(id); notify({title:"Field added",message:"Your new field is ready to edit. Publish when your changes are ready.",action:{label:"Undo",run:()=>{setSchema(schema);setEditing(null);}}}); }}><Plus size={18} />Add a field</button></>}</fieldset>
    <div className="admin-preview-consent">Contact consent and policy links appear below these fields on the website.</div><button className="admin-button" disabled>Submit request</button>
    <div className="admin-actions"><button className="admin-button" disabled={!dirty || busy} onClick={publish}><Save size={16} />{busy ? "Publishing…" : "Publish changes"}</button><button className="admin-button secondary" disabled={!dirty || busy} onClick={() => { setSchema({ ...schema, fields: JSON.parse(original) }); setEditing(null); setError(""); notify({title:"Draft discarded",message:"The form now matches the published version.",action:{label:"Undo",run:()=>setSchema(schema)}}); }}>Discard draft</button></div></div>
  </>}</section>;
}
