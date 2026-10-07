import Link from "next/link";
import { Icon } from "./icon";
import { Eyebrow } from "./sections";
import { Reveal } from "./reveal";
import styles from "./health-plan-options.module.css";

const medicareOptions = [
  {
    name: "Medicare Parts A & B",
    label: "Original Medicare",
    icon: "shield",
    description: "A foundation for your health coverage. Part A helps with inpatient hospital care, while Part B helps with doctor visits, outpatient care, and preventive services.",
    points: ["Hospital and medical coverage", "Separate drug coverage may be added", "Premiums and cost-sharing may apply"],
  },
  {
    name: "Medicare Advantage",
    label: "Part C",
    icon: "layers",
    description: "An alternative to Original Medicare through a Medicare-approved private plan. It combines Part A and Part B benefits, usually with prescription drug coverage.",
    points: ["Some plans include dental and vision benefits", "Provider networks and approvals may apply", "Benefits and costs vary by plan and location"],
  },
  {
    name: "Medicare Supplement",
    label: "Medigap",
    icon: "handshake",
    description: "Extra coverage that works alongside Original Medicare to help pay certain out-of-pocket costs, such as copayments, coinsurance, and deductibles.",
    points: ["Designed for people with Parts A and B", "Different from Medicare Advantage", "Enrollment timing can affect your options"],
  },
];

const supplementalOptions = [
  {
    name: "Hospital Indemnity Insurance",
    label: "Support during a hospital stay",
    icon: "wallet",
    description: "Provides fixed cash benefits for covered hospital stays. These benefits can help with expenses while you focus on recovery.",
    points: ["Payments follow the policy’s benefit schedule", "Review covered stays, limits, and exclusions"],
  },
  {
    name: "Dental & Vision Coverage",
    label: "Care for your everyday health",
    icon: "sun",
    description: "Explore coverage for dental and eye care, with benefits that may include checkups, cleanings, eye exams, and eyewear, depending on the plan.",
    points: ["Check participating dentists and eye-care providers", "Compare allowances, waiting periods, and limits"],
  },
  {
    name: "Cancer Insurance",
    label: "Additional financial support",
    icon: "heart",
    description: "Supplemental coverage that may pay benefits for a covered cancer diagnosis or treatment. Payment amounts and qualifying conditions depend on the policy.",
    points: ["Benefits may be a lump sum or scheduled payments", "Review covered diagnoses and waiting periods"],
  },
];

function CoverageCards({ options }: { options: typeof supplementalOptions }) {
  return <div className={styles.grid}>{options.map((option, index) => (
    <Reveal key={option.name} delay={index * 80} className={styles.cardWrap}>
      <article className={styles.card}>
        <div className={styles.cardTop}><span className={styles.icon}><Icon name={option.icon} size={25} /></span><span className={styles.number}>0{index + 1}</span></div>
        <span className={styles.label}>{option.label}</span>
        <h3>{option.name}</h3>
        <p>{option.description}</p>
        <ul>{option.points.map(point => <li key={point}><Icon name="check" size={16} /><span>{point}</span></li>)}</ul>
        <Link href="/contact" className={styles.cardLink} aria-label={`Ask about ${option.name}`}>Let’s talk about your options <Icon name="arrow" size={19} /></Link>
      </article>
    </Reveal>
  ))}</div>;
}

export function HealthPlanOptions() {
  return <>
    <nav className={styles.navigation} aria-label="Coverage categories"><div className="container">
      <span>Find your coverage</span>
      <a href="#medicare-options">Medicare <Icon name="down" size={14} /></a>
      <a href="#supplemental-options">Supplemental coverage <Icon name="down" size={14} /></a>
      <a href="#medicaid-guidance">Medicaid <Icon name="down" size={14} /></a>
      <a href="#final-expense-options">Final expense <Icon name="down" size={14} /></a>
    </div></nav>
    <section className={`section ${styles.medicare}`} id="medicare-options" aria-labelledby="medicare-heading"><div className="container">
      <Reveal><div className="section-heading"><Eyebrow>Understand your Medicare choices</Eyebrow><h2 id="medicare-heading">A clearer path to <em>health coverage.</em></h2><p>Start with the basics, then explore how different options work together.</p></div></Reveal>
      <CoverageCards options={medicareOptions} />
      <p className={styles.note}>Compare enrollment rules, providers, prescriptions, and total costs before choosing. Read the <a href="https://www.medicare.gov/basics/get-started-with-medicare/medicare-basics/parts-of-medicare">Medicare overview</a> or learn about <a href="https://www.medicare.gov/health-drug-plans/medigap/basics">Medigap</a>.</p>
    </div></section>
    <section className={`section ${styles.supplemental}`} id="supplemental-options" aria-labelledby="supplemental-heading"><div className="container">
      <Reveal><div className="section-heading"><Eyebrow>A little extra reassurance</Eyebrow><h2 id="supplemental-heading">Support for life’s <em>unexpected moments.</em></h2><p>Explore additional coverage for specific health needs and expenses.</p></div></Reveal>
      <CoverageCards options={supplementalOptions} />
      <p className={styles.note}>These policies provide limited benefits and do not replace comprehensive health insurance. Availability, eligibility, exclusions, and benefits vary by policy and state. <a href="https://content.naic.org/consumer/health-insurance.htm">Understand supplemental coverage.</a></p>
    </div></section>
    <section className={`section ${styles.medicaid}`} id="medicaid-guidance" aria-labelledby="medicaid-heading"><div className="container">
      <Reveal className={styles.medicaidPanel}>
        <div><Eyebrow light>Understand public coverage</Eyebrow><h2 id="medicaid-heading">Medicaid.<br /><span>Know where to start.</span></h2></div>
        <div><p>Medicaid provides health coverage for eligible people and families through a joint federal and state program. Your state determines eligibility and manages applications.</p><p>It is different from Medicare. Some people qualify for both programs.</p><a className="button button-gold" href="https://www.medicaid.gov/about-us/where-can-people-get-help-medicaid-chip">Find your state’s Medicaid program <Icon name="arrow" size={18} /></a></div>
      </Reveal>
    </div></section>
  </>;
}
