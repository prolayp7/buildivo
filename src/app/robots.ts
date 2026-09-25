import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Keep crawlers out of private, per-visitor and thin pages; everything else is open.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/cart", "/checkout", "/account", "/login", "/register", "/order-confirmation/", "/track-order", "/search", "/wishlist", "/compare"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
