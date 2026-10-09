import type { BetterAuthOptions } from "better-auth";
import type { Pool } from "pg";
import { twoFactor } from "better-auth/plugins";
import { hashAdminPassword, verifyAdminPassword } from "./password";

// Shared by the server and explicit local maintenance scripts only.
export function authOptions(database: Pool, allowSignup = false): BetterAuthOptions {
  if (!process.env.BETTER_AUTH_SECRET || process.env.BETTER_AUTH_SECRET.length < 32) throw new Error("Authentication is not configured.");
  return {
    plugins: [twoFactor({issuer:"The Safe Quote",accountLockout:{enabled:true,maxFailedAttempts:5,durationSeconds:900}})],
    databaseHooks: { session: { create: { before: async session => ({data:{...session,expiresAt:new Date(Date.now()+8*60*60*1000)}}) } } },
    appName: "TheSafeQuote Admin",
    baseURL: process.env.BETTER_AUTH_URL || "http://127.0.0.1:3000",
    secret: process.env.BETTER_AUTH_SECRET,
    database,
    emailAndPassword: { enabled: true, disableSignUp: !allowSignup, minPasswordLength: 12, password: { hash: hashAdminPassword, verify: async input => { const valid=await verifyAdminPassword(input); if(valid&&!input.hash.startsWith("scrypt-v2:")){const upgraded=await hashAdminPassword(input.password);await database.query('UPDATE account SET password=$1 WHERE password=$2 AND "providerId"=$3',[upgraded,input.hash,"credential"]);} return valid; } } },
    session: { expiresIn: 60 * 60 * 8, updateAge: 60 * 60, disableSessionRefresh: true },
    rateLimit: { enabled: true, storage: "database", window: 60, max: 30, customRules: { "/sign-in/email": { window: 60, max: 5 } } },
    advanced: { ipAddress: { ipAddressHeaders: process.env.TRUSTED_IP_HEADER ? [process.env.TRUSTED_IP_HEADER] : [] } },
  };
}
