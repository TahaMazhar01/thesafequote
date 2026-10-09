import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import test from "node:test";
import { Pool } from "pg";
import { betterAuth } from "better-auth";
import { authOptions } from "../src/lib/auth-options";
import { fieldsSchema, validateAnswers, defaultFields, type FormField } from "../src/lib/forms";

test("dynamic validation rejects unexpected fields, invalid values and duplicate IDs", () => {
  assert.equal(fieldsSchema.safeParse([...defaultFields, defaultFields[0]]).success, false);
  assert.equal(fieldsSchema.safeParse([{ ...defaultFields[0], id: "constructor" }]).success, false);
  const result = validateAnswers(defaultFields, { first_name: " ", email: "bad", phone: "12", zipcode: "x", interest_product: "unknown", extra: "value" });
  for (const field of ["first_name", "email", "phone", "zipcode", "interest_product", "form"]) assert.ok(result.errors[field]);
});

test("local PostgreSQL and API: access control, submissions, pagination, field publishing and lead edits", async () => {
  const database = new URL(process.env.DATABASE_URL || "");
  assert.ok(["127.0.0.1", "localhost"].includes(database.hostname) && database.pathname === "/fa_local", "Integration test is restricted to the project's local test database.");
  const origin = process.env.BETTER_AUTH_URL || "http://127.0.0.1:3000";
  assert.ok(["127.0.0.1", "localhost"].includes(new URL(origin).hostname));
  const pool = new Pool({ connectionString: process.env.MIGRATION_DATABASE_URL || process.env.DATABASE_URL, max: 2 });
  const auth = betterAuth(authOptions(pool, true));
  const email = `test-${randomUUID()}@example.com`;
  const password = randomBytes(24).toString("base64url");
  const users: string[] = [];
  const requests: string[] = [];
  let cookie = "";
  let original: { version: number; fields: typeof defaultFields } | undefined;
  let publishedVersion: number | undefined;
  const call = async (path: string, method = "GET", body?: unknown, session = cookie, requestOrigin = origin) => {
    const response = await fetch(`${origin}${path}`, { method, headers: { "Content-Type": "application/json", Origin: requestOrigin, ...(session ? { Cookie: session } : {}) }, body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(15_000) });
    const value = await response.json().catch(() => ({}));
    return { response, value };
  };
  try {
    assert.equal((await call("/api/admin/leads", "GET", undefined, "")).response.status, 401);
    assert.equal((await call("/api/admin/form", "PUT", {}, "", "https://wrong.example")).response.status, 403);
    assert.ok((await call("/api/auth/sign-up/email", "POST", { email, password, name: "Blocked signup" }, "")).response.status >= 400);
    const user = await auth.api.signUpEmail({ body: { email, password, name: "Integration Test" } });
    users.push(user.user.id);
    const signIn = await call("/api/auth/sign-in/email", "POST", { email, password }, "");
    assert.equal(signIn.response.status, 200);
    const cookies = signIn.response.headers.getSetCookie();
    assert.ok(cookies.some(value => /httponly/i.test(value)));
    cookie = cookies.map(value => value.split(";")[0]).join("; ");
    assert.equal((await call("/api/admin/leads")).response.status, 403, "Authentication alone does not grant admin access");
    await pool.query("INSERT INTO fa_admins (user_id) VALUES ($1)", [user.user.id]);
    original = (await call("/api/admin/form")).value;
    assert.ok(original && original.version > 0);
    const answers = { first_name: "Backend", last_name: "Test", email, phone: "2025550123", zipcode: "10001", interest_product: "Medicare Advantage", message: "Synthetic integration test" };
    const requestId = randomUUID(); requests.push(requestId);
    const body = { requestId, version: original.version, source: "quote", answers, consent: true, website: "" };
    assert.equal((await call("/api/leads", "POST", { ...body, answers: { ...answers, email: "bad" } }, "")).response.status, 422);
    assert.equal((await call("/api/leads", "POST", { ...body, consent: false }, "")).response.status, 400);
    assert.equal((await call("/api/leads", "POST", { ...body, website: "spam" }, "")).response.status, 400);
    assert.equal((await call("/api/leads", "POST", body, "")).response.status, 201);
    assert.equal((await call("/api/leads", "POST", body, "")).response.status, 201);
    assert.equal((await call("/api/leads", "POST", { ...body, answers: { ...answers, first_name: "Changed" } }, "")).response.status, 409);
    const records = await pool.query("SELECT id, consent_text FROM fa_leads WHERE request_id = $1", [requestId]);
    assert.equal(records.rowCount, 1, "A retry must not create a duplicate");
    assert.match(records.rows[0].consent_text, /Get My Free Quote/);
    const id = records.rows[0].id;
    for (let i = 0; i < 3; i++) {
      const nextId = randomUUID(); requests.push(nextId);
      assert.equal((await call("/api/leads", "POST", { ...body, requestId: nextId }, "")).response.status, 201);
    }
    const page = (await call(`/api/admin/leads?limit=2&search=${encodeURIComponent(email)}`)).value;
    assert.equal(page.leads.length, 2);
    assert.ok(page.nextCursor);
    const next = (await call(`/api/admin/leads?limit=2&search=${encodeURIComponent(email)}&cursor=${page.nextCursor}`)).value;
    assert.equal(next.leads.length, 2);
    assert.equal(new Set([...page.leads, ...next.leads].map(lead => lead.id)).size, 4);
    assert.equal((await call("/api/admin/leads?limit=500")).response.status, 400);
    assert.equal((await call("/api/admin/leads?search=%27%20OR%201%3D1--")).value.leads.length, 0);
    const lead = (await call(`/api/admin/leads/${id}`)).value;
    const edit = { revision: lead.revision, status: "contacted", notes: "Called during test", archived: false, answers: lead.answers };
    assert.equal((await call(`/api/admin/leads/${id}`, "PATCH", edit)).response.status, 200);
    assert.equal((await call(`/api/admin/leads/${id}`, "PATCH", edit)).response.status, 409);
    const current = (await call(`/api/admin/leads/${id}`)).value;
    assert.equal(current.status, "contacted");
    assert.equal((await call(`/api/admin/leads/${id}`, "PATCH", { ...edit, revision: current.revision, archived: true })).response.status, 200);
    assert.equal((await call(`/api/admin/leads?archived=true&search=${encodeURIComponent(email)}`)).value.leads.length, 1);
    const fields = original.fields.filter(field => field.id !== "message").map(field => field.id === "first_name" ? { ...field, label: "Given name", placeholder: "Your given name" } : field);
    fields.push({ id: "preferred_time", label: "Preferred time", placeholder: "Morning or afternoon", type: "text", required: false, options: [], width: "half" });
    const publish = await call("/api/admin/form", "PUT", { version: original.version, fields });
    assert.equal(publish.response.status, 200);
    publishedVersion = publish.value.version;
    assert.equal((await call("/api/admin/form", "PUT", { version: original.version, fields })).response.status, 409);
    const publicForm = (await call("/api/form", "GET", undefined, "")).value;
    assert.equal(publicForm.fields[0].label, "Given name");
    assert.ok(publicForm.fields.some((field: FormField) => field.id === "preferred_time"));
    const freshId = randomUUID(); requests.push(freshId);
    assert.equal((await call("/api/leads", "POST", { ...body, requestId: freshId }, "")).response.status, 409);
    const historical = (await call(`/api/admin/leads/${id}`)).value;
    assert.ok(historical.fields.some((field: FormField) => field.id === "message"));
    assert.equal(historical.fields[0].label, "First name");
    const columns = (await call("/api/admin/leads")).value.columns;
    assert.ok(columns.some((column: FormField) => column.id === "preferred_time"));
    assert.ok(!columns.some((column: FormField) => column.id === "message"));
    console.log("Verified authentication, authorization, validation, idempotency, cursor pagination, edit conflicts, archives, dynamic columns and historical schema preservation.");
  } finally {
    if (publishedVersion && original) {
      const restored = await call("/api/admin/form", "PUT", { version: publishedVersion, fields: original.fields });
      assert.equal(restored.response.status, 200, "Restore only this test's form revision");
    }
    if (cookie) {
      await call("/api/auth/sign-out", "POST", {});
      assert.equal((await call("/api/admin/leads")).response.status, 401, "Sign out revokes the session");
    }
    // Delete only synthetic records created by this test in the guarded local DB.
    await pool.query("DELETE FROM fa_leads WHERE request_id = ANY($1::uuid[])", [requests]);
    for (const user of users) {
      await pool.query("UPDATE fa_form_versions SET created_by = NULL WHERE created_by = $1", [user]);
      await pool.query('DELETE FROM "user" WHERE id = $1', [user]);
    }
    await pool.end();
  }
});
