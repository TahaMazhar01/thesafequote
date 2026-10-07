import Link from "next/link";
import { Brand } from "./header";
import { Icon } from "./icon";
import styles from "./footer.module.css";

const coverageLinks = [
  { href: "/plans#medicare-options", label: "Medicare options" },
  { href: "/plans#supplemental-options", label: "Supplemental coverage" },
  { href: "/plans#medicaid-guidance", label: "Medicaid guidance" },
  { href: "/plans#final-expense-options", label: "Final expense insurance" },
];

export function Footer() {
  return <footer className={styles.footer}>
    <div className="container">
      <div className={styles.invitation}>
        <div><span className={styles.eyebrow}>A little planning. A lot of love.</span><h2>Your next chapter.<br /><em>A little more peace of mind.</em></h2></div>
        <div className={styles.invitationAction}><Link className="button button-gold" href="/quote">Find my free quote <Icon name="arrow" size={19} /></Link><span><Icon name="check" size={14} /> No obligation to purchase</span></div>
      </div>
      <div className={styles.navigation}>
        <div className={styles.brand}><Brand /><p>A thoughtful plan for the people<br />who make life meaningful.</p><span className={styles.signoff}><Icon name="heart" size={18} /> For your family. For your peace of mind.</span></div>
        <nav aria-label="Footer coverage"><h3>Explore coverage</h3>{coverageLinks.map(link => <Link key={link.href} href={link.href}>{link.label}</Link>)}</nav>
        <nav aria-label="Footer company"><h3>TheSafeQuote</h3><Link href="/why-choose-us">Why choose us</Link><Link href="/faq">Questions & answers</Link><Link href="/contact">Contact us</Link><Link href="/legal">Legal information</Link></nav>
        <div className={styles.help}><span className={styles.helpIcon}><Icon name="message" size={23} /></span><h3>A question is a<br />good place to start.</h3><p>Let’s make the next step feel simpler.</p><Link href="/contact">Start a conversation <Icon name="arrow" size={18} /></Link></div>
      </div>
      <div className={styles.disclaimer}><Icon name="shield" size={20} /><p>TheSafeQuote connects consumers with licensed insurance professionals and partner companies. Coverage, premiums, availability, and eligibility vary by carrier, state, age, and health history. Information on this site does not constitute an offer or guarantee of coverage. Policy terms, limitations, exclusions, and waiting periods may apply.</p></div>
      <div className={styles.bottom}><span>© {new Date().getFullYear()} TheSafeQuote. All rights reserved.</span><nav aria-label="Footer policies"><Link href="/legal#terms">Terms & conditions</Link><Link href="/legal#privacy">Privacy policy</Link><Link href="/legal#tcpa">TCPA disclosure</Link></nav></div>
    </div>
  </footer>;
}
