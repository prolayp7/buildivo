import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/commerce/product-detail";
import { JsonLd } from "@/components/seo/json-ld";
import { CURRENCY } from "@/lib/format";
import { SITE_NAME, absoluteUrl } from "@/lib/site";
import { fetchPlatformMatches, fetchProductBySlug, fetchRelatedProducts, fetchReviews, toReview } from "@/lib/api";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);
  if (!product) return { title: "Product" };
  const title = product.seo?.title || product.name;
  const description = product.seo?.description?.replace(/\s+/g, " ").trim().slice(0, 160) || undefined;
  const image = product.image || undefined;
  return {
    title,
    description,
    alternates: { canonical: `/p/${product.slug}` },
    robots: product.seo?.indexable === false ? { index: false, follow: true } : undefined,
    openGraph: { type: "website", title, description, url: `/p/${product.slug}`, images: image ? [{ url: image, alt: product.name }] : undefined },
    twitter: { card: image ? "summary_large_image" : "summary", title, description, images: image ? [image] : undefined },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);
  if (!product) notFound();

  const [related, apiReviews, platformMatches] = await Promise.all([
    fetchRelatedProducts(slug),
    fetchReviews(product.id),
    product.toolPlatform ? fetchPlatformMatches(slug) : Promise.resolve([]),
  ]);

  const availability = product.stock === "out-of-stock" ? "OutOfStock" : product.stock === "low-stock" ? "LimitedAvailability" : "InStock";
  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org", "@type": "Product",
        name: product.name,
        description: product.seo?.description || undefined,
        image: product.images.filter(Boolean),
        sku: product.sku || undefined, mpn: product.mpn, gtin: product.gtin,
        brand: product.brand !== "Unbranded" ? { "@type": "Brand", name: product.brand } : undefined,
        offers: { "@type": "Offer", url: absoluteUrl(`/p/${product.slug}`), priceCurrency: CURRENCY, price: product.priceIncVat.toFixed(2), availability: `https://schema.org/${availability}`, itemCondition: "https://schema.org/NewCondition", seller: { "@type": "Organization", name: SITE_NAME } },
        aggregateRating: product.reviewCount > 0 ? { "@type": "AggregateRating", ratingValue: product.rating, reviewCount: product.reviewCount } : undefined,
      }} />
      <ProductDetail product={product} related={related} productReviews={apiReviews.map(toReview)} platformMatches={platformMatches} />
    </>
  );
}
