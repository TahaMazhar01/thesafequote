import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  devIndicators: false,
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 90],
  },
  async redirects() {
    return [
      { source: "/index.php", destination: "/", permanent: true },
      ...Object.entries({ products: "plans", "why-choose-us": "why-choose-us", faq: "faq", legal: "legal", contact: "contact" }).map(([old, current]) => ({
        source: `/pages/${old}.php`, destination: `/${current}`, permanent: true,
      })),
    ];
  },
};
export default nextConfig;
