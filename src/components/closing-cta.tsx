import Image from "next/image";
import Link from "next/link";
import { Icon } from "./icon";
import { Reveal } from "./reveal";
import styles from "./closing-cta.module.css";

export function ClosingCta() {
  return <section className={styles.section} id="family-next-step" aria-label="Take the next step for your family">
    <div className="container">
      <Reveal className={styles.panel}>
        <figure className={styles.visual}>
          <div className={styles.photo}>
            <Image src="/images/closing-family-moment.jpg" alt="Grandparents embracing their granddaughter in a sunny mountain landscape" fill quality={90} sizes="(max-width: 760px) 90vw, (max-width: 1400px) 38vw, 490px" />
            <span className={styles.photoBadge}><Icon name="heart" size={15} /> The people who matter most.</span>
          </div>
          <figcaption><span>More moments together.</span><span>More reasons to plan.</span></figcaption>
        </figure>
        <div className={styles.copy}>
          <span className={styles.eyebrow}><span /> A thoughtful next step</span>
          <h2>Their tomorrow.<br /><em>Your peace of mind.</em></h2>
          <p>The little things you do today can mean so much to the people you love. Let’s explore a plan that feels right for your family.</p>
          <div className={styles.actions}>
            <Link href="/quote" className={styles.primary}>Get my free quote <span><Icon name="arrow" size={20} /></span></Link>
            <Link href="/contact" className={styles.secondary}>Have a question? Let’s talk <Icon name="arrow" size={16} /></Link>
          </div>
          <div className={styles.reassurance}><Icon name="shield" size={19} /><span>A simple first step.<strong>No obligation to purchase.</strong></span></div>
        </div>
      </Reveal>
    </div>
  </section>;
}
