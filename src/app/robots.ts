import type { MetadataRoute } from "next";
import { siteOrigin, siteIndexable } from "@/lib/site-url";
export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = siteOrigin();
  if (!siteIndexable()) return { rules: { userAgent: "*", disallow: "/" } };

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/api/blog-media/"],
        disallow: ["/admin", "/api/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
