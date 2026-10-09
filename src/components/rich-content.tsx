/* eslint-disable @next/next/no-img-element */
import { createElement, type CSSProperties, type ReactNode } from "react";
import type { RichNode } from "@/lib/rich-text";

export function RichContent({content}:{content:RichNode}) {
 function render(node:RichNode,key:string):ReactNode {
  const children=node.content?.map((child,index)=>render(child,`${key}-${index}`));
  const attrs=node.attrs||{};const style:CSSProperties={textAlign:attrs.textAlign||undefined};
  if(node.type==="text"){
   let text:ReactNode=node.text||"";
   for(const mark of node.marks||[]){const a=mark.attrs||{};
    if(mark.type==="link")text=<a href={a.href} rel="noopener noreferrer">{text}</a>;
    else if(mark.type==="textStyle")text=<span style={{color:a.color||undefined,backgroundColor:a.backgroundColor||undefined,fontFamily:a.fontFamily||undefined,fontSize:a.fontSize||undefined,lineHeight:a.lineHeight||undefined}}>{text}</span>;
    else {const tag={bold:"strong",italic:"em",underline:"u",strike:"s",code:"code"}[mark.type];if(tag)text=createElement(tag,null,text);}
   }return <span key={key}>{text}</span>;
  }
  if(node.type==="image")return <figure key={key}><img src={attrs.src} alt={attrs.alt||""} title={attrs.title||undefined} loading="lazy"/>{attrs.title&&<figcaption>{attrs.title}</figcaption>}</figure>;
  if(node.type==="hardBreak")return <br key={key}/>;
  if(node.type==="horizontalRule")return <hr key={key}/>;
  if(node.type==="doc")return <div key={key}>{children}</div>;
  if(node.type==="codeBlock")return <pre key={key}><code>{children}</code></pre>;
  if(node.type==="table")return <div className="blog-table-scroll" key={key}><table><tbody>{children}</tbody></table></div>;
  if(node.type==="tableCell"||node.type==="tableHeader")return createElement(node.type==="tableCell"?"td":"th",{key,colSpan:attrs.colspan,rowSpan:attrs.rowspan},children);
  const tag=node.type==="heading"?(attrs.level===3?"h3":"h2"):({paragraph:"p",bulletList:"ul",orderedList:"ol",listItem:"li",blockquote:"blockquote",tableRow:"tr"} as Record<string,string>)[node.type];
  return tag?createElement(tag,{key,style,...(node.type==="orderedList"?{start:attrs.start}:{})},children):null;
 }
 return <div className="blog-prose blog-rich-content">{render(content,"article")}</div>;
}
