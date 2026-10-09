import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_BUILD_DIR || ".next",
  async headers() {
    const policy = "default-src 'self'; script-src 'self' 'unsafe-inline'" + (process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : "") + "; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self'" + (process.env.NODE_ENV === "development" ? " ws: wss:" : "") + "; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'";
    return [{source:"/:path*",headers:[
      {key:"Content-Security-Policy",value:policy},
      {key:"X-Frame-Options",value:"DENY"},
      {key:"X-Content-Type-Options",value:"nosniff"},
      {key:"Referrer-Policy",value:"no-referrer"},
      {key:"Permissions-Policy",value:"camera=(), microphone=(), geolocation=(), payment=()"},
      ...(process.env.BETTER_AUTH_URL?.startsWith("https://") ? [{key:"Strict-Transport-Security",value:"max-age=31536000"}] : [])
    ]}];
  },
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
