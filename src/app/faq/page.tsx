import type { Metadata } from "next";
import Link from "next/link";
import { ClosingCta } from "@/components/sections";
import { FaqHero } from "@/components/faq-hero";
import { FaqList } from "@/components/faq-list";
import { Icon } from "@/components/icon";
export const metadata: Metadata = { title: "Your questions, answered", description: "Understand final expense insurance, eligibility, waiting periods, premiums, and the quote process with our frequently asked questions." };
export default function FaqPage() {
  return <><FaqHero /><section className="section" id="faq-answers"><div className="container faq-page-layout"><div><FaqList full /><p className="section-footnote">General information only. Policy details vary by carrier and state. A licensed agent can discuss your specific situation.</p></div><aside className="help-card"><span className="icon-tile"><Icon name="message" size={29} /></span><h2>Still have something<br />on your mind?</h2><p>Some questions are better answered in a conversation. We’re here for those, too.</p><Link href="/contact" className="button">Let’s talk <Icon name="arrow" size={18} /></Link><span className="small-reassurance">At your pace. On your terms.</span></aside></div></section><ClosingCta /></>;
}
