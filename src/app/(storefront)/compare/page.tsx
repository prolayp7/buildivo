"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/commerce/product-image";
import { formatPrice } from "@/lib/format";
import { useCartStore } from "@/lib/cart-store";
import { fetchCompareProducts, type CompareResult } from "@/lib/storefront-client";

export default function ComparePage() {
  const compare = useCartStore((s) => s.compare);
  const toggleCompare = useCartStore((s) => s.toggleCompare);
  const [result, setResult] = useState<CompareResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      if (compare.length < 2) {
        setResult(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      fetchCompareProducts(compare)
        .then((r) => { if (!cancelled) setResult(r); })
        .catch(() => { if (!cancelled) setResult(null); })
        .finally(() => { if (!cancelled) setLoading(false); });
    }, 0);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [compare]);

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <LoaderCircle className="h-6 w-6 animate-spin text-graphite-300" />
      </div>
    );
  }

  if (!result || result.products.length === 0) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-24 text-center">
        <span aria-hidden className="material-symbols-outlined text-[56px] text-graphite-200">compare_arrows</span>
        <h1 className="text-headline-md font-headline-md font-bold text-graphite-900">Nothing to compare yet</h1>
        <p className="text-body-md font-body-md text-text-secondary">
          Tick &quot;Compare&quot; on at least 2 products from a category page to see them side by side here.
        </p>
        <Button asChild className="bg-orange-500 hover:bg-orange-600">
          <Link href="/c/power-tools">Browse Power Tools</Link>
        </Button>
      </div>
    );
  }

  const { products, specifications } = result;

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-margin-desktop">
      <h1 className="mb-6 text-headline-lg-mobile font-headline-lg-mobile font-bold text-graphite-900 sm:text-headline-lg sm:font-headline-lg">
        Compare Products ({products.length})
      </h1>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="w-40 text-left text-label-sm font-label-sm text-text-disabled"> </th>
              {products.map((p) => (
                <th key={p.id} className="border-b border-border-default p-3 text-left align-top">
                  <button
                    type="button"
                    onClick={() => toggleCompare(p.id)}
                    className="mb-2 flex items-center gap-1 text-label-sm font-label-sm text-error-500 hover:underline"
                  >
                    <span aria-hidden className="material-symbols-outlined text-[14px]">close</span>
                    Remove
                  </button>
                  <ProductImage src={p.image ?? undefined} categorySlug="" className="mb-2 flex h-28 w-28 items-center justify-center rounded-lg" />
                  <Link href={`/p/${p.slug}`} className="mb-1 block text-body-sm font-body-sm font-bold hover:underline">
                    {p.title}
                  </Link>
                  <p className="text-label-sm font-label-sm text-text-secondary">{p.brand ?? "Unbranded"}</p>
                  <p className="mt-2 text-body-md font-body-md font-bold text-graphite-900">{formatPrice(Number(p.salePrice ?? p.price ?? 0))}</p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {specifications.map((spec) => (
              <tr key={spec.key}>
                <th scope="row" className="border-b border-border-default p-3 text-left text-label-sm font-label-sm font-semibold text-text-secondary">
                  {spec.key}
                </th>
                {spec.values.map((value, index) => (
                  <td key={`${spec.key}-${products[index]?.id ?? index}`} className="border-b border-border-default p-3 text-body-sm font-body-sm">
                    {value ?? "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
