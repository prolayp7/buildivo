import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/commerce/product-detail";
import { fetchProductBySlug, fetchRelatedProducts, fetchReviews, toReview } from "@/lib/api";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);
  return { title: product ? product.name : "Product" };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);
  if (!product) notFound();

  const [related, apiReviews] = await Promise.all([fetchRelatedProducts(slug), fetchReviews(product.id)]);

  return <ProductDetail product={product} related={related} productReviews={apiReviews.map(toReview)} />;
}
