// The sitemap is built by the API (it knows every published product, category, post and page);
// this route serves it from the storefront's own domain, where crawlers look for it.
const API_BASE = process.env.BUILDIVO_API_URL ?? "http://localhost:3000/api/v1";

export async function GET() {
  try {
    const response = await fetch(`${API_BASE.replace(/\/$/, "")}/sitemap.xml`, { next: { revalidate: 3600 } });
    if (!response.ok) throw new Error(`API responded ${response.status}`);
    return new Response(await response.text(), { headers: { "Content-Type": "application/xml; charset=utf-8" } });
  } catch {
    return new Response("Sitemap temporarily unavailable", { status: 503, headers: { "Retry-After": "300" } });
  }
}
