import Link from "next/link";
import { ProductImage } from "@/components/commerce/product-image";
import { BundleAddButton } from "@/components/bundles/bundle-add-button";
import { formatPrice } from "@/lib/format";
import type { Bundle } from "@/lib/api";

export function BundleCard({ bundle }: { bundle: Bundle }) {
  const preview = bundle.items.slice(0, 4);
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl bg-surface-warm">
      <Link href={`/bundles/${bundle.slug}`} aria-label={`View ${bundle.title}`} className="relative block">
        <div className="grid aspect-[3/2] grid-cols-2 grid-rows-2 gap-px bg-border-default">
          {preview.map((item) => (
            <ProductImage key={item.productVariantId} src={item.image} categorySlug={item.categorySlug} className="h-full w-full bg-surface-white object-contain p-2" />
          ))}
        </div>
        {bundle.savingsPct > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-orange-500 px-2.5 py-1 text-label-sm font-label-sm font-semibold text-text-inverse">Save {bundle.savingsPct}%</span>
        )}
        <span className="absolute right-3 top-3 rounded-full bg-graphite-900/90 px-2.5 py-1 text-label-sm font-label-sm font-semibold text-text-inverse">{bundle.items.length} products</span>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <h2 className="mb-1 text-[20px] leading-7 font-semibold text-graphite-900">
          <Link href={`/bundles/${bundle.slug}`} className="hover:underline">{bundle.title}</Link>
        </h2>
        <p className="mb-4 line-clamp-2 text-body-sm font-body-sm text-text-secondary">{bundle.description}</p>
        <div className="mb-5 mt-auto flex items-baseline gap-2">
          <span className="text-[24px] font-bold text-graphite-900">{formatPrice(bundle.bundlePriceIncVat)}</span>
          <span className="text-body-sm text-text-secondary line-through">{formatPrice(bundle.regularTotalIncVat)}</span>
          <span className="text-label-sm font-label-sm text-text-secondary">inc. VAT</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Link href={`/bundles/${bundle.slug}`} className="flex min-h-10 items-center justify-center rounded-xl bg-surface-white px-3 text-label-md font-label-md font-semibold text-text-primary transition-colors hover:bg-graphite-900 hover:text-text-inverse">View kit</Link>
          <BundleAddButton slug={bundle.slug} title={bundle.title} className="flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-orange-500 px-3 text-label-md font-label-md font-semibold text-text-inverse transition-colors hover:bg-orange-600 disabled:opacity-60">Add to cart</BundleAddButton>
        </div>
      </div>
    </article>
  );
}
