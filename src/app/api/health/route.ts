import { getPool } from "@/lib/server/db";
export const runtime = "nodejs";
export async function GET() {
  try {
    await getPool().query("SELECT version_id FROM fa_form_current WHERE id=1");
    return Response.json({status:"ok"},{headers:{"Cache-Control":"no-store"}});
  } catch {
    return Response.json({status:"unavailable"},{status:503,headers:{"Cache-Control":"no-store"}});
  }
}
