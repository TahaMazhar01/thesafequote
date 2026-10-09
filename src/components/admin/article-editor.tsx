"use client";
import { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyleKit } from "@tiptap/extension-text-style";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import { TableKit } from "@tiptap/extension-table";
import Placeholder from "@tiptap/extension-placeholder";
import { Bold, Italic, Underline, Strikethrough, List, ListOrdered, Quote, Code, Link2, Unlink, ImagePlus, AlignLeft, AlignCenter, AlignRight, Minus, Table2, Undo2, Redo2, RemoveFormatting } from "lucide-react";
import { blocksToRichText, imageLink, safeLink, type RichNode } from "@/lib/rich-text";
import type { BlogDocument } from "@/lib/blog";

export async function uploadBlogImage(file:File):Promise<string>{
 if(!["image/jpeg","image/png","image/webp"].includes(file.type)||file.size>5*1024*1024)throw new Error("Choose a JPG or PNG or WebP under 5 MB.");
 const response=await fetch("/api/admin/blog/images",{method:"POST",headers:{"Content-Type":file.type},body:file});const data=await response.json();if(!response.ok)throw new Error(data.error||"Image upload failed.");return data.url;
}

export function ArticleEditor({document,disabled,onChange}:{document:BlogDocument;disabled:boolean;onChange:(content:RichNode)=>void}){
 const [panel,setPanel]=useState<"link"|"image"|null>(null);const [url,setUrl]=useState("");const [alt,setAlt]=useState("");const [error,setError]=useState("");const [uploading,setUploading]=useState(false);const fileInput=useRef<HTMLInputElement>(null);
 const editor=useEditor({extensions:[StarterKit.configure({heading:{levels:[2,3]},link:{openOnClick:false,autolink:false,defaultProtocol:"https",protocols:["https"]}}),TextStyleKit,TextAlign.configure({types:["heading","paragraph"]}),Image,TableKit.configure({table:{resizable:false}}),Placeholder.configure({placeholder:"Start writing your story…"})],content:document.richContent||blocksToRichText(document.blocks),immediatelyRender:false,shouldRerenderOnTransaction:true,editorProps:{attributes:{class:"blog-writing-surface",role:"textbox","aria-label":"Article body","aria-multiline":"true"}},onUpdate:({editor})=>onChange(editor.getJSON() as RichNode)});
 useEffect(()=>{editor?.setEditable(!disabled&&!uploading,false);},[editor,disabled,uploading]);
 if(!editor)return <div className="blog-editor-loading">Opening editor…</div>;
 function applyUrl(){const valid=panel==="image"?imageLink.safeParse(url):safeLink.safeParse(url);if(!valid.success||!url){setError("Use an HTTPS URL or a valid site path.");return;}if(panel==="image")editor!.chain().focus().setImage({src:url,alt,title:alt}).run();else editor!.chain().focus().extendMarkRange("link").setLink({href:url}).run();setPanel(null);setError("");}
 async function upload(file?:File){if(!file)return;setUploading(true);setError("");try{const src=await uploadBlogImage(file);editor!.chain().focus().setImage({src,alt:alt||file.name.replace(/\.[^.]+$/,"")}).run();setPanel(null);}catch(error){setError((error as Error).message);}finally{setUploading(false);}}
 const tools=[
  {label:"Bold",Icon:Bold,active:editor.isActive("bold"),action:()=>editor.chain().focus().toggleBold().run()},
  {label:"Italic",Icon:Italic,active:editor.isActive("italic"),action:()=>editor.chain().focus().toggleItalic().run()},
  {label:"Underline",Icon:Underline,active:editor.isActive("underline"),action:()=>editor.chain().focus().toggleUnderline().run()},
  {label:"Strikethrough",Icon:Strikethrough,active:editor.isActive("strike"),action:()=>editor.chain().focus().toggleStrike().run()},
  {label:"Bullet list",Icon:List,active:editor.isActive("bulletList"),action:()=>editor.chain().focus().toggleBulletList().run()},
  {label:"Numbered list",Icon:ListOrdered,active:editor.isActive("orderedList"),action:()=>editor.chain().focus().toggleOrderedList().run()},
  {label:"Quote",Icon:Quote,active:editor.isActive("blockquote"),action:()=>editor.chain().focus().toggleBlockquote().run()},
  {label:"Code",Icon:Code,active:editor.isActive("codeBlock"),action:()=>editor.chain().focus().toggleCodeBlock().run()},
  {label:"Insert link",Icon:Link2,active:editor.isActive("link"),action:()=>{setUrl(editor.getAttributes("link").href||"");setPanel("link");}},
  {label:"Remove link",Icon:Unlink,action:()=>editor.chain().focus().unsetLink().run()},
  {label:"Insert image",Icon:ImagePlus,action:()=>{setUrl("");setAlt("");setPanel("image");}},
  {label:"Align left",Icon:AlignLeft,active:editor.isActive({textAlign:"left"}),action:()=>editor.chain().focus().setTextAlign("left").run()},
  {label:"Align centre",Icon:AlignCenter,active:editor.isActive({textAlign:"center"}),action:()=>editor.chain().focus().setTextAlign("center").run()},
  {label:"Align right",Icon:AlignRight,active:editor.isActive({textAlign:"right"}),action:()=>editor.chain().focus().setTextAlign("right").run()},
  {label:"Divider",Icon:Minus,action:()=>editor.chain().focus().setHorizontalRule().run()},
  {label:"Insert table",Icon:Table2,action:()=>editor.chain().focus().insertTable({rows:3,cols:3,withHeaderRow:true}).run()},
  {label:"Clear formatting",Icon:RemoveFormatting,action:()=>editor.chain().focus().unsetAllMarks().clearNodes().run()},
  {label:"Undo",Icon:Undo2,unavailable:!editor.can().undo(),action:()=>editor.chain().focus().undo().run()},
  {label:"Redo",Icon:Redo2,unavailable:!editor.can().redo(),action:()=>editor.chain().focus().redo().run()},
 ];
 return <div className="blog-editor-shell"><div className="blog-editor-toolbar" role="group" aria-label="Article formatting"><div className="blog-editor-selects">
 <select aria-label="Paragraph style" disabled={disabled} value={editor.isActive("heading",{level:2})?"h2":editor.isActive("heading",{level:3})?"h3":"paragraph"} onChange={e=>e.target.value==="paragraph"?editor.chain().focus().setParagraph().run():editor.chain().focus().setHeading({level:e.target.value==="h2"?2:3}).run()}><option value="paragraph">Paragraph</option><option value="h2">Heading 2</option><option value="h3">Heading 3</option></select>
 <select aria-label="Text font" disabled={disabled} value={editor.getAttributes("textStyle").fontFamily||"Manrope"} onChange={e=>editor.chain().focus().setFontFamily(e.target.value).run()}><option>Manrope</option><option>DM Serif Display</option><option>Arial</option><option>Georgia</option></select>
 <select aria-label="Text size" disabled={disabled} value={editor.getAttributes("textStyle").fontSize||""} onChange={e=>e.target.value?editor.chain().focus().setFontSize(e.target.value).run():editor.chain().focus().unsetFontSize().run()}><option value="">Auto size</option>{[14,16,18,20,23,24,28,30,32,36,42,48,52,64,72].map(size=><option key={size} value={`${size}px`}>{size}px</option>)}</select>
 <label className="blog-colour-control" title="Text colour">A<input aria-label="Text colour" type="color" disabled={disabled} value={/^#[a-f0-9]{6}$/i.test(editor.getAttributes("textStyle").color||"")?editor.getAttributes("textStyle").color:"#214f5a"} onInput={e=>editor.chain().focus().setColor(e.currentTarget.value).run()}/></label>
 <label className="blog-colour-control" title="Highlight colour">Highlight<input aria-label="Highlight colour" type="color" disabled={disabled} value={/^#[a-f0-9]{6}$/i.test(editor.getAttributes("textStyle").backgroundColor||"")?editor.getAttributes("textStyle").backgroundColor:"#fff0aa"} onInput={e=>editor.chain().focus().setBackgroundColor(e.currentTarget.value).run()}/></label>
 </div><div className="blog-editor-tools">{tools.map(({label,Icon,active,unavailable,action})=><button type="button" key={label} title={label} aria-label={label} aria-pressed={active} disabled={disabled||uploading||unavailable} onMouseDown={e=>e.preventDefault()} onClick={action}><Icon size={19}/></button>)}</div>
 {editor.isActive("table")&&<div className="blog-table-tools"><button onClick={()=>editor.chain().focus().addRowAfter().run()}>Add row</button><button onClick={()=>editor.chain().focus().addColumnAfter().run()}>Add column</button><button onClick={()=>editor.chain().focus().deleteRow().run()}>Delete row</button><button onClick={()=>editor.chain().focus().deleteColumn().run()}>Delete column</button><button onClick={()=>editor.chain().focus().deleteTable().run()}>Delete table</button></div>}
 {panel&&<div className="blog-link-panel"><label>{panel==="image"?"Image URL":"Link address"}<input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://"/></label>{panel==="image"&&<label>Image description<input value={alt} onChange={e=>setAlt(e.target.value)}/></label>}<button className="admin-button" onClick={applyUrl}>Insert</button>{panel==="image"&&<button className="admin-button secondary" disabled={uploading} onClick={()=>fileInput.current?.click()}>{uploading?"Uploading…":"Upload image"}</button>}<button className="admin-button secondary" onClick={()=>setPanel(null)}>Cancel</button></div>}
 </div><input hidden ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>{void upload(e.target.files?.[0]);e.target.value="";}}/>{error&&<p className="admin-error" role="alert">{error}</p>}<EditorContent editor={editor}/><div className="blog-editor-footer"><span>Select text to format it. Paste your article directly into the editor.</span><span>{editor.getText().trim().split(/\s+/).filter(Boolean).length} words</span></div></div>;
}
