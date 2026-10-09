import { z } from "zod";
import type { BlogBlock } from "./blog";

export const safeLink = z.string().max(1500).refine(value => !value || /^\/(?!\/)[^\\\s]*$/.test(value) || /^https:\/\/[^\s\\]+$/i.test(value), "Use an HTTPS link or a site path.");
export const imageLink = z.string().max(1500).refine(value => /^\/(?:images\/[a-zA-Z0-9/_().-]+|api\/blog-media\/[a-f0-9-]+\.webp)$/.test(value) || /^https:\/\/[^\s\\]+$/i.test(value), "Use an image path or HTTPS URL.");
const colour = z.string().regex(/^(#[0-9a-fA-F]{3,8}|rgba?\([\d\s.,%]+\))$/);
const attrs = z.object({
 level:z.number().int().min(2).max(3).optional(), textAlign:z.enum(["left","center","right","justify"]).nullable().optional(),
 src:imageLink.optional(),alt:z.string().max(500).nullable().optional(),title:z.string().max(500).nullable().optional(),
 width:z.number().min(1).max(3000).nullable().optional(),height:z.number().min(1).max(3000).nullable().optional(),
 start:z.number().int().min(1).max(10000).optional(),type:z.string().max(20).nullable().optional(),
 colspan:z.number().int().min(1).max(30).optional(),rowspan:z.number().int().min(1).max(100).optional(),colwidth:z.array(z.number().int().min(1).max(3000)).max(30).nullable().optional(),
 language:z.string().max(30).nullable().optional(),
}).strict();
const mark = z.object({type:z.enum(["bold","italic","underline","strike","code","link","textStyle"]),attrs:z.object({
 href:safeLink.optional(),title:z.string().max(500).nullable().optional(),target:z.enum(["_blank","_self"]).nullable().optional(),rel:z.string().max(100).nullable().optional(),class:z.string().max(100).nullable().optional(),
 color:colour.nullable().optional(),backgroundColor:colour.nullable().optional(),fontFamily:z.string().max(100).regex(/^[a-zA-Z\s,'-]+$/).nullable().optional(),fontSize:z.string().regex(/^(1[4-9]|[2-6][0-9]|7[0-2])px$/).nullable().optional(),lineHeight:z.string().regex(/^[123](\.[0-9])?$/).nullable().optional(),
}).strict().optional()}).strict().superRefine((mark,ctx)=>{if(mark.type==="link"&&!mark.attrs?.href)ctx.addIssue({code:"custom",message:"Link URL is required."});});
export type RichNode={type:string;text?:string;attrs?:z.infer<typeof attrs>;marks?:z.infer<typeof mark>[];content?:RichNode[]};
const node:z.ZodType<RichNode>=z.lazy(()=>z.object({type:z.enum(["doc","paragraph","heading","text","hardBreak","bulletList","orderedList","listItem","blockquote","codeBlock","horizontalRule","image","table","tableRow","tableHeader","tableCell"]),text:z.string().max(100000).optional(),attrs:attrs.optional(),marks:z.array(mark).max(10).optional(),content:z.array(node).max(1000).optional()}).strict().superRefine((value,ctx)=>{if(value.type==="image"&&!value.attrs?.src)ctx.addIssue({code:"custom",message:"Image URL is required."});}));
// Bound recursion before schema traversal. React rendering never accepts raw HTML.
export const richTextSchema=z.unknown().superRefine((value,ctx)=>{
 const pending=[{value,depth:0}];let count=0;
 while(pending.length){const item=pending.pop()!;if(++count>5000||item.depth>25){ctx.addIssue({code:"custom",message:"Article is too complex."});return;}if(item.value&&typeof item.value==="object"&&"content" in item.value&&Array.isArray(item.value.content))for(const child of item.value.content)pending.push({value:child,depth:item.depth+1});}
}).pipe(node).refine(value=>value.type==="doc","An article document is required.");

export function blocksToRichText(blocks:BlogBlock[]):RichNode {
 const content:RichNode[]=blocks.map(block=>{
  if(block.type==="image")return {type:"image",attrs:{src:block.url,alt:block.text,title:block.text}};
  const marks:NonNullable<RichNode["marks"]>=[{type:"textStyle",attrs:{fontSize:`${block.size}px`,color:block.color,backgroundColor:block.background,fontFamily:block.font==="serif"?"DM Serif Display":block.font==="system"?"Arial":"Manrope"}}];
  if(block.bold)marks.push({type:"bold"});if(block.italic)marks.push({type:"italic"});if(block.url)marks.push({type:"link",attrs:{href:block.url}});
  const inline=(text:string):RichNode[]=>text.split("\n").flatMap((line,index)=>[...(index?[{type:"hardBreak"}]:[]),...(line?[{type:"text",text:line,marks}]:[])]);
  const paragraph=(text:string):RichNode=>({type:"paragraph",attrs:{textAlign:block.align},content:inline(text)});
  if(block.type==="list")return {type:"bulletList",content:block.text.split("\n").filter(Boolean).map(line=>({type:"listItem",content:[paragraph(line)]}))};
  if(block.type==="quote")return {type:"blockquote",content:[paragraph(block.text)]};
  if(block.type==="h2"||block.type==="h3")return {type:"heading",attrs:{level:block.type==="h2"?2:3,textAlign:block.align},content:inline(block.text)};
  return paragraph(block.text);
 });
 return {type:"doc",content:content.length?content:[{type:"paragraph"}]};
}
