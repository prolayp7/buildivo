import type { Metadata } from "next";
import { ClearanceProtection } from "@/components/deals/clearance-protection";
import { BulkPallets } from "@/components/deals/bulk-pallets";
import { DealsListing } from "@/components/deals/deals-listing";
import { DealsHero } from "@/components/deals/deals-hero";
import { fetchProducts } from "@/lib/api";

export const metadata: Metadata = { title: "Deals & Clearance" };

export default async function DealsPage() {
  const { items, meta } = await fetchProducts({ onSale: true, sort: "discount_desc", perPage: 100 });
  const remainingPages = await Promise.all(Array.from({ length: Math.max(0, meta.totalPages - 1) }, (_, index) => fetchProducts({ onSale: true, sort: "discount_desc", perPage: 100, page: index + 2 })));
  const allDeals = [...items, ...remainingPages.flatMap((page) => page.items)];
  const bulkProducts = allDeals.filter((product) => product.stock !== "out-of-stock" && product.defaultVariantId && (product.quantityTiers?.length || /pallet|bulk|pack|drum|bundle/i.test(product.name))).slice(0, 3);
  const spotlight = items[0];
  const maxDiscountPct = spotlight?.compareAtIncVat
    ? Math.round((1 - spotlight.priceIncVat / spotlight.compareAtIncVat) * 100)
    : 0;

  return (
    <div>
      <DealsHero spotlight={spotlight ?? null} dealsCount={meta.total} maxDiscountPct={maxDiscountPct} />

      <DealsListing products={allDeals} />
      <BulkPallets products={bulkProducts} />
      <ClearanceProtection />
    </div>
  );
}
