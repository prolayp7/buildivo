import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
