import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BundleAddButton } from "@/components/bundles/bundle-add-button";
import { ProductImage } from "@/components/commerce/product-image";
import { QuoteRequestDialog } from "@/components/commerce/quote-request-dialog";
import { fetchBundleBySlug } from "@/lib/api";
import { formatPrice } from "@/lib/format";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const bundle = await fetchBundleBySlug(slug).catch(() => null);
  return bundle ? { title: bundle.title, description: bundle.description || undefined } : { title: "Bundle not found" };
}

export default async function BundleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const bundle = await fetchBundleBySlug(slug).catch(() => null);
  if (!bundle) notFound();

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-10 sm:px-margin-desktop">
      <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1 text-label-sm font-label-sm text-text-secondary">
        <Link href="/" className="hover:underline">Home</Link>
        <span aria-hidden>/</span>
        <Link href="/bundles" className="hover:underline">Project bundles</Link>
        <span aria-hidden>/</span>
        <span aria-current="page" className="text-graphite-900">{bundle.title}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div>
          <h1 className="mb-2 text-headline-lg-mobile font-headline-lg-mobile font-bold text-graphite-900 sm:text-headline-lg sm:font-headline-lg">{bundle.title}</h1>
          <p className="mb-8 max-w-2xl text-body-md font-body-md text-text-secondary">{bundle.description}</p>
          <h2 className="mb-3 text-label-lg font-label-lg font-semibold text-graphite-900">What&apos;s in this bundle</h2>
          <ul className="divide-y divide-border-default overflow-hidden rounded-2xl border border-border-default bg-surface-white">
            {bundle.items.map((item) => (
              <li key={item.productVariantId} className="flex items-center gap-4 p-4">
                <ProductImage src={item.image} categorySlug={item.categorySlug} className="size-16 shrink-0 rounded-lg bg-surface-warm object-contain p-1" />
                <div className="min-w-0 flex-1">
                  <Link href={`/p/${item.productSlug}`} className="line-clamp-2 text-body-md font-semibold text-graphite-900 hover:underline">{item.productName}</Link>
                  {item.variantTitle && item.variantTitle !== item.productName ? <p className="text-label-sm font-label-sm text-text-secondary">{item.variantTitle}</p> : null}
                </div>
                <div className="text-right">
                  <p className="text-body-sm font-semibold text-graphite-900">{formatPrice(item.unitPriceIncVat * item.quantity)}</p>
                  <p className="text-label-sm font-label-sm text-text-secondary">{item.quantity} × {formatPrice(item.unitPriceIncVat)}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <aside className="h-fit space-y-3 rounded-2xl bg-surface-warm p-6 lg:sticky lg:top-40">
          {bundle.savingsPct > 0 && <span className="inline-block rounded-full bg-orange-500 px-2.5 py-1 text-label-sm font-label-sm font-semibold text-text-inverse">Save {formatPrice(bundle.savingsIncVat)} ({bundle.savingsPct}%)</span>}
          <div className="flex items-baseline gap-2">
            <span className="text-[32px] leading-none font-bold text-graphite-900">{formatPrice(bundle.bundlePriceIncVat)}</span>
            <span className="text-body-md text-text-secondary line-through">{formatPrice(bundle.regularTotalIncVat)}</span>
          </div>
          <p className="text-label-sm font-label-sm text-text-secondary">Bundle price inc. VAT · {bundle.items.length} products · free next-day delivery over £75</p>
          <BundleAddButton slug={bundle.slug} title={bundle.title} className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-orange-500 text-label-lg font-label-lg font-semibold text-text-inverse transition-colors hover:bg-orange-600 disabled:opacity-60">Add bundle to cart</BundleAddButton>
          <QuoteRequestDialog
            lines={bundle.items.map((item) => ({ variantId: item.productVariantId, label: item.productName, quantity: item.quantity }))}
            className="flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-graphite-900/20 bg-surface-white px-3 text-label-md font-label-md font-semibold text-graphite-900 transition-colors hover:border-orange-500 hover:text-orange-600"
          >
            <span aria-hidden className="material-symbols-outlined text-[18px]">request_quote</span>
            Need more than one kit? Request a quote
          </QuoteRequestDialog>
        </aside>
      </div>
    </div>
  );
}
