// Public address of this storefront, used for canonical links, sitemap/robots and structured data.
// Set NEXT_PUBLIC_SITE_URL in production (and the API's STOREFRONT_URL to the same value).
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3002").replace(/\/$/, "");
export const SITE_NAME = "Buildivo";
export const absoluteUrl = (path: string) => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
