import type { Metadata } from "next";
import { ClearanceProtection } from "@/components/deals/clearance-protection";
import { BulkPallets } from "@/components/deals/bulk-pallets";
import { DealsListing } from "@/components/deals/deals-listing";
import { DealsHero } from "@/components/deals/deals-hero";
import { fetchDealsPageContent, fetchProducts } from "@/lib/api";
import type { Product } from "@/types";

export const metadata: Metadata = { title: "Deals & Clearance" };

const discountPct = (product?: Product) => product?.compareAtIncVat
  ? Math.round((1 - product.priceIncVat / product.compareAtIncVat) * 100)
  : 0;

export default async function DealsPage() {
  const content = await fetchDealsPageContent();
  const { items, meta } = await fetchProducts({ onSale: true, sort: "discount_desc", perPage: 100 });
  const remainingPages = await Promise.all(Array.from({ length: Math.max(0, meta.totalPages - 1) }, (_, index) => fetchProducts({ onSale: true, sort: "discount_desc", perPage: 100, page: index + 2 })));
  const allDeals = [...items, ...remainingPages.flatMap((page) => page.items)];

  const pinnedIds = content.bulk.products.map((product) => product.id);
  const pinned = pinnedIds.length && content.bulk.enabled ? await fetchProducts({ ids: pinnedIds, perPage: pinnedIds.length }).catch(() => null) : null;
  const buyable = (product: Product) => product.stock !== "out-of-stock" && product.defaultVariantId;
  const bulkProducts = pinned
    ? pinnedIds.map((id) => pinned.items.find((product) => product.id === id)).filter((product): product is Product => !!product && !!buyable(product))
    : allDeals.filter((product) => buyable(product) && (product.quantityTiers?.length || /pallet|bulk|pack|drum|bundle/i.test(product.name))).slice(0, 3);

  // A pinned spotlight only counts while the product is actually on sale.
  const spotlight = allDeals.find((product) => product.id === content.spotlight?.id) ?? items[0];

  return (
    <div>
      <DealsHero spotlight={spotlight ?? null} dealsCount={meta.total} maxDiscountPct={discountPct(items[0])} spotlightPct={discountPct(spotlight)} content={content} />

      <DealsListing products={allDeals} />
      {content.bulk.enabled && <BulkPallets products={bulkProducts} content={content.bulk} />}
      {content.clearance.enabled && <ClearanceProtection content={content.clearance} />}
    </div>
  );
}
