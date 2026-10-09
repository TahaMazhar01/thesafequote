import { siteOrigin } from "@/lib/site-url";
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
import "./blog.css";
import "./readability.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { SiteChrome } from "@/components/site-chrome";

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin()),
  title: { default: "TheSafeQuote | A thoughtful plan for the people you love", template: "%s | TheSafeQuote" },
  description: "Explore final expense insurance with clear guidance and no-obligation quotes. A little planning for your family. A lot of peace of mind.",
  verification: {
    google: "a_HSF_7gzrbrG8KR4AFHHymJSo4CzzFY8OYa690LMWs",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon.png", type: "image/png", sizes: "64x64" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: { type: "website", locale: "en_US", siteName: "TheSafeQuote", images: [{ url: "/images/family-together.jpg", width: 1800, height: 1200, alt: "Family together in a meadow" }] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" data-scroll-behavior="smooth"><body><a className="skip-link" href="#main-content">Skip to main content</a><SiteChrome header={<Header />} footer={<Footer />}>{children}</SiteChrome></body></html>;
}
