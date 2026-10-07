import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { Reveal } from "@/components/reveal";
import { ClosingCta, Eyebrow, PlanCards, Process } from "@/components/sections";
import { FaqList } from "@/components/faq-list";
import { QuoteForm } from "@/components/quote-form";
import { HomeHero } from "@/components/home-hero";
import { CarrierMarquee } from "@/components/carrier-marquee";

export default function Home() {
  return <div className="home-page">
    <HomeHero />
    <CarrierMarquee />
    <section className="section plans-section" id="coverage-options"><div className="container"><Reveal><div className="section-heading heading-row"><div><Eyebrow>Protection, made personal</Eyebrow><h2>Different lives.<br /><em>Thoughtful options.</em></h2></div><div className="heading-side"><p>Every family has its own story. Let’s explore a plan that fits yours, with your needs and budget in mind.</p><Link href="/plans" className="text-link">Explore all plans <Icon name="arrow" size={18} /></Link></div></div></Reveal><PlanCards /><p className="section-footnote">Plan availability, benefits, and eligibility vary by carrier and state. A licensed agent can help you understand the details.</p></div></section>
    <section className="care-section"><div className="container care-grid"><Reveal className="care-visual"><Image src="/images/family-generations-hd.png" alt="A grandfather, father, and son laughing together outdoors" fill quality={90} sizes="(max-width: 760px) 100vw, 45vw" /><div className="care-photo-label"><Icon name="heart" size={19} /><span>Some things are worth planning for.</span></div></Reveal><Reveal className="care-copy"><Eyebrow light>A little planning is an act of love</Eyebrow><h2>Leave them memories.<br /><em>Help ease the worry.</em></h2><p>Final expense insurance can help your loved ones handle life’s practical details during an emotional time. It’s a way to give them a little breathing room when they need it most.</p><div className="coverage-list">{[{ title: "Funeral & memorial services", text: "Help your family honor your life in a meaningful way." }, { title: "Burial or cremation expenses", text: "Plan for the arrangements that reflect your wishes." }, { title: "Remaining bills & everyday needs", text: "Give loved ones support with costs left behind." }].map(item => <div key={item.title}><span><Icon name="check" size={17} /></span><div><h3>{item.title}</h3><p>{item.text}</p></div></div>)}</div><Link className="text-link text-link-light" href="/why-choose-us">Discover TheSafeQuote’s difference <Icon name="arrow" size={19} /></Link></Reveal></div></section>
    <Process />
    <section className="section quote-section" id="get-quote"><div className="container quote-layout"><Reveal className="quote-intro"><Eyebrow>Whenever you’re ready</Eyebrow><h2>For your family.<br /><em>For your peace <br />of mind.</em></h2><p>Start with a few details. Explore coverage that fits your family and your budget.</p><div className="quote-benefits"><div><span><Icon name="wallet" size={24} /></span><div><h3>Your budget. Your priorities.</h3><p>Find a comfortable balance between coverage and monthly cost.</p></div></div><div><span><Icon name="message" size={24} /></span><div><h3>A conversation, not a commitment.</h3><p>Get clear explanations and room to decide what feels right.</p></div></div><div><span><Icon name="shield" size={24} /></span><div><h3>Guidance at every step.</h3><p>Ask about benefits, waiting periods, and what to expect.</p></div></div></div><div className="quote-help"><Icon name="handshake" size={32} /><p>Prefer to start with a question?<br /><Link href="/contact">We’re here to help <Icon name="arrow" size={15} /></Link></p></div></Reveal><Reveal><QuoteForm /></Reveal></div></section>
    <section className="section faq-section"><div className="container faq-layout"><Reveal><Eyebrow>A little clarity goes a long way</Eyebrow><h2>Good questions.<br /><em>Clear answers.</em></h2><p>You deserve to understand the details before making a decision.</p><Link href="/faq" className="text-link">More answers, right here <Icon name="arrow" size={18} /></Link><div className="faq-art" aria-hidden="true"><Icon name="message" size={66} /><span><Icon name="heart" size={25} /></span></div></Reveal><Reveal><FaqList /></Reveal></div></section>
    <ClosingCta />
  </div>;
}

