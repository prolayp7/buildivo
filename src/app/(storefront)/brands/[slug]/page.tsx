import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductCard } from "@/components/commerce/product-card";
import { fetchBrandBySlug, fetchProducts } from "@/lib/api";
import { formatPrice } from "@/lib/format";

interface BrandPageProps {
  params: Promise<{ slug: string }>;
}

function stripHtml(html: string | null): string {
  return html ? html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() : "";
}

export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
  const { slug } = await params;
  const brand = await fetchBrandBySlug(slug);
  if (!brand) return { title: "Brand" };
  return {
    title: brand.metaTitle || brand.title,
    description: brand.metaDescription || stripHtml(brand.shortDescription) || stripHtml(brand.description) || undefined,
  };
}

export default async function BrandPage({ params }: BrandPageProps) {
  const { slug } = await params;
  const brand = await fetchBrandBySlug(slug);
  if (!brand) notFound();

  const { items: products, meta } = await fetchProducts({ brand: brand.slug, perPage: 48, sort: "newest" });
  const description = stripHtml(brand.shortDescription) || stripHtml(brand.description);

  return (
    <div>
      <div className="border-b border-border-default bg-surface-white">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-2 px-4 py-3 text-label-sm font-label-sm text-text-secondary sm:px-margin-desktop">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1">
            <Link href="/" className="flex items-center hover:underline">
              <span aria-hidden className="material-symbols-outlined text-[16px]">home</span>
              <span className="sr-only">Home</span>
            </Link>
            <span aria-hidden>/</span>
            <Link href="/brands" className="hover:underline">Brands</Link>
            <span aria-hidden>/</span>
            <span className="font-semibold text-text-primary">{brand.title}</span>
          </nav>
        </div>
      </div>

      <div className="border-b border-border-default bg-surface-white">
        <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-margin-desktop">
          <div className="flex flex-wrap items-center gap-4">
            {brand.logo ? (
              <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border-default bg-white">
                <Image src={brand.logo} alt={brand.logoAlt || brand.title} width={64} height={64} unoptimized className="h-full w-full object-contain" />
              </span>
            ) : null}
            <div>
              <h1 className="text-headline-lg-mobile font-headline-lg-mobile font-bold text-graphite-900 sm:text-headline-lg sm:font-headline-lg">{brand.title}</h1>
              <p className="mt-1 text-label-sm font-label-sm text-text-secondary">
                {meta.total.toLocaleString()} products{brand.priceFrom != null ? ` · from ${formatPrice(brand.priceFrom)}` : ""}
              </p>
            </div>
          </div>
          {description ? <p className="mt-4 max-w-3xl text-body-sm font-body-sm text-text-secondary">{description}</p> : null}
        </div>
      </div>

      <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-margin-desktop">
        {products.length ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {products.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border-default py-16 text-center">
            <span aria-hidden className="material-symbols-outlined text-[40px] text-graphite-200">inventory_2</span>
            <p className="text-body-md font-body-md font-semibold text-text-primary">No {brand.title} products listed yet.</p>
            <Link href="/brands" className="text-label-md font-label-md font-semibold text-orange-600 hover:underline">Browse all brands</Link>
          </div>
        )}
      </div>
    </div>
  );
}
