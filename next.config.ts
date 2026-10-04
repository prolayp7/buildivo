import type { NextConfig } from "next";

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "form-action 'self'",
  `img-src 'self' data: blob: https:${process.env.NODE_ENV === "production" ? "" : " http://localhost:* http://127.0.0.1:*"}`,
  "font-src 'self' https://fonts.gstatic.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "production" ? "" : " 'unsafe-eval'"}`,
  `connect-src 'self' https:${process.env.NODE_ENV === "production" ? "" : " http://localhost:* http://127.0.0.1:*"}`,
  "frame-src https://www.youtube-nocookie.com https://js.stripe.com https://www.paypal.com",
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  allowedDevOrigins: ["200.97.171.85"],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(self)" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com", pathname: "/aida-public/**" },
      { protocol: "https", hostname: "images.pexels.com", pathname: "/photos/**" },
    ],
  },
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
