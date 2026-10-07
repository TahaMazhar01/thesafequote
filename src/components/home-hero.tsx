import Image from "next/image";
import Link from "next/link";
import { Icon } from "./icon";

export function HomeHero() {
  return (
    <section className="editorial-hero" aria-label="A thoughtful plan for your family">
      <div className="editorial-hero-inner">
        <div className="hero-introduction">
          <div className="hero-promise">
            <span className="hero-kicker"><span className="hero-brand-dot" /> Final expense insurance, made personal</span>
            <p>A little planning today.<br />A little more peace of mind tomorrow.</p>
            <Link href="#get-quote">Find my free quote <Icon name="arrow" size={19} /></Link>
          </div>
          <Link className="hero-options-count" href="#coverage-options" aria-label="Explore our three coverage options">
            <span className="hero-count-number" aria-hidden="true">03</span>
            <span className="hero-count-label">Paths to protection</span>
          </Link>
        </div>
        <div className="hero-stage">
          <h1 className="editorial-wordmark">
            <span className="hero-name-main" aria-hidden="true">THE SAFE</span>
            <span className="hero-name-end" aria-hidden="true">QUOTE</span>
            <span className="sr-only">TheSafeQuote: final expense insurance for the ones you love.</span>
          </h1>
          <figure className="hero-family-figure">
            <div className="hero-portrait-frame">
              <Image src="/images/hero-family-cutout.png" alt="A smiling mother and father with their two children on their shoulders" fill priority sizes="(max-width: 760px) 90vw, (max-width: 1360px) 70vw, 880px" />
            </div>
          </figure>
        </div>
      </div>
    </section>
  );
}
