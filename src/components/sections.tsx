import Image from "next/image";
import Link from "next/link";
import { Icon } from "./icon";
import { Reveal } from "./reveal";
import { NumberBadge } from "./number-badge";
export { PlanCards } from "./plan-cards";

export function Eyebrow({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return <span className={`eyebrow ${light ? "eyebrow-light" : ""}`}><span />{children}</span>;
}
export function PageHero({ eyebrow, title, accent, description }: { eyebrow: string; title: string; accent?: string; description: string }) {
  return <section className="page-hero"><div className="container"><div className="breadcrumb"><Link href="/">Home</Link><span>/</span><span>{eyebrow}</span></div><Eyebrow>{eyebrow}</Eyebrow><h1>{title} {accent && <em>{accent}</em>}</h1><p>{description}</p></div><span className="hero-deco" aria-hidden="true" /></section>;
}
export function Process({ compact = false }: { compact?: boolean }) {
  const steps = [ { title: "Tell us a little about you.", text: "Start with a few simple details and let us know what kind of coverage you’re looking for.", icon: "message" }, { title: "Let’s explore your options.", text: "A licensed specialist can explain available plans and help you compare what fits your budget.", icon: "layers" }, { title: "Choose with confidence.", text: "Take your time, ask questions, and decide on your next step. There’s no obligation to enroll.", icon: "shield" } ];
  return <section className={`section process-section ${compact ? "compact" : ""}`} id="how-it-works"><div className="container"><Reveal><div className="section-heading centered"><Eyebrow>A simpler way forward</Eyebrow><h2>A few small steps.<br /><em>A meaningful difference.</em></h2><p>Insurance can feel complicated. Getting started shouldn’t.</p></div></Reveal><div className="process-grid">{steps.map((step, index) => <Reveal key={step.title} delay={index * 100}><article className="process-step"><div className="step-line"><NumberBadge number={index + 1} label="Step" /><span className="step-icon"><Icon name={step.icon} size={25} /></span></div><h3>{step.title}</h3><p>{step.text}</p></article></Reveal>)}</div><div className="center-action"><Link className="button" href="/quote">Let’s get started <Icon name="arrow" size={18} /></Link><span>No cost. No pressure. Just possibilities.</span></div></div></section>;
}
export { ClosingCta } from "./closing-cta";
export function FamilyPhoto({ className = "", priority = false }: { className?: string; priority?: boolean }) {
  return <Image className={className} src="/images/family-together.jpg" alt="A family enjoying time together in a sunlit meadow" fill sizes="(max-width: 760px) 100vw, 50vw" priority={priority} />;
}
