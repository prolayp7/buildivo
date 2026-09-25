"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/lib/cart-store";
import { fetchProductsByIds } from "@/lib/storefront-client";
import { formatPrice } from "@/lib/format";
import { ProductImage } from "@/components/commerce/product-image";
import type { Product } from "@/types";

export function ComparisonBar() {
  const selected = useCartStore((state) => state.compare);
  const pathname = usePathname();
  const [compared, setCompared] = useState<Product[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchProductsByIds(selected).then((items) => { if (!cancelled) setCompared(items); });
    return () => { cancelled = true; };
  }, [selected]);

  if (!compared.length || pathname === "/compare") return null;
  return <ComparisonTray key={selected.join(",")} compared={compared} />;
}

function ComparisonTray({ compared }: { compared: Product[] }) {
  const [minimized, setMinimized] = useState(false);
  const [closed, setClosed] = useState(false);
  const toggleCompare = useCartStore((state) => state.toggleCompare);
  const count = compared.length;
  const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500";

  if (closed) return null;

  if (minimized) {
    return (
      <button type="button" onClick={() => setMinimized(false)} aria-label={`Expand comparison bar, ${count} products selected`} className={`fixed bottom-[calc(144px+env(safe-area-inset-bottom))] sm:bottom-4 left-4 z-40 flex min-h-12 items-center gap-3 rounded-xl border border-graphite-600 bg-[#080f16] px-4 text-sm font-semibold text-white shadow-lg ${focus}`}>
        <span className="flex size-7 items-center justify-center rounded-full bg-orange-500 text-xs">{count}</span>
        Compare products
        <span aria-hidden className="material-symbols-outlined text-[18px]">expand_less</span>
      </button>
    );
  }

  return (
    <>
      <aside aria-label="Selected products for comparison" className="fixed inset-x-0 bottom-[calc(72px+env(safe-area-inset-bottom))] sm:bottom-0 z-40 border-t border-graphite-700 bg-[#080f16] pb-0 sm:pb-[env(safe-area-inset-bottom)] text-white shadow-[0_-8px_32px_rgb(0_0_0/0.18)]">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-2 px-3 py-2 sm:gap-3 sm:px-4 sm:py-4 xl:flex-nowrap xl:gap-5">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3 xl:max-w-[355px]">
            <span aria-hidden className="flex size-6 sm:size-8 shrink-0 items-center justify-center rounded-full bg-orange-500 text-xs sm:text-sm font-bold">{count}</span>
            <div>
              <p aria-live="polite" className="text-xs sm:text-sm leading-5 font-semibold"><span className="sm:hidden">{count} {count === 1 ? "product" : "products"} selected</span><span className="hidden sm:inline">{count} {count === 1 ? "Product Selected" : "Products Selected"} for Direct Comparison</span></p>
              <p className="mt-1 hidden text-[11px] text-graphite-200 sm:block">Compare specifications, features &amp; prices side by side</p>
            </div>
          </div>
          <div className="order-2 sm:order-5 flex shrink-0 items-center gap-1">
            <button type="button" onClick={() => setMinimized(true)} className={`min-h-9 px-2 text-xs text-graphite-200 hover:text-white ${focus}`}>Minimize</button>
            <button type="button" onClick={() => setClosed(true)} aria-label="Close comparison bar" title="Close comparison bar" className={`flex size-9 items-center justify-center rounded-lg text-graphite-200 hover:bg-white/10 hover:text-white ${focus}`}>
              <span aria-hidden className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
          <div className="order-3 flex w-full gap-2 overflow-x-auto pb-1 xl:order-2 xl:min-w-0 xl:flex-1 xl:pb-0">
            {compared.map((product) => (
              <div key={product.id} className="flex h-12 sm:h-14 w-[156px] min-w-[156px] shrink-0 sm:w-auto sm:min-w-[170px] sm:flex-1 items-center gap-2 rounded-lg border border-graphite-600 bg-[#0d1823] p-2 xl:min-w-0">
                <div className="size-8 sm:size-9 shrink-0 overflow-hidden rounded bg-white">
                  <ProductImage src={product.image} categorySlug={product.categorySlug} className="flex size-full items-center justify-center object-contain [&>span:last-child]:hidden" iconClassName="text-[20px]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p title={product.name} className="truncate text-[11px] font-semibold">{product.name}</p>
                  <p className="mt-1 text-[10px] font-semibold text-orange-500">{formatPrice(product.priceIncVat)}</p>
                </div>
                <button type="button" onClick={() => toggleCompare(product.id)} aria-label={`Remove ${product.name} from comparison`} className={`flex size-7 shrink-0 items-center justify-center rounded text-graphite-200 hover:bg-white/10 hover:text-white ${focus}`}>
                  <span aria-hidden className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>
            ))}
            {Array.from({ length: 4 - count }, (_, index) => (
              <Link key={index} href="/c/power-tools" aria-label={`Browse products to fill comparison slot ${count + index + 1}`} className={`hidden sm:flex h-14 min-w-24 items-center justify-center gap-1 rounded-lg border border-dashed border-graphite-600 px-2 text-[11px] text-graphite-200 hover:border-orange-500 hover:text-white ${focus}`}>
                <span aria-hidden className="material-symbols-outlined text-[16px]">add</span>
                Add Slot {count + index + 1}
              </Link>
            ))}
          </div>
          <div className="order-4 w-full shrink-0 sm:w-auto">
            {count >= 2 ? (
              <Link href="/compare" className={`flex min-h-10 items-center justify-center gap-2 rounded-lg bg-orange-500 px-5 text-xs font-bold text-white hover:bg-orange-600 ${focus}`}>
                <span aria-hidden className="material-symbols-outlined text-[18px]">compare_arrows</span>
                Compare {count} Models
              </Link>
            ) : (
              <button type="button" disabled className="flex min-h-10 w-full items-center justify-center rounded-lg bg-graphite-700 px-5 text-xs font-semibold text-graphite-200">Select one more product</button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
