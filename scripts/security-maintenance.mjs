import {Pool} from 'pg';
const pool=new Pool({...(process.env.DB_TLS === "verify" ? {ssl:{rejectUnauthorized:true,...(process.env.DB_CA_PEM?{ca:process.env.DB_CA_PEM}:{})}} : {}),connectionString:process.env.MIGRATION_DATABASE_URL,max:1});
if(!process.env.MIGRATION_DATABASE_URL)throw new Error('Maintenance requires MIGRATION_DATABASE_URL.');
try{await pool.query('DELETE FROM session WHERE "expiresAt" < now()');await pool.query('DELETE FROM verification WHERE "expiresAt" < now()');await pool.query('DELETE FROM fa_request_limits WHERE expires_at < now()');await pool.query('DELETE FROM "rateLimit" WHERE "lastRequest" < $1',[Date.now()-86400000]);console.log('Expired transient authentication and limiter records cleaned. Leads and audit history preserved.');}finally{await pool.end();}
