import type { Metadata } from "next";
import Image from "next/image";
import { QuoteForm } from "@/components/quote-form";
import { Eyebrow } from "@/components/sections";
import { Icon } from "@/components/icon";
export const metadata: Metadata = { title: "Your free final expense quote", description: "Take the first step toward a little more peace of mind. Explore final expense coverage with a free, no-obligation quote request." };
export default async function QuotePage({ searchParams }: { searchParams: Promise<{ coverage?: string }> }) {
  const params = await searchParams;
  return <section className="section standalone-quote"><div className="container quote-layout"><div className="quote-page-intro"><Eyebrow>For the people you love</Eyebrow><h1>One small step.<br /><em>A little more <br />peace of mind.</em></h1><p>Explore final expense options with your family, your needs, and your budget at the heart of the conversation.</p><div className="quote-page-checks"><span><Icon name="check" size={17} /> Free, no-obligation quote</span><span><Icon name="check" size={17} /> Clear guidance from licensed agents</span><span><Icon name="check" size={17} /> Time and space to make your decision</span></div><div className="quote-page-photo"><Image src="/images/generations.jpg" alt="A reassuring moment between a grandmother and grandson" fill sizes="(max-width: 760px) 100vw, 40vw" /><span>Because love looks ahead.</span></div></div><QuoteForm initialCoverage={params.coverage} /></div></section>;
}
