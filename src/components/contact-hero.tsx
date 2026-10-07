import Image from "next/image";
import Link from "next/link";
import { Eyebrow } from "./sections";
import { Icon } from "./icon";

export function ContactHero() {
  return <section className="page-hero contact-hero">
    <div className="container">
      <div className="breadcrumb"><Link href="/">Home</Link><span>/</span><span>Contact us</span></div>
      <div className="contact-hero-grid">
        <div className="contact-hero-copy">
          <Eyebrow>Contact us</Eyebrow>
          <h1>You bring the questions.<em>We’ll bring the care.</em></h1>
          <p>Whether you’re ready to explore a plan or simply want to understand your options, a conversation is a good place to start.</p>
          <Link className="text-link" href="#contact-form">Let’s start a conversation <Icon name="arrow" size={19} /></Link>
        </div>
        <figure className="contact-hero-photo">
          <div className="contact-photo-orbits">
            <div className="contact-orbit contact-orbit-main"><Image src="/images/contact-senior-couple.jpg" alt="A senior couple laughing together while sitting outdoors" fill quality={90} sizes="(max-width: 760px) 75vw, (max-width: 1100px) 34vw, 390px" /></div>
            <div className="contact-orbit contact-orbit-detail"><Image src="/images/contact-holding-hands.jpg" alt="An older couple holding hands in a close-up moment of connection" fill quality={90} sizes="(max-width: 760px) 38vw, 200px" /></div>
          </div>
          <figcaption><span className="contact-photo-heart"><Icon name="heart" size={23} /></span><span><strong>A little care goes a long way.</strong><small>For you. For the people you love.</small></span></figcaption>
        </figure>
      </div>
    </div>
  </section>;
}
