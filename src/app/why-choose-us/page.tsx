import type { Metadata } from "next";
import { ClosingCta, Eyebrow, PageHero, Process } from "@/components/sections";
import { FamilyMission } from "@/components/family-mission";
import { BenefitCards } from "@/components/benefit-cards";

export const metadata: Metadata = { title: "Why families choose us", description: "A personal approach to final expense insurance. Clear explanations, options for your budget, and space to choose with confidence." };

export default function WhyPage() {
  return <>
    <PageHero eyebrow="Why choose us" title="Insurance is personal." accent="We treat it that way." description="Behind every quote is a family, a story, and someone who wants to do right by the people they love. That’s where we begin." />
    <FamilyMission />
    <section className="section value-section" id="our-difference">
      <div className="container">
        <div className="section-heading centered"><Eyebrow>TheSafeQuote’s difference</Eyebrow><h2>Here for the things <em>that matter.</em></h2></div>
        <BenefitCards />
      </div>
    </section>
    <Process />
    <ClosingCta />
  </>;
}
