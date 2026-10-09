/* External images are rendered directly without a server-side URL fetch. */
/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";
import { blogSchema, type BlogDocument } from "@/lib/blog";
import { RichContent } from "./rich-content";
export function BlogContent({document}:{document:BlogDocument}) {
 const post=blogSchema.safeParse(document);if(!post.success)return <p>Article preview needs valid fields.</p>;
 if(post.data.richContent)return <RichContent content={post.data.richContent}/>;
 return <div className="blog-prose">{post.data.blocks.map(block=>{
 const style:CSSProperties={fontSize:block.size,color:block.color,backgroundColor:block.background,fontFamily:block.font==="serif"?"var(--serif)":block.font==="system"?"Arial, sans-serif":"var(--font)",fontWeight:block.bold?700:400,fontStyle:block.italic?"italic":"normal",textAlign:block.align,whiteSpace:"pre-line",overflowWrap:"anywhere"};
 const text=block.url&&block.type!=="image"?<a href={block.url}>{block.text}</a>:block.text;
 if(block.type==="h2")return <h2 key={block.id} style={style}>{text}</h2>;
 if(block.type==="h3")return <h3 key={block.id} style={style}>{text}</h3>;
 if(block.type==="quote")return <blockquote key={block.id} style={style}>{text}</blockquote>;
 if(block.type==="list")return <ul key={block.id} style={style}>{block.text.split("\n").filter(Boolean).map((line,index)=><li key={index}>{line}</li>)}</ul>;
 if(block.type==="image")return <figure key={block.id}><img src={block.url} alt={block.text} loading="lazy" /><figcaption>{block.text}</figcaption></figure>;
 return <p key={block.id} style={style}>{text}</p>;
 })}</div>;
}
