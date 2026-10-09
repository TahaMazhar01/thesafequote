"use client";
import { useEffect, useRef, type ReactNode } from "react";

export function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!element || motion.matches || !("IntersectionObserver" in window)) return;
    if (element.getBoundingClientRect().top < window.innerHeight) return;
    element.classList.add("reveal-pending");
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { element.classList.remove("reveal-pending"); observer.disconnect(); }
    }), { threshold: 0.08 });
    observer.observe(element);
    const show = () => { element.classList.remove("reveal-pending"); observer.disconnect(); };
    const onMotionChange = () => { if (motion.matches) show(); };
    element.addEventListener("focusin", show);
    motion.addEventListener("change", onMotionChange);
    return () => {
      observer.disconnect();
      element.classList.remove("reveal-pending");
      element.removeEventListener("focusin", show);
      motion.removeEventListener("change", onMotionChange);
    };
  }, []);
  return <div className={`reveal ${className}`} ref={ref} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
}
