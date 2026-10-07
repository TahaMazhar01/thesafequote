"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { navigation } from "@/lib/content";
import { Icon } from "./icon";

export function Brand({ inverse = false }: { inverse?: boolean }) {
  return <Link href="/" className={`brand ${inverse ? "brand-inverse" : ""}`} aria-label="TheSafeQuote home"><span className="brand-mark"><Icon name="shield" size={27} /></span><span>the<span className="brand-safe">safe</span>quote<span className="brand-dot">.</span></span></Link>;
}

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); menuButton.current?.focus(); } };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);
  return <>
    <div className={`utility-bar ${pathname === "/" || pathname === "/quote" ? "home-utility" : ""}`}><div className="container utility-inner"><span><Icon name="heart" size={13} /> A little planning. A lot of peace of mind.</span><Link href="/contact">Let’s talk about your options <Icon name="arrow" size={14} /></Link></div></div>
    <header className={`site-header ${pathname === "/" ? "editorial-header" : ""} ${scrolled ? "is-scrolled" : ""}`}>
      <div className="container header-inner"><Brand /><nav className="desktop-nav" aria-label="Main navigation">{navigation.map(item => <Link key={item.href} href={item.href} className={pathname === item.href ? "active" : ""} aria-current={pathname === item.href ? "page" : undefined}>{item.label}</Link>)}</nav><Link href="/quote" className="button button-small header-quote" aria-label="Get my free quote"><span className="quote-label-full">Get my free quote</span><span className="quote-label-short" aria-hidden="true">Free quote</span><Icon name="arrow" size={17} /></Link><button className="menu-toggle" ref={menuButton} onClick={() => setOpen(!open)} aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="mobile-navigation"><Icon name={open ? "close" : "menu"} size={26} /></button></div>
      {open && <nav id="mobile-navigation" className="mobile-nav" aria-label="Mobile navigation">{navigation.map(item => <Link onClick={() => setOpen(false)} key={item.href} href={item.href} aria-current={pathname === item.href ? "page" : undefined}>{item.label}<Icon name="arrow" size={18} /></Link>)}<Link href="/legal" onClick={() => setOpen(false)}>Legal information<Icon name="arrow" size={18} /></Link><Link href="/quote" className="button" onClick={() => setOpen(false)}>Get my free quote <Icon name="arrow" size={18} /></Link></nav>}
    </header>
  </>;
}

