import { readFile, writeFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import { Pool } from "pg";
const migration=process.env.MIGRATION_DATABASE_URL||process.env.DATABASE_URL;
if(!migration)throw new Error("Set MIGRATION_DATABASE_URL.");
const url=new URL(migration);if(!['127.0.0.1','localhost'].includes(url.hostname)||url.pathname!='/fa_local')throw new Error('This provisioner is restricted to the local FA database.');
const pool=new Pool({connectionString:migration,max:1});const client=await pool.connect();
try{await client.query('BEGIN');const password=randomBytes(32).toString('hex');const exists=await client.query("SELECT 1 FROM pg_roles WHERE rolname='fa_runtime'");
// Role identifier is a fixed application constant and the generated password is hex only.
await client.query(`${exists.rowCount?'ALTER':'CREATE'} ROLE fa_runtime LOGIN PASSWORD '${password}' NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS`);
await client.query('GRANT CONNECT ON DATABASE fa_local TO fa_runtime');await client.query('GRANT USAGE ON SCHEMA public TO fa_runtime');
await client.query('REVOKE ALL ON ALL TABLES IN SCHEMA public FROM fa_runtime');
await client.query('GRANT SELECT ON fa_admins,fa_form_current,fa_form_versions,fa_audit_events TO fa_runtime');
await client.query('GRANT SELECT,INSERT,UPDATE ON fa_leads,fa_blog_posts,fa_request_limits TO fa_runtime');
await client.query('GRANT INSERT ON fa_form_versions,fa_audit_events TO fa_runtime');await client.query('GRANT UPDATE ON fa_form_current TO fa_runtime');
await client.query('GRANT SELECT,INSERT,UPDATE,DELETE ON "user",account,session,verification,"rateLimit","twoFactor" TO fa_runtime');
await client.query('GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO fa_runtime');await client.query('COMMIT');
const runtime=new URL(migration);runtime.username='fa_runtime';runtime.password=password;let env=await readFile('.env.local','utf8');env=env.replace(/^DATABASE_URL=.*$/m,`DATABASE_URL=${runtime}`);if(!/^MIGRATION_DATABASE_URL=/m.test(env))env+=`\nMIGRATION_DATABASE_URL=${migration}\n`;await writeFile('.env.local',env);console.log('Local runtime role configured. Maintenance credential retained privately. No credentials displayed.');
}finally{client.release();await pool.end();}
