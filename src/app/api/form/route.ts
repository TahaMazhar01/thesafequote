import { getPublishedForm } from "@/lib/server/form-store";
import { failure } from "@/lib/server/http";
export const runtime = "nodejs";
export async function GET() {
  try { return Response.json(await getPublishedForm(), { headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } }); }
  catch (error) { return failure(error); }
}
