import type { Metadata } from "next";
import Link from "next/link";
import { QuoteForm } from "@/components/quote-form";
import { Eyebrow } from "@/components/sections";
import { ContactHero } from "@/components/contact-hero";
import { Icon } from "@/components/icon";
export const metadata: Metadata = { title: "Let’s talk", description: "Request a conversation with a final expense specialist. Get answers and explore options for your needs and budget." };
export default function ContactPage() {
  return <><ContactHero /><section className="section contact-section" id="contact-form"><div className="container quote-layout"><div className="contact-copy"><Eyebrow>Let’s take the next step together</Eyebrow><h2>A real conversation.<br /><em>A clearer path forward.</em></h2><p>Share your details and a licensed final expense specialist can help you review options that fit your needs and budget.</p><div className="contact-info"><span className="icon-tile"><Icon name="clock" size={25} /></span><div><h3>Time to talk</h3><p>Typical agent availability is Monday through Friday during standard business hours. Weekend callbacks may be available by appointment.</p></div></div><div className="contact-info"><span className="icon-tile"><Icon name="checks" size={25} /></span><div><h3>A little preparation helps</h3><p>Have your age, basic health history, desired coverage amount, and a comfortable monthly budget in mind.</p></div></div><div className="contact-info"><span className="icon-tile"><Icon name="mail" size={25} /></span><div><h3>Keep an eye on your inbox</h3><p>After a live quote request, agents and partners may follow up by phone, text, or email as described in your consent.</p></div></div><Link href="/faq" className="text-link">Find answers to common questions <Icon name="arrow" size={18} /></Link></div><QuoteForm callback /></div></section></>;
}
