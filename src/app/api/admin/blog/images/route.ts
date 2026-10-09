import { randomUUID } from "node:crypto";
import { mkdir, writeFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { transaction } from "@/lib/server/db";
import { consumeLimit } from "@/lib/server/rate-limit";
import { requireAdmin } from "@/lib/server/auth";
import { checkOrigin, failure, HttpError, json } from "@/lib/server/http";
export const runtime="nodejs";
export async function POST(request:Request){try{
 checkOrigin(request);const admin=await requireAdmin(request.headers, false, "editor");await consumeLimit(`upload:${admin.id}`,10,3600);
 if(!["image/jpeg","image/png","image/webp"].includes(request.headers.get("content-type")||""))throw new HttpError(415,"Choose a JPG or PNG or WebP image.");
 const reader=request.body?.getReader();if(!reader)throw new HttpError(400,"Choose an image.");
 const chunks:Uint8Array[]=[];let size=0;
 try{for(;;){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>5*1024*1024){await reader.cancel();throw new HttpError(413,"Choose an image smaller than 5 MB.");}chunks.push(value);}}finally{reader.releaseLock();}
 let image:Buffer;try{image=await sharp(Buffer.concat(chunks),{limitInputPixels:25_000_000}).rotate().resize({width:1600,withoutEnlargement:true}).webp({quality:82}).toBuffer();}catch{throw new HttpError(400,"This image could not be read. Choose another JPG or PNG or WebP.");}
 const folder=path.resolve(/*turbopackIgnore: true*/ process.env.BLOG_UPLOAD_DIR||".local/blog-media");await mkdir(folder,{recursive:true});const filename=`${randomUUID()}.webp`;await transaction(async client=>{
 await client.query("SELECT pg_advisory_xact_lock(81460210)");
 const files=(await readdir(folder)).filter(name=>name.endsWith(".webp"));
 if(files.length>=5000)throw new HttpError(507,"Image storage is full. Contact the server administrator.");
 let used=0;for(const file of files)used+=(await stat(path.join(folder,file))).size;
 const budget=Number(process.env.BLOG_STORAGE_MAX_BYTES)||536870912;
 if(used+image.length>budget)throw new HttpError(507,"Image storage is full. Contact the server administrator.");
 await writeFile(path.join(folder,filename),image,{flag:"wx"});
 });return json({url:`/api/blog-media/${filename}`});
 }catch(error){return failure(error);}}
