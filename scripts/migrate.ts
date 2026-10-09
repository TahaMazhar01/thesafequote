import { readFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { Pool } from "pg";
import { getMigrations } from "better-auth/db/migration";
import { authOptions } from "../src/lib/auth-options";
import { defaultFields } from "../src/lib/forms";

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("Set DATABASE_URL first.");
  const pool = new Pool({ ...(process.env.DB_TLS === "verify" ? {ssl:{rejectUnauthorized:true,...(process.env.DB_CA_PEM?{ca:process.env.DB_CA_PEM}:{})}} : {}), connectionString: process.env.MIGRATION_DATABASE_URL || process.env.DATABASE_URL, max: 2, connectionTimeoutMillis: 5000 });
  const client = await pool.connect();
  try {
    await client.query("SELECT pg_advisory_lock(81460209)");
    const auth = await getMigrations(authOptions(pool));
    await auth.runMigrations();
    await client.query("CREATE TABLE IF NOT EXISTS fa_migrations (name text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())");
    for (const file of (await readdir("db/migrations")).filter(file => file.endsWith(".sql")).sort()) {
      const sql = await readFile(`db/migrations/${file}`, "utf8");
      const checksum = createHash("sha256").update(sql).digest("hex");
      const existing = await client.query("SELECT checksum FROM fa_migrations WHERE name = $1", [file]);
      if (existing.rows[0]) {
        if (existing.rows[0].checksum !== checksum) throw new Error(`Applied migration changed: ${file}. Add a new migration instead.`);
        continue;
      }
      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query("INSERT INTO fa_migrations (name, checksum) VALUES ($1,$2)", [file, checksum]);
        await client.query("COMMIT");
      } catch (error) { await client.query("ROLLBACK"); throw error; }
      console.log(`Applied ${file}`);
    }
    await client.query("BEGIN");
    const current = await client.query("SELECT id FROM fa_form_current WHERE id = 1");
    if (!current.rowCount) {
      const version = await client.query("INSERT INTO fa_form_versions (fields) VALUES ($1) RETURNING id", [JSON.stringify(defaultFields)]);
      await client.query("INSERT INTO fa_form_current (id, version_id) VALUES (1,$1)", [version.rows[0].id]);
    }
    await client.query("COMMIT");
    console.log("Database migrations complete.");
  } finally {
    await client.query("SELECT pg_advisory_unlock(81460209)").catch(() => {});
    client.release();
    await pool.end();
  }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
