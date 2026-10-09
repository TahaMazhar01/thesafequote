import {Pool} from 'pg';
import {access} from 'node:fs/promises';
import {constants} from 'node:fs';
import path from 'node:path';
const fail=message=>{console.error(`Production readiness: ${message}`);process.exitCode=1;};
for(const key of ['BETTER_AUTH_URL','NEXT_PUBLIC_SITE_URL']){try{const url=new URL(process.env[key]);if(url.protocol!=='https:'||['127.0.0.1','localhost'].includes(url.hostname))fail(`${key} must use the real HTTPS domain.`);}catch{fail(`${key} is required.`);}}
if(process.env.BETTER_AUTH_URL!==process.env.NEXT_PUBLIC_SITE_URL)fail('Auth and public origin must match.');
if(!process.env.TRUSTED_IP_HEADER)fail('Configure a proxy-overwritten client IP header and block direct app access.');
if(!process.env.BETTER_AUTH_SECRET||process.env.BETTER_AUTH_SECRET.length<48||process.env.BETTER_AUTH_SECRET.includes('replace-with'))fail('A fresh production auth secret is required.');
if(process.env.MIGRATION_DATABASE_URL)fail('Remove the maintenance database credential from the web runtime.');
if(!process.env.BLOG_UPLOAD_DIR||!path.isAbsolute(process.env.BLOG_UPLOAD_DIR))fail('BLOG_UPLOAD_DIR must be an absolute persistent directory.');
else {try{await access(process.env.BLOG_UPLOAD_DIR,constants.W_OK);}catch{fail('Persistent media directory must exist and be writable.');}}
if(!process.env.DATABASE_URL)fail('DATABASE_URL is required.');
if(process.exitCode)process.exit(process.exitCode);
const url=new URL(process.env.DATABASE_URL);const local=['127.0.0.1','localhost'].includes(url.hostname);
if(!local&&process.env.DB_TLS!=='verify')fail('Remote PostgreSQL must use DB_TLS=verify with trusted CA.');
if(url.searchParams.has('sslmode'))fail('Remove sslmode from URL; use explicit DB_TLS=verify to avoid TLS option overrides.');
if(process.exitCode)process.exit(process.exitCode);
const pool=new Pool({connectionString:process.env.DATABASE_URL,...(process.env.DB_TLS==='verify'?{ssl:{rejectUnauthorized:true,...(process.env.DB_CA_PEM?{ca:process.env.DB_CA_PEM}:{})}}:{}),connectionTimeoutMillis:5000});
try{const role=(await pool.query('SELECT rolsuper,rolcreaterole,rolcreatedb,rolbypassrls FROM pg_roles WHERE rolname=current_user')).rows[0];if(Object.values(role).some(Boolean))fail('Database runtime role has excessive privileges.');const admins=(await pool.query('SELECT count(*)::int AS total,count(*) FILTER(WHERE u."twoFactorEnabled")::int AS enrolled FROM fa_admins a JOIN "user" u ON u.id=a.user_id WHERE a.active')).rows[0];if(!admins.total||admins.total!==admins.enrolled){if(process.argv.includes('--allow-enrollment'))console.warn('MFA enrollment pending. Production data routes remain gated until enrollment.');else fail('Every active production admin must enroll in MFA before launch.');}if(!process.exitCode)console.log('Automated production gates passed. HTTPS/proxy, backup restore and load verification are still operational release checks.');}finally{await pool.end();}
