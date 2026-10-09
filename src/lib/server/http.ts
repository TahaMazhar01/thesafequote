import "server-only";
import { z } from "zod";

export class HttpError extends Error {
  constructor(public status: number, message: string, public details?: Record<string, string>) { super(message); }
}
export function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
}
export function failure(error: unknown) {
  if (error instanceof HttpError) return json({ error: error.message, errors: error.details }, error.status);
  if (error instanceof z.ZodError) return json({ error: "Please check the supplied values." }, 400);
  // A generic response prevents database/schema/connection information leaking.
  console.error("A backend request could not be completed.");
  return json({ error: "This service is temporarily unavailable. Please try again shortly." }, 503);
}
export function checkOrigin(request: Request) {
  const expected = process.env.BETTER_AUTH_URL || "http://127.0.0.1:3000";
  if (request.headers.get("origin") !== new URL(expected).origin) throw new HttpError(403, "This request is not allowed.");
}
export async function readJson(request: Request, limit = 32_768): Promise<unknown> {
  if (!request.headers.get("content-type")?.includes("application/json")) throw new HttpError(415, "Send JSON data.");
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, "Request data is required.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) { await reader.cancel(); throw new HttpError(413, "This request is too large."); }
      chunks.push(value);
    }
    const data = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { data.set(chunk, offset); offset += chunk.byteLength; }
    return JSON.parse(new TextDecoder().decode(data));
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(400, "Invalid request data.");
  } finally { reader.releaseLock(); }
}
