import { randomUUID } from "node:crypto";
import { z } from "zod";
import { blogSchema } from "@/lib/blog";
import { requireAdmin } from "@/lib/server/auth";
import { getPool, transaction } from "@/lib/server/db";
import { checkOrigin, failure, HttpError, json, readJson } from "@/lib/server/http";
export const runtime="nodejs";
export async function GET(request:Request) { try {
 await requireAdmin(request.headers, "editor");
 const params=new URL(request.url).searchParams;
 if(params.get("id")) { const id=z.uuid().parse(params.get("id"));const result=await getPool().query("SELECT * FROM fa_blog_posts WHERE id=$1",[id]);if(!result.rowCount)throw new HttpError(404,"Article not found.");return json(result.rows[0]); }
 const page=z.coerce.number().int().min(1).max(10000).parse(params.get("page")||1);
 const result=await getPool().query(`SELECT id,slug,status,revision,deleted_at,published_at,document->>'title' AS title,document->>'category' AS category,document->>'cover' AS cover FROM fa_blog_posts WHERE deleted_at IS ${params.get("trash")==="true"?"NOT NULL":"NULL"} ORDER BY updated_at DESC,id LIMIT 21 OFFSET $1`,[(page-1)*20]);
 return json({posts:result.rows.slice(0,20),hasMore:result.rows.length>20});
 }catch(error){return failure(error);} }
export async function POST(request:Request){try{
 checkOrigin(request);const admin=await requireAdmin(request.headers, "editor");
 const body=z.object({id:z.uuid().optional(),revision:z.number().int().positive().optional(),status:z.enum(["draft","published"]),document:blogSchema}).strict().parse(await readJson(request,200_000));
 const id=body.id||randomUUID();
 const post=await transaction(async client=>{
 if(body.id){const old=await client.query("SELECT revision,deleted_at FROM fa_blog_posts WHERE id=$1 FOR UPDATE",[id]);if(!old.rowCount)throw new HttpError(404,"Article not found.");if(old.rows[0].deleted_at)throw new HttpError(409,"Restore this article before editing.");if(old.rows[0].revision!==body.revision)throw new HttpError(409,"This article changed. Reload it before saving.");}
 const result=body.id ? await client.query("UPDATE fa_blog_posts SET slug=$2,document=$3,status=$4,revision=revision+1,updated_at=now(),published_at=CASE WHEN $4='published' THEN coalesce(published_at,now()) ELSE published_at END WHERE id=$1 RETURNING *",[id,body.document.slug,JSON.stringify(body.document),body.status]) : await client.query("INSERT INTO fa_blog_posts (id,slug,document,status,published_at) VALUES ($1,$2,$3,$4,CASE WHEN $4='published' THEN now() ELSE NULL END) RETURNING *",[id,body.document.slug,JSON.stringify(body.document),body.status]);
 await client.query("INSERT INTO fa_audit_events (actor_id,actor_email,action,entity_id) VALUES ($1,$2,$3,$4)",[admin.id,admin.email,`blog.${body.status}`,id]);return result.rows[0]; });return json(post);
 }catch(error){if((error as {code?:string}).code==="23505")return json({error:"That URL slug is already used. Choose another."},409);return failure(error);} }
export async function PATCH(request:Request){try{
 checkOrigin(request);const admin=await requireAdmin(request.headers, "editor");const body=z.object({id:z.uuid(),revision:z.number().int().positive(),action:z.enum(["delete","restore"])}).strict().parse(await readJson(request));
 await transaction(async client=>{const result=await client.query("UPDATE fa_blog_posts SET deleted_at=CASE WHEN $3 THEN now() ELSE NULL END,revision=revision+1,updated_at=now() WHERE id=$1 AND revision=$2 RETURNING id",[body.id,body.revision,body.action==="delete"]);if(!result.rowCount)throw new HttpError(409,"Article changed. Refresh and try again.");await client.query("INSERT INTO fa_audit_events (actor_id,actor_email,action,entity_id) VALUES ($1,$2,$3,$4)",[admin.id,admin.email,`blog.${body.action}`,body.id]);});return json({message:"Article updated."});
 }catch(error){return failure(error);} }
