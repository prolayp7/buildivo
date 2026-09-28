import { JsonLd } from "@/components/seo/json-ld";
import { absoluteUrl } from "@/lib/site";

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const breadcrumbs = items.filter((item) => item.name.trim() && item.url.startsWith("/"));
  if (breadcrumbs.length < 2) return null;

  return <JsonLd data={{
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.url),
    })),
  }} />;
}