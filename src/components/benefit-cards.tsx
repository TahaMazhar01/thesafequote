import { useId } from "react";
import Link from "next/link";
import { benefits } from "@/lib/content";
import { Icon } from "./icon";
import { Reveal } from "./reveal";

// Vector sculptures stay crisp at every size without adding image downloads.
function BenefitSculpture({ variant }: { variant: number }) {
  const id = useId().replaceAll(":", "");
  const shape = variant % 3;
  return <svg className={`benefit-sculpture sculpture-${shape}`} viewBox="0 0 320 240" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id={`${id}-face`} x1="60" y1="35" x2="245" y2="205" gradientUnits="userSpaceOnUse"><stop stopColor="#a1c9c5" /><stop offset=".38" stopColor="#47949b" /><stop offset="1" stopColor="#185369" /></linearGradient>
      <linearGradient id={`${id}-edge`} x1="90" y1="70" x2="240" y2="220" gradientUnits="userSpaceOnUse"><stop stopColor="#347480" /><stop offset="1" stopColor="#103a4c" /></linearGradient>
      <linearGradient id={`${id}-ribbon`} x1="40" y1="190" x2="270" y2="55" gradientUnits="userSpaceOnUse"><stop stopColor="#174b59" /><stop offset=".45" stopColor="#3b8792" /><stop offset=".7" stopColor="#a1c9c5" /><stop offset="1" stopColor="#286876" /></linearGradient>
    </defs>
    {shape === 0 ? <g transform="rotate(-18 160 120)">
      <path d="M20 204C57 122 139 223 195 167C248 114 107 88 129 43C145 11 245 53 302 109" stroke={`url(#${id}-edge)`} strokeWidth="57" strokeLinecap="round" transform="translate(7 13)" />
      <path d="M20 204C57 122 139 223 195 167C248 114 107 88 129 43C145 11 245 53 302 109" stroke={`url(#${id}-ribbon)`} strokeWidth="53" strokeLinecap="round" />
    </g> : shape === 1 ? <g transform="translate(14 6) rotate(-19 150 120) skewX(-8)">
      <path d="M115 20H166L174 45L196 54L220 42L255 79L242 103L250 126L277 135V184L248 192L240 214L214 231L185 215L162 222L151 245H102L94 220L71 210L47 223L13 186L25 163L17 140L-8 131V81L19 73L29 52L54 34L82 49L106 42Z M135 85A48 57 0 1 0 135 199A48 57 0 1 0 135 85Z" fill={`url(#${id}-edge)`} fillRule="evenodd" transform="translate(15 8) scale(.85)" />
      <path d="M115 20H166L174 45L196 54L220 42L255 79L242 103L250 126L277 135V184L248 192L240 214L214 231L185 215L162 222L151 245H102L94 220L71 210L47 223L13 186L25 163L17 140L-8 131V81L19 73L29 52L54 34L82 49L106 42Z M135 85A48 57 0 1 0 135 199A48 57 0 1 0 135 85Z" fill={`url(#${id}-face)`} fillRule="evenodd" transform="scale(.85)" />
    </g> : <g transform="rotate(-33 160 120)">
      {[0, 1, 2].map(i => <g key={i} transform={`translate(${i * 44} ${-i * 4})`}>
        <ellipse cx="107" cy="128" rx="55" ry="88" stroke={`url(#${id}-edge)`} strokeWidth="37" transform="translate(10 7)" />
        <ellipse cx="107" cy="128" rx="55" ry="88" stroke={`url(#${id}-face)`} strokeWidth="34" />
      </g>)}
    </g>}
  </svg>;
}

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
      <BenefitSculpture variant={index} />
      <Link href={actions[index].href} className="benefit-action" aria-label={`${actions[index].label}: ${benefit.title}`}><span>{actions[index].label}</span><span className="benefit-arrow"><Icon name="arrow" size={17} /></span></Link>
    </article>
  </Reveal>)}</div>;
}
