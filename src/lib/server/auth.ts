import "server-only";
import { betterAuth } from "better-auth";
import { getPool } from "./db";
import { HttpError } from "./http";
import { consumeLimit } from "./rate-limit";
import { authOptions } from "@/lib/auth-options";

let instance: ReturnType<typeof betterAuth> | undefined;
export function getAuth() {
  if (!instance) instance = betterAuth(authOptions(getPool()));
  return instance;
}
export async function requireAdmin(headers: Headers, allowUnenrolled = false, permission?: "leads" | "editor") {
  const session = await getAuth().api.getSession({ headers });
  if (!session) throw new HttpError(401, "Please sign in to continue.");
  const result = await getPool().query("SELECT user_id, role FROM fa_admins WHERE user_id = $1 AND active = true", [session.user.id]);
  if (!result.rowCount) throw new HttpError(403, "This account does not have admin access.");
  if (permission && result.rows[0].role !== "admin" && result.rows[0].role !== permission) throw new HttpError(403,"Your role does not allow this action.");
  await consumeLimit(`admin:${session.user.id}`, 120, 60);
  if (!allowUnenrolled && process.env.NODE_ENV === "production") {
    const enrolled=await getPool().query('SELECT "twoFactorEnabled" FROM "user" WHERE id=$1',[session.user.id]);
    if(!enrolled.rows[0]?.twoFactorEnabled)throw new HttpError(403,"Enable authenticator verification at /admin/security before accessing production data.");
  }
  return session.user;
}
