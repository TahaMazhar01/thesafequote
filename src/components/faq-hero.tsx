import Image from "next/image";
import Link from "next/link";
import { Eyebrow } from "./sections";
import { Icon } from "./icon";
import styles from "./faq-hero.module.css";

export function FaqHero() {
  return <section className={styles.hero} aria-labelledby="faq-title">
    <div className="container">
      <div className={`breadcrumb ${styles.breadcrumb}`}><Link href="/">Home</Link><span>/</span><span>Common questions</span></div>
      <div className={styles.layout}>
        <div className={styles.copy}>
          <Eyebrow>Common questions</Eyebrow>
          <h1 id="faq-title">A little less uncertainty.<br /><em>A little more clarity.</em></h1>
          <p>Insurance has its share of questions. Let’s work through yours, one clear answer at a time.</p>
          <div className={styles.actions}>
            <a className="button" href="#faq-answers">Browse questions <Icon name="down" size={18} /></a>
            <Link className="text-link" href="/contact">Let’s talk <Icon name="arrow" size={18} /></Link>
          </div>
        </div>
        <figure className={styles.visual}>
          <div className={styles.photo}>
            <Image src="/images/faq-guidance.jpg" alt="A couple reviewing documents and asking questions during a consultation" fill sizes="(max-width: 760px) calc(100vw - 40px), (max-width: 1200px) 45vw, 550px" quality={90} preload />
          </div>
          <figcaption><span className={styles.captionIcon}><Icon name="message" size={23} /></span><div><strong>Good questions. Clear conversations.</strong><span>A little understanding goes a long way.</span></div></figcaption>
        </figure>
      </div>
    </div>
  </section>;
}
