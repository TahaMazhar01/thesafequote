/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { Metadata } from "next";
import { getPool } from "@/lib/server/db";
import type { BlogDocument } from "@/lib/blog";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Family planning journal",description:"Thoughtful guides to insurance conversations and planning for the people you love.",alternates:{canonical:"/blog"}};
export default async function BlogPage({searchParams}:{searchParams:Promise<{page?:string}>}) {
 const params=await searchParams;const page=Math.floor(Math.min(10000,Math.max(1,Number(params.page)||1)));
 const result=await getPool().query("SELECT slug,document,published_at FROM fa_blog_posts WHERE status='published' AND deleted_at IS NULL ORDER BY published_at DESC,id LIMIT 10 OFFSET $1",[(Math.floor(page)-1)*9]);
 return <><section className="blog-intro"><div className="container"><span className="eyebrow">THE SAFE QUOTE JOURNAL</span><h1>A little clarity.<br /><em>A more thoughtful tomorrow.</em></h1><p>Practical reading for the conversations that matter.</p></div></section><section className="section"><div className="container"><div className="blog-grid">{result.rows.slice(0,9).map((row:{slug:string;document:BlogDocument;published_at:string})=><article className="blog-card" key={row.slug}><Link href={`/blog/${row.slug}`}><img src={row.document.cover} alt={row.document.coverAlt} loading="lazy" width={960} height={640}/><div><span className="eyebrow">{row.document.category}</span><h2>{row.document.title}</h2><p>{row.document.excerpt}</p><span className="blog-read">Read the story →</span></div></Link></article>)}</div>{!result.rows.length&&<p>New stories are on their way.</p>}<nav className="blog-pagination" aria-label="Blog pages">{page>1&&<Link href={`/blog?page=${page-1}`}>← Previous</Link>}{result.rows.length>9&&<Link href={`/blog?page=${page+1}`}>Next →</Link>}</nav></div></section></>;
}
