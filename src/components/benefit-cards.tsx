import { BenefitIllustration } from "./benefit-illustration";
import Link from "next/link";
import { benefits } from "@/lib/content";
import { Icon } from "./icon";
import { Reveal } from "./reveal";

const actions = [
  { label: "Clear guidance", href: "/contact" },
  { label: "Your budget, your plan", href: "/quote" },
  { label: "No obligation", href: "/quote" },
  { label: "Explore your options", href: "/plans" },
  { label: "For the ones you love", href: "/quote" },
  { label: "Start a conversation", href: "/contact" },
];

export function BenefitCards() {
  return <div className="benefits-grid sculpted-benefits">{benefits.map((benefit, index) => <Reveal key={benefit.title} delay={(index % 3) * 70}>
    <article className="benefit-card sculpted-benefit">
      <div className="benefit-copy"><h3>{benefit.title}</h3><p>{benefit.text}</p></div>
      <div className="benefit-art"><BenefitIllustration variant={index} /></div>
      <Link href={actions[index].href} className="benefit-action" aria-label={`${actions[index].label}: ${benefit.title}`}><span>{actions[index].label}</span><span className="benefit-arrow"><Icon name="arrow" size={17} /></span></Link>
    </article>
  </Reveal>)}</div>;
}
