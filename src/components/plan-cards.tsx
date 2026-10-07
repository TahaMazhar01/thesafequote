"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { plans } from "@/lib/content";
import { Icon } from "./icon";

const photos = [
  { src: "/images/family-generations-hd.png", alt: "Three generations of a family laughing together", caption: "Care that carries on.", position: "50% 32%" },
  { src: "/images/family-sky-hd.png", alt: "Parents and their children enjoying a sunny day", caption: "More room for life.", position: "55% 35%" },
  { src: "/images/family-together.jpg", alt: "A family spending time together in a meadow", caption: "Love, in every chapter.", position: "50% 100%" },
];

function PhotoPlan({ index }: { index: number }) {
  const plan = plans[index];
  const photo = photos[index];
  const id = useId();
  const [open, setOpen] = useState(false);
  const card = useRef<HTMLElement>(null);
  const photoButton = useRef<HTMLButtonElement>(null);
  const backButton = useRef<HTMLButtonElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasInteracted = useRef(false);
  const hasRevealed = useRef(false);
  const returnFocusToPhoto = useRef(false);

  function clearTimer() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }

  function takeControl() {
    hasInteracted.current = true;
    clearTimer();
  }

  function toggle(show: boolean) {
    takeControl();
    returnFocusToPhoto.current = !show;
    setOpen(show);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      (show ? backButton.current : photoButton.current)?.focus({ preventScroll: true });
    }));
  }

  useEffect(() => {
    const element = card.current;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      clearTimer();
      if (entry.isIntersecting && !motion.matches && !hasInteracted.current && !hasRevealed.current) {
        timer.current = setTimeout(() => {
          // Opening is one-shot, so the content stays still while it is read.
          hasRevealed.current = true;
          setOpen(true);
        }, 2000);
      }
    }, { threshold: 0.65 });
    const cancelWhenHidden = () => { if (document.hidden) clearTimer(); };
    const cancelForMotion = () => { if (motion.matches) clearTimer(); };
    observer.observe(element);
    document.addEventListener("visibilitychange", cancelWhenHidden);
    motion.addEventListener("change", cancelForMotion);
    return () => {
      clearTimer();
      observer.disconnect();
      document.removeEventListener("visibilitychange", cancelWhenHidden);
      motion.removeEventListener("change", cancelForMotion);
    };
  }, []);

  return (
    <article ref={card} className={`photo-plan ${open ? "is-open" : ""} ${index % 2 ? "slide-right" : "slide-left"}`} aria-label={plan.name} onFocusCapture={takeControl} onPointerDown={takeControl}>
      <div className="photo-plan-details" id={`${id}-details`} inert={!open} aria-hidden={!open}>
        <div className="photo-plan-detail-top"><span className="detail-icon"><Icon name={plan.icon} size={25} /></span><button ref={backButton} type="button" onClick={() => toggle(false)} aria-label={`Show ${plan.name} photo`}>View photo <Icon name="close" size={15} /></button></div>
        <span className="photo-plan-eyebrow">{plan.tag}</span>
        <h3>{plan.name}</h3>
        <p>{plan.description}</p>
        <ul>{plan.features.map(feature => <li key={feature}><Icon name="check" size={17} /><span>{feature}</span></li>)}</ul>
        <p className="photo-plan-note">{plan.note}</p>
        <Link className="photo-plan-link" href="/quote?coverage=Final%20Expense">Explore my options <span><Icon name="arrow" size={19} /></span></Link>
      </div>
      <button ref={photoButton} type="button" className="photo-plan-cover" onClick={() => toggle(true)} onTransitionEnd={event => {
        if (event.target === event.currentTarget && event.propertyName === "transform" && !open && returnFocusToPhoto.current) {
          photoButton.current?.focus({ preventScroll: true });
          returnFocusToPhoto.current = false;
        }
      }} aria-label={`Show ${plan.name} details`} aria-expanded={open} aria-controls={`${id}-details`} aria-hidden={open} tabIndex={open ? -1 : 0} inert={open}>
        <Image src={photo.src} alt={photo.alt} fill quality={90} sizes="(max-width: 760px) calc(100vw - 40px), (max-width: 1440px) 33vw, 440px" style={{ objectPosition: photo.position }} />
        <Image className="photo-plan-soft-focus" src={photo.src} alt="" aria-hidden="true" fill quality={90} sizes="(max-width: 760px) calc(100vw - 40px), (max-width: 1440px) 33vw, 440px" style={{ objectPosition: photo.position }} />
        <span className="photo-plan-badge"><Icon name={plan.icon} size={16} /> {index === 0 ? "From day one" : index === 1 ? "More possibilities" : "Another way forward"}</span>
        <span className="photo-plan-glass">
          <span className="photo-plan-number">0{index + 1} / PROTECTION, MADE PERSONAL</span>
          <span className="photo-plan-title">{plan.name}</span>
          <span className="photo-plan-caption">{photo.caption}</span>
          <span className="photo-plan-bottom"><span>Discover this plan</span><span className="photo-plan-arrow"><Icon name="arrow" size={21} /></span></span>
        </span>
      </button>
    </article>
  );
}

export function PlanCards() {
  return <div className="photo-plans">
    <div className="photo-plan-grid">{plans.map((plan, index) => <PhotoPlan key={plan.id} index={index} />)}</div>
  </div>;
}
