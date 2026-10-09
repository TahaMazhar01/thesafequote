import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import test from "node:test";
import { Pool } from "pg";
import { betterAuth } from "better-auth";
import { authOptions } from "../src/lib/auth-options";

test("inline status and recoverable deletion enforce access, revisions and actor attribution", async () => {
  const database = new URL(process.env.DATABASE_URL || "");
  assert.ok(["127.0.0.1", "localhost"].includes(database.hostname) && database.pathname === "/fa_local");
  const origin = process.env.BETTER_AUTH_URL || "http://127.0.0.1:3000";
  assert.ok(["127.0.0.1", "localhost"].includes(new URL(origin).hostname));
  const pool = new Pool({ connectionString: process.env.MIGRATION_DATABASE_URL || process.env.DATABASE_URL, max: 2 });
  const email = `actions-${randomUUID()}@example.com`;
  const id = randomUUID();
  let userId: string | undefined;
  let cookie = "";
  const call = async (path: string, method = "GET", body?: unknown, session = cookie, requestOrigin = origin) => {
    const response = await fetch(origin + path, { method, headers: { "Content-Type": "application/json", Origin: requestOrigin, Cookie: session }, body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(15000) });
    return { response, data: await response.json() };
  };
  try {
    const password = randomBytes(24).toString("base64url");
    const user = await betterAuth(authOptions(pool, true)).api.signUpEmail({ body: { email, password, name: "Lead actions test" } });
    userId = user.user.id;
    const signIn = await call("/api/auth/sign-in/email", "POST", { email, password }, "");
    assert.equal(signIn.response.status, 200);
    cookie = signIn.response.headers.getSetCookie().map(value => value.split(";")[0]).join("; ");
    assert.equal((await call(`/api/admin/leads/${id}`, "PATCH", { revision: 1, action: "delete" })).response.status, 403);
    await pool.query("INSERT INTO fa_admins (user_id) VALUES ($1)", [userId]);
    assert.equal((await call("/api/admin/stats", "GET", undefined, "")).response.status, 401);
    assert.equal((await call("/api/admin/stats/status", "GET", undefined, "")).response.status, 401);
    assert.equal((await call("/api/admin/stats/status?period=invalid")).response.status, 400);
    for (const period of ["day", "week", "month", "quarter", "year"]) {
      const breakdown = await call(`/api/admin/stats/status?period=${period}`);
      assert.equal(breakdown.response.status, 200);
      assert.equal(breakdown.data.period, period);
      const expected = await pool.query("SELECT status,count(*)::int AS total FROM fa_leads WHERE deleted_at IS NULL AND created_at >= ($1::date::timestamp AT TIME ZONE $2) AND created_at <= now() GROUP BY status", [breakdown.data.start, breakdown.data.timezone]);
      assert.deepEqual(breakdown.data.statuses, Object.fromEntries(expected.rows.map(row => [row.status,row.total])));
      assert.equal(breakdown.data.total, expected.rows.reduce((sum,row)=>sum+row.total,0));
    }
    for (const [period,start,end] of [["day","2026-09-29","2026-09-29"],["week","2026-09-28","2026-10-04"],["month","2026-09-01","2026-09-30"],["quarter","2026-07-01","2026-09-30"],["year","2026-01-01","2026-12-31"]]) {
      const chosen = await call(`/api/admin/stats/status?period=${period}&date=2026-09-29`);
      assert.equal(chosen.response.status,200);assert.equal(chosen.data.start,start);assert.equal(chosen.data.end,end);
      const expected = await pool.query("SELECT count(*)::int AS total FROM fa_leads WHERE deleted_at IS NULL AND created_at >= ($1::date::timestamp AT TIME ZONE $3) AND created_at < (($2::date+1)::timestamp AT TIME ZONE $3) AND created_at <= now()",[start,end,chosen.data.timezone]);
      assert.equal(chosen.data.total,expected.rows[0].total);
    }
    assert.equal((await call("/api/admin/stats/status?date=2026-02-30")).response.status,400);
    const leap = await call("/api/admin/stats/status?period=month&date=2024-02-10");assert.equal(leap.data.end,"2024-02-29");
    assert.equal((await call("/api/admin/stats/compare?date=2026-09-01&date=2026-10-01", "GET", undefined, "")).response.status,401);
    for (const invalid of ["period=day&date=2026-09-01&date=2026-10-01","date=2026-02-30&date=2026-10-01","date=2026-09-01","date=2026-09-01&date=2026-09-02&date=2026-09-03&date=2026-09-04"]) assert.equal((await call(`/api/admin/stats/compare?${invalid}`)).response.status,400);
    for (const period of ["week","month"]) {
      const comparison=await call(`/api/admin/stats/compare?period=${period}&date=2026-09-29&date=2024-02-10&date=2099-01-01`);
      assert.equal(comparison.response.status,200);assert.equal(comparison.data.series.length,3);
      for (const series of comparison.data.series) {
        const expected=await pool.query("SELECT count(*)::int AS total FROM fa_leads WHERE deleted_at IS NULL AND created_at >= ($1::date::timestamp AT TIME ZONE $3) AND created_at < (($2::date+1)::timestamp AT TIME ZONE $3) AND created_at <= now()",[series.start,series.end,comparison.data.timezone]);
        assert.equal(series.daily.reduce((sum:number,day:{count:number|null})=>sum+(day.count||0),0),expected.rows[0].total);
        assert.equal(series.daily[0].date,series.start);assert.equal(series.daily.at(-1).date,series.end);
        if(period==="week")assert.equal(series.daily.length,7);
      }
      if(period==="month")assert.equal(comparison.data.series[1].daily.length,29);
      assert.ok(comparison.data.series[2].daily.every((day:{count:number|null})=>day.count===null));
    }
    const version = (await pool.query("SELECT version_id FROM fa_form_current WHERE id=1")).rows[0].version_id;
    await pool.query("INSERT INTO fa_leads (id, request_id, request_hash, form_version, source, answers, consent_version, consent_text) VALUES ($1,$2,'test',$3,'quote',$4,'test','Synthetic test')", [id, randomUUID(), version, JSON.stringify({ first_name: "Action", last_name: "Test", email })]);
    for(const term of ["actION te",email]) {
      const found=await call(`/api/admin/leads?search=${encodeURIComponent(term)}`);
      assert.equal(found.response.status,200);assert.ok(found.data.leads.some((lead:{id:string})=>lead.id===id));
    }
    for(const term of ["' OR 1=1 --","%","_","\\"]) {
      const found=await call(`/api/admin/leads?search=${encodeURIComponent(term)}`);
      assert.equal(found.response.status,200);assert.equal(found.data.leads.length,0);
    }
    const badPatch=await call(`/api/admin/leads/${id}`,"PATCH",{revision:1,status:"new",notes:"<img src=x onerror=alert(1)>",archived:false,answers:{}});assert.equal(badPatch.response.status,400);
    const form=(await call("/api/admin/form")).data;
    const badForm=await call("/api/admin/form","PUT",{...form,fields:form.fields.map((field:Record<string,unknown>,index:number)=>index===0?{...field,label:"<script>alert(1)</script>"}:field)});assert.equal(badForm.response.status,400);
    const unsafeId=randomUUID();
    const unsafe=await call("/api/leads","POST",{requestId:unsafeId,version:form.version,source:"quote",consent:true,website:"",answers:{first_name:"<svg/onload=alert(1)>"}},"");assert.equal(unsafe.response.status,422);
    assert.equal((await pool.query("SELECT count(*)::int AS total FROM fa_leads WHERE request_id=$1",[unsafeId])).rows[0].total,0);
    const refreshed=await call(`/api/admin/leads?search=${encodeURIComponent(email)}&range=today`);
    assert.equal(refreshed.data.leads[0].id,id);assert.match(refreshed.response.headers.get("cache-control")||"",/no-store/);
    assert.equal((await call(`/api/admin/leads?search=${encodeURIComponent(email)}&range=yesterday`)).data.leads.length,0);
    await pool.query("UPDATE fa_leads SET created_at=(((now() AT TIME ZONE $2)::date-1)::timestamp AT TIME ZONE $2) WHERE id=$1",[id,refreshed.data.timezone]);
    assert.equal((await call(`/api/admin/leads?search=${encodeURIComponent(email)}&range=yesterday`)).data.leads[0].id,id);
    assert.equal((await call(`/api/admin/leads?search=${encodeURIComponent(email)}&range=today`)).data.leads.length,0);
    await pool.query("UPDATE fa_leads SET created_at=now() WHERE id=$1",[id]);
    for(const suffix of ["range=custom&from=2026-02-30&to=2026-03-01","range=custom&from=2026-10-10&to=2026-10-01","range=bad","cursor=garbage"])assert.equal((await call(`/api/admin/leads?${suffix}`)).response.status,400);
    const custom=await call("/api/admin/leads?range=custom&from=2026-09-01&to=2026-09-30&limit=50");assert.equal(custom.response.status,200);
    const customExpected=await pool.query("SELECT count(*)::int AS total FROM fa_leads WHERE deleted_at IS NULL AND archived_at IS NULL AND created_at >= ('2026-09-01'::date::timestamp AT TIME ZONE $1) AND created_at < ('2026-10-01'::date::timestamp AT TIME ZONE $1)",[custom.data.timezone]);
    assert.equal(custom.data.leads.length,Math.min(50,customExpected.rows[0].total));
    let next="";const seen=new Set<string>();let previous="9999";
    do {
      const page=await call(`/api/admin/leads?search=demo&limit=7&cursor=${next}`);
      assert.equal(page.response.status,200);
      for(const lead of page.data.leads){assert.ok(!seen.has(lead.id));seen.add(lead.id);assert.ok(lead.created_at<=previous);previous=lead.created_at;}
      next=page.data.nextCursor||"";
    }while(next);
    const expectedMatches=await pool.query("SELECT count(*)::int AS total FROM fa_leads WHERE deleted_at IS NULL AND archived_at IS NULL AND (coalesce(answers->>'first_name','') || ' ' || coalesce(answers->>'last_name','')) ILIKE '%demo%'");
    assert.equal(seen.size,expectedMatches.rows[0].total);
    assert.equal((await call(`/api/admin/leads/${id}`, "PATCH", { revision: 1, status: "qualified" }, "")).response.status, 401);
    assert.equal((await call(`/api/admin/leads/${id}`, "PATCH", { revision: 1, status: "qualified" }, cookie, "https://wrong.example")).response.status, 403);
    assert.equal((await call(`/api/admin/leads/${id}`, "PATCH", { revision: 1, status: "invalid" })).response.status, 400);
    assert.equal((await call(`/api/admin/leads/${id}`, "PATCH", { revision: 1, status: "qualified" })).response.status, 200);
    assert.equal((await call(`/api/admin/leads/${id}`, "PATCH", { revision: 1, action: "delete" })).response.status, 409);
    const updated = (await call(`/api/admin/leads/${id}`)).data;
    assert.equal(updated.status, "qualified");
    assert.equal(updated.answers.email, email);
    assert.equal(updated.consent_text, "Synthetic test");
    const stats = await call("/api/admin/stats");
    assert.equal(stats.response.status, 200);
    assert.equal(stats.data.daily.length, 14);
    assert.equal(stats.data.daily.at(-1).date, stats.data.today);
    assert.equal(Object.values(stats.data.statuses).reduce((sum: number, value) => sum + Number(value), 0), stats.data.month_total);
    assert.ok(stats.data.statuses.qualified >= 1);
    assert.equal((await call(`/api/admin/leads/${id}`, "PATCH", { revision: 2, action: "delete", actor_email: "spoof@example.com" })).response.status, 400);
    assert.equal((await call(`/api/admin/leads/${id}`, "PATCH", { revision: 2, action: "delete" })).response.status, 200);
    const afterDelete = (await call("/api/admin/stats")).data;
    assert.equal(afterDelete.month_total, stats.data.month_total - 1);
    assert.equal(afterDelete.today_total, stats.data.today_total - 1);
    const query = `search=${encodeURIComponent(email)}`;
    assert.equal((await call(`/api/admin/leads?${query}`)).data.leads.length, 0);
    assert.equal((await call(`/api/admin/leads?archived=true&${query}`)).data.leads.length, 0);
    const trash = (await call(`/api/admin/leads?deleted=true&${query}`)).data.leads;
    assert.equal(trash.length, 1);
    assert.equal(trash[0].deleted_by_email, email);
    assert.equal(trash[0].revision, 3);
    assert.ok(trash[0].deleted_at);
    assert.equal((await call(`/api/admin/leads/${id}`, "PATCH", { revision: 3, status: "new" })).response.status, 409);
    assert.equal((await call(`/api/admin/leads/${id}`, "PATCH", { revision: 3, action: "restore" })).response.status, 200);
    assert.equal((await call("/api/admin/stats")).data.month_total, stats.data.month_total);
    assert.equal((await call(`/api/admin/leads?deleted=true&${query}`)).data.leads.length, 0);
    assert.equal((await call(`/api/admin/leads?${query}`)).data.leads[0].status, "qualified");
    const audit = await pool.query("SELECT action, actor_email FROM fa_audit_events WHERE entity_id=$1 ORDER BY id", [id]);
    assert.deepEqual(audit.rows.map(row => row.action), ["lead.status", "lead.delete", "lead.restore"]);
    assert.ok(audit.rows.every(row => row.actor_email === email));
  } finally {
    await pool.query("DELETE FROM fa_audit_events WHERE entity_id=$1", [id]);
    await pool.query("DELETE FROM fa_leads WHERE id=$1", [id]);
    if (userId) await pool.query('DELETE FROM "user" WHERE id=$1', [userId]);
    await pool.end();
  }
});
