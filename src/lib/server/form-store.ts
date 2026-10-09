import "server-only";
import { fieldsSchema, type PublishedForm } from "@/lib/forms";
import { getPool } from "./db";

// Small bounded cache: one public schema, no customer data. Each app process
// refreshes within 30 seconds; concurrent misses share one database request.
let cached: { value: PublishedForm; expires: number } | undefined;
let pending: Promise<PublishedForm> | undefined;
export function clearFormCache() { cached = undefined; }
export async function getPublishedForm(fresh = false): Promise<PublishedForm> {
  if (!fresh && cached && cached.expires > Date.now()) return cached.value;
  if (!fresh && pending) return pending;
  const load = async () => {
    const result = await getPool().query("SELECT v.id, v.fields FROM fa_form_current c JOIN fa_form_versions v ON v.id = c.version_id WHERE c.id = 1");
    if (!result.rows[0]) throw new Error("Form has not been initialized.");
    const value = { version: Number(result.rows[0].id), fields: fieldsSchema.parse(result.rows[0].fields) };
    cached = { value, expires: Date.now() + 30_000 };
    return value;
  };
  if (fresh) return load();
  pending = load();
  try { return await pending; } finally { pending = undefined; }
}
