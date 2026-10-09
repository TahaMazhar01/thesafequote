import { getAuth } from "@/lib/server/auth";
import { failure } from "@/lib/server/http";
export const runtime = "nodejs";
export async function GET(request: Request) { try { return await getAuth().handler(request); } catch (error) { return failure(error); } }
export async function POST(request: Request) { try { const response=await getAuth().handler(request);const path=new URL(request.url).pathname;console.info(JSON.stringify({event:"auth.request",path,status:response.status,time:new Date().toISOString()}));return response; } catch (error) { console.warn(JSON.stringify({event:"auth.failure",time:new Date().toISOString()}));return failure(error); } }
