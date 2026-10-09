"use client";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
export function SiteChrome({ children, header, footer }: { children: ReactNode; header: ReactNode; footer: ReactNode }) {
  const admin = usePathname().startsWith("/admin");
  return <>{!admin && header}<main id="main-content">{children}</main>{!admin && footer}</>;
}
