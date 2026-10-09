import { readFile } from "node:fs/promises";
import path from "node:path";
export const runtime="nodejs";
export async function GET(_request:Request,{params}:{params:Promise<{filename:string}>}){
 const {filename}=await params;if(!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\.webp$/.test(filename))return new Response(null,{status:404});
 try{const data=await readFile(/*turbopackIgnore: true*/ path.join(/*turbopackIgnore: true*/ path.resolve(/*turbopackIgnore: true*/ process.env.BLOG_UPLOAD_DIR||".local/blog-media"),filename));return new Response(data,{headers:{"Content-Type":"image/webp","Cache-Control":"public, max-age=31536000, immutable","X-Content-Type-Options":"nosniff"}});}catch{return new Response(null,{status:404});}
}
