/* eslint-disable @next/next/no-img-element */
import { cache, type CSSProperties } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPool } from "@/lib/server/db";
import { blogSchema } from "@/lib/blog";
import { BlogContent } from "@/components/blog-content";
export const dynamic="force-dynamic";
const getPost=cache(async(slug:string)=>{const result=await getPool().query("SELECT document,published_at FROM fa_blog_posts WHERE slug=$1 AND status='published' AND deleted_at IS NULL",[slug]);if(!result.rowCount)notFound();return {...result.rows[0],document:blogSchema.parse(result.rows[0].document)};});
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params;const {document}=await getPost(slug);return {title:document.title,description:document.excerpt,alternates:{canonical:`/blog/${slug}`},openGraph:{title:document.title,description:document.excerpt,type:"article",images:[document.cover]}};}
export default async function Article({params}:{params:Promise<{slug:string}>}){const {document:post,published_at}=await getPost((await params).slug);return <article className="blog-article"><header><Link href="/blog" className="text-link">← Back to the journal</Link><span className="eyebrow">{post.category}</span><h1 style={{"--article-title-size":`${post.titleSize}px`,color:post.titleColor} as CSSProperties}>{post.title}</h1><p className="blog-deck">{post.excerpt}</p><p className="blog-byline">{post.author} · {new Date(published_at).toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric",timeZone:"Asia/Karachi"})}</p></header><figure className="blog-cover"><img src={post.cover} alt={post.coverAlt} width={1200} height={750}/>{post.credit&&<figcaption>{post.creditUrl?<a href={post.creditUrl}>{post.credit}</a>:post.credit}</figcaption>}</figure><BlogContent document={post}/><aside className="blog-next"><h2>Make time for your questions.</h2><p>A thoughtful conversation can help you decide on your next step.</p><Link href="/contact" className="button">Talk with us →</Link></aside></article>;}
