import Image from "next/image";
import Link from "next/link";
import { Eyebrow } from "./sections";
import { Icon } from "./icon";
import { Reveal } from "./reveal";

const principles = [
  { icon: "", title: "Our vision", text: "A little more confidence for every family. Understand your options today, and plan for the people who matter most." },
  { icon: "heart", title: "Our mission", text: "Make final expense planning feel more human, with clear explanations and guidance that starts with listening." },
  { icon: "shield", title: "Our promise", text: "Your needs. Your budget. Your pace. Explore the possibilities with no pressure and no obligation to enroll." },
];

export function FamilyMission() {
  return (
    <section className="family-mission-section" id="our-mission" aria-labelledby="mission-title">
      <div className="container family-mission-grid">
        <Reveal className="family-mission-copy">
          <Eyebrow>Our focus is your family</Eyebrow>
          <h2 id="mission-title">Your family.<br /><em>Our purpose.</em></h2>
          <div className="mission-flourish" aria-hidden="true"><span /><i /><i /><i /><span /></div>
          <p className="mission-intro">Behind every plan is a family worth caring for. That’s what brings us to every conversation.</p>
          <div className="mission-principles">
            {principles.map(principle => (
              <div className="mission-principle" key={principle.title}>
                {principle.icon && <span className="mission-icon"><Icon name={principle.icon} size={26} /></span>}
                <div><h3>{principle.title}</h3><p>{principle.text}</p></div>
              </div>
            ))}
          </div>
          <Link className="text-link" href="/quote">Take your first step <Icon name="arrow" size={19} /></Link>
        </Reveal>
        <Reveal className="family-mission-showcase" delay={100}>
          <figure className="mission-gallery">
            <div className="mission-diamonds">
              <div className="mission-diamond diamond-top"><div className="diamond-image"><Image src="/images/family-sky-hd.png" alt="A mother and father laughing with their daughter and son" fill quality={90} sizes="(max-width: 600px) 40vw, 330px" /></div></div>
              <div className="mission-diamond diamond-main"><div className="diamond-image"><Image src="/images/family-generations-hd.png" alt="A grandfather, father, and son sharing a joyful moment together" fill quality={90} sizes="(max-width: 600px) 75vw, 560px" /></div></div>
              <div className="mission-diamond diamond-bottom"><div className="diamond-image"><Image src="/images/family-together.jpg" alt="Parents gathered with their four children in a green meadow" fill quality={90} sizes="(max-width: 600px) 40vw, 330px" /></div></div>
              <span className="diamond-outline outline-top" aria-hidden="true" />
              <span className="diamond-outline outline-bottom" aria-hidden="true" />
            </div>
            <figcaption><span /><Icon name="heart" size={17} /> Different generations. One shared reason.<span /></figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
