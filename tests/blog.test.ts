import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import test from "node:test";
import { readFile, unlink } from "node:fs/promises";
import path from "node:path";
import { Pool } from "pg";
import { betterAuth } from "better-auth";
import { authOptions } from "../src/lib/auth-options";
import { blogSchema, newBlock } from "../src/lib/blog";

test("blog publishing enforces access and revisions and keeps drafts and trash private", async () => {
 const database=new URL(process.env.DATABASE_URL||"");
 assert.ok(["127.0.0.1","localhost"].includes(database.hostname)&&database.pathname==="/fa_local");
 const origin=process.env.BETTER_AUTH_URL||"http://127.0.0.1:3000";
 assert.ok(["127.0.0.1","localhost"].includes(new URL(origin).hostname));
 const pool=new Pool({connectionString:process.env.MIGRATION_DATABASE_URL||process.env.DATABASE_URL,max:2});
 const slug=`test-${randomUUID()}`; const email=`${slug}@example.com`; let userId:string|undefined;let postId:string|undefined;let cookie="";let uploaded:string|undefined;
 const call=async(method="GET",body?:unknown,session=cookie,requestOrigin=origin)=>fetch(`${origin}/api/admin/blog`,{method,headers:{"Content-Type":"application/json",Origin:requestOrigin,Cookie:session},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(30000)});
 const publicStatus=async()=> (await fetch(`${origin}/blog/${slug}`,{signal:AbortSignal.timeout(30000)})).status;
 try {
  assert.equal((await call()).status,401);
  const password=randomBytes(24).toString("base64url");
  userId=(await betterAuth(authOptions(pool,true)).api.signUpEmail({body:{email,password,name:"Blog test"}})).user.id;
  const signIn=await fetch(`${origin}/api/auth/sign-in/email`,{method:"POST",headers:{"Content-Type":"application/json",Origin:origin},body:JSON.stringify({email,password})});
  assert.equal(signIn.status,200);cookie=signIn.headers.getSetCookie().map(value=>value.split(";")[0]).join("; ");
  assert.equal((await call()).status,403);
  await pool.query("INSERT INTO fa_admins (user_id) VALUES ($1)",[userId]);
  const image=await readFile("public/images/blog/notebook.webp");
  assert.equal((await fetch(`${origin}/api/admin/blog/images`,{method:"POST",headers:{Origin:origin,"Content-Type":"image/webp"},body:image})).status,401);
  assert.equal((await fetch(`${origin}/api/admin/blog/images`,{method:"POST",headers:{Origin:origin,Cookie:cookie,"Content-Type":"image/svg+xml"},body:"<svg/>"})).status,415);
  const upload=await fetch(`${origin}/api/admin/blog/images`,{method:"POST",headers:{Origin:origin,Cookie:cookie,"Content-Type":"image/webp"},body:image});assert.equal(upload.status,200);uploaded=(await upload.json()).url;
  const media=await fetch(origin+uploaded);assert.equal(media.status,200);assert.equal(media.headers.get("content-type"),"image/webp");
  const document=blogSchema.parse({title:"Synthetic blog test",slug,excerpt:"A temporary article for publishing checks.",category:"Test",author:"Test",cover:"/images/blog/notebook.webp",coverAlt:"Notebook",credit:"",creditUrl:"",titleSize:42,titleColor:"#214f5a",blocks:[{...newBlock(),text:"Temporary body"}]});
  assert.equal((await call("POST",{document,status:"draft"},cookie,"https://wrong.example")).status,403);
  assert.equal((await call("POST",{document:{...document,blocks:[{...document.blocks[0],url:"javascript:alert(1)"}]},status:"draft"})).status,400);
  const created=await call("POST",{document,status:"draft"});assert.equal(created.status,200);const post=await created.json();postId=post.id;
  assert.equal(await publicStatus(),404);
  assert.equal((await call("POST",{document,status:"draft"})).status,409);
  document.blocks=[];document.tags=["Test"];
  document.richContent={type:"doc",content:[{type:"heading",attrs:{level:2},content:[{type:"text",text:"Rich heading"}]},{type:"paragraph",content:[{type:"text",text:"Styled content",marks:[{type:"bold"},{type:"textStyle",attrs:{color:"#336699",fontSize:"24px"}},{type:"link",attrs:{href:"/contact"}}]}]},{type:"image",attrs:{src:uploaded!,alt:"Uploaded test image"}},{type:"table",content:[{type:"tableRow",content:[{type:"tableCell",attrs:{colspan:1,rowspan:1,colwidth:null},content:[{type:"paragraph",content:[{type:"text",text:"Table content"}]}]}]}]}]};
  assert.equal((await call("POST",{id:postId,revision:1,document,status:"published"})).status,200);
  assert.equal(await publicStatus(),200);
  const html=await (await fetch(`${origin}/blog/${slug}`)).text();assert.match(html,/Rich heading/);assert.match(html,/font-size:24px/);assert.match(html,/Table content/);
  assert.equal((await call("POST",{id:postId,revision:1,document,status:"draft"})).status,409);
  assert.equal((await call("PATCH",{id:postId,revision:2,action:"delete"})).status,200);
  assert.equal(await publicStatus(),404);
  assert.equal((await call("PATCH",{id:postId,revision:3,action:"restore"})).status,200);
  assert.equal(await publicStatus(),200);
  assert.equal((await call("POST",{id:postId,revision:4,document:{...document,title:"Updated article"},status:"draft"})).status,200);
  assert.equal(await publicStatus(),404);
  const audit=await pool.query("SELECT actor_email FROM fa_audit_events WHERE entity_id=$1",[postId]);assert.equal(audit.rowCount,5);assert.ok(audit.rows.every(row=>row.actor_email===email));
  const seeded=await pool.query("SELECT document FROM fa_blog_posts WHERE status='published' AND deleted_at IS NULL AND slug NOT LIKE 'test-%'");
  assert.ok(seeded.rowCount!>=5);
  for(const row of seeded.rows){const doc=blogSchema.parse(row.document);assert.ok(!/[,\u2013\u2014]/.test([doc.title,doc.excerpt,...doc.blocks.map(block=>block.text)].join(" ")));}
 } finally {
  if(postId){await pool.query("DELETE FROM fa_audit_events WHERE entity_id=$1",[postId]);await pool.query("DELETE FROM fa_blog_posts WHERE id=$1",[postId]);}
  if(userId)await pool.query('DELETE FROM "user" WHERE id=$1',[userId]);await pool.end();
  if(uploaded)await unlink(path.join(path.resolve(process.env.BLOG_UPLOAD_DIR||".local/blog-media"),path.basename(uploaded)));
 }
});
