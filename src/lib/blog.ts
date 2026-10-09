import { z } from "zod";
import { safeLink, imageLink, richTextSchema } from "./rich-text";
export { safeLink, imageLink } from "./rich-text";
export const blockSchema = z.object({
 id: z.string().min(1).max(80), type: z.enum(["paragraph","h2","h3","list","quote","link","image"]),
 text: z.string().max(12000), url: safeLink, size: z.number().int().min(14).max(48),
 color: z.string().regex(/^#[0-9a-fA-F]{6}$/), background: z.string().regex(/^#[0-9a-fA-F]{6}$/),
 font: z.enum(["brand","serif","system"]), bold: z.boolean(), italic: z.boolean(), align: z.enum(["left","center","right"]),
}).strict().superRefine((block, ctx) => {
 if ((block.type === "link" || block.type === "image") && !block.url) ctx.addIssue({ code:"custom", path:["url"], message:"A URL is required." });
 if (block.type === "image" && !imageLink.safeParse(block.url).success) ctx.addIssue({ code:"custom", path:["url"], message:"Use a valid image URL." });
});
export const blogSchema = z.object({
 title:z.string().trim().min(3).max(160), slug:z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(180),
 excerpt:z.string().trim().min(10).max(400), category:z.string().trim().min(1).max(60), author:z.string().trim().min(1).max(100),
 cover:imageLink, coverAlt:z.string().trim().min(1).max(250), credit:z.string().max(250), creditUrl:safeLink,
 titleSize:z.number().int().min(28).max(72), titleColor:z.string().regex(/^#[0-9a-fA-F]{6}$/),
 blocks:z.array(blockSchema).max(80),
 richContent:richTextSchema.optional(),
 tags:z.array(z.string().trim().min(1).max(40)).max(12).optional(),
}).strict().superRefine((post,ctx)=>{if(new Set(post.blocks.map(b=>b.id)).size!==post.blocks.length) ctx.addIssue({code:"custom",path:["blocks"],message:"Block IDs must be unique."});});
export type BlogDocument=z.infer<typeof blogSchema>;
export type BlogBlock=z.infer<typeof blockSchema>;
export type BlogPost={id:string;slug:string;document:BlogDocument;status:"draft"|"published";revision:number;deleted_at:string|null;published_at:string|null};
export function newBlock(type:BlogBlock["type"]="paragraph"):BlogBlock { return {id:crypto.randomUUID(),type,text:"",url:"",size:type==="h2"?30:type==="h3"?23:18,color:"#214f5a",background:"#ffffff",font:"brand",bold:type==="h2"||type==="h3",italic:false,align:"left"}; }
