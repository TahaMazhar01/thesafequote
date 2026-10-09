import type { Metadata } from "next";
import "@fontsource/manrope/400.css";
import "@fontsource/manrope/500.css";
import "@fontsource/manrope/600.css";
import "@fontsource/manrope/700.css";
import "@fontsource/manrope/800.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/600.css";
import "@fontsource/space-grotesk/700.css";
import "@fontsource/dm-serif-display/400.css";
import "@fontsource/dm-serif-display/400-italic.css";
import "./globals.css";
import "./editorial.css";
import "./mission.css";
import "./carriers.css";
import "./quote.css";
import "./details.css";
import "./motion.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://thesafequote.com"),
  title: { default: "TheSafeQuote | A thoughtful plan for the people you love", template: "%s | TheSafeQuote" },
  description: "Explore final expense insurance with clear guidance and no-obligation quotes. A little planning for your family. A lot of peace of mind.",
  openGraph: { type: "website", locale: "en_US", siteName: "TheSafeQuote", images: [{ url: "/images/family-together.jpg", width: 1800, height: 1200, alt: "Family together in a meadow" }] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" data-scroll-behavior="smooth"><body><a className="skip-link" href="#main-content">Skip to main content</a><Header /><main id="main-content">{children}</main><Footer /></body></html>;
}
