import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { Pool } from "pg";
import { betterAuth } from "better-auth";
import { authOptions } from "../src/lib/auth-options";

async function main() {
  if(process.env.NODE_ENV === "production" && (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD)) throw new Error("Supply ADMIN_EMAIL and a strong ADMIN_PASSWORD securely for production setup.");
  const email = process.env.ADMIN_EMAIL || "admin@thesafequote.local";
  if (!process.env.DATABASE_URL) throw new Error("Set DATABASE_URL first.");
  const pool = new Pool({ ...(process.env.DB_TLS === "verify" ? {ssl:{rejectUnauthorized:true,...(process.env.DB_CA_PEM?{ca:process.env.DB_CA_PEM}:{})}} : {}), connectionString: process.env.MIGRATION_DATABASE_URL || process.env.DATABASE_URL, max: 2 });
  try {
    const existing = await pool.query('SELECT id FROM "user" WHERE lower(email) = lower($1)', [email]);
    if (existing.rowCount) throw new Error("This user already exists. No account or permissions were changed.");
    const password = process.env.ADMIN_PASSWORD || randomBytes(24).toString("base64url");
    const auth = betterAuth(authOptions(pool, true));
    const result = await auth.api.signUpEmail({ body: { email, password, name: "Administrator" } });
    await pool.query("INSERT INTO fa_admins (user_id) VALUES ($1)", [result.user.id]);
    await pool.query('DELETE FROM "session" WHERE "userId" = $1', [result.user.id]);
    if (!process.env.ADMIN_PASSWORD) {
      await mkdir(".local", { recursive: true });
      await writeFile(".local/admin-login.txt", `Local admin login\nURL: ${process.env.BETTER_AUTH_URL}/admin/login\nEmail: ${email}\nPassword: ${password}\n\nKeep this file private. Do not deploy this local account to production.\n`, { mode: 0o600, flag: "wx" });
      console.log("Admin created. Local login details saved to .local/admin-login.txt (ignored by Git).");
    } else console.log("Admin created with the supplied credentials.");
  } finally { await pool.end(); }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
