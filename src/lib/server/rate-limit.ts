import "server-only";
import { createHmac } from "node:crypto";
import { getPool } from "./db";
import { HttpError } from "./http";

export async function limitSubmission(request: Request) {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) throw new Error("Rate limiter is not configured.");
  // Only trust an IP header when an operator configures a reverse proxy which
  // overwrites it. Otherwise use a conservative shared limit for this instance.
  const header = process.env.TRUSTED_IP_HEADER;
  const identity = header ? (request.headers.get(header)?.split(",")[0]?.trim() || "shared") : "shared";
  const key = createHmac("sha256", secret).update(`submit:${identity}`).digest("hex");
  const result = await getPool().query(`
    INSERT INTO fa_request_limits (key, hits, expires_at) VALUES ($1, 1, now() + interval '1 minute')
    ON CONFLICT (key) DO UPDATE SET
      hits = CASE WHEN fa_request_limits.expires_at <= now() THEN 1 ELSE fa_request_limits.hits + 1 END,
      expires_at = CASE WHEN fa_request_limits.expires_at <= now() THEN now() + interval '1 minute' ELSE fa_request_limits.expires_at END
    RETURNING hits`, [key]);
  if (result.rows[0].hits > (header ? 10 : 60)) throw new HttpError(429, "Too many requests. Please try again in a minute.");
}

export async function consumeLimit(identity:string,max:number,seconds:number){
 const secret=process.env.BETTER_AUTH_SECRET;if(!secret)throw new Error("Rate limiter unavailable.");
 const key=createHmac("sha256",secret).update(identity).digest("hex");
 const result=await getPool().query(`INSERT INTO fa_request_limits(key,hits,expires_at) VALUES($1,1,now()+$2*interval '1 second') ON CONFLICT(key) DO UPDATE SET hits=CASE WHEN fa_request_limits.expires_at<=now() THEN 1 ELSE fa_request_limits.hits+1 END, expires_at=CASE WHEN fa_request_limits.expires_at<=now() THEN now()+$2*interval '1 second' ELSE fa_request_limits.expires_at END RETURNING hits`,[key,seconds]);
 if(result.rows[0].hits>max)throw new HttpError(429,"Too many requests. Please try again later.");
}
