"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchBrandsClient, fetchProductSuggestions, type ApiBrandRef } from "@/lib/storefront-client";
import { ProductImage } from "@/components/commerce/product-image";
import { formatPrice } from "@/lib/format";
import type { Category, Product } from "@/types";

export function SearchBox({ departments }: { departments: Category[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [brands, setBrands] = useState<ApiBrandRef[]>([]);

  useEffect(() => {
    fetchBrandsClient().then(setBrands).catch(() => undefined);
  }, []);

  useEffect(() => {
    const query = q.trim();
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      if (query.length < 2) { setProducts([]); return; }
      setLoading(true);
      try {
        const results = await fetchProductSuggestions(query, controller.signal);
        setProducts(results);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) setProducts([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [q]);

  function runSearch(query: string) {
    setOpen(false);
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  const trimmed = q.trim();
  const categoryMatches = trimmed.length >= 2 ? departments.filter((d) => d.name.toLowerCase().includes(trimmed.toLowerCase())).slice(0, 4) : [];
  const brandMatches = trimmed.length >= 2 ? brands.filter((b) => b.title.toLowerCase().includes(trimmed.toLowerCase())).slice(0, 4) : [];
  const showDropdown = open && trimmed.length >= 2;
  const hasMatches = products.length > 0 || categoryMatches.length > 0 || brandMatches.length > 0;

  return (
    <div className="relative hidden max-w-2xl flex-1 md:block">
      <form
        role="search"
        onSubmit={(event) => { event.preventDefault(); runSearch(q); }}
        className="relative flex w-full items-center"
      >
        <span aria-hidden className="material-symbols-outlined pointer-events-none absolute left-3.5 text-[20px] text-graphite-400">
          search
        </span>
        <label htmlFor="site-search" className="sr-only">
          Search products, SKUs and guides
        </label>
        <input
          id="site-search"
          name="q"
          type="search"
          autoComplete="off"
          value={q}
          onChange={(event) => { setQ(event.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          className="h-11 w-full rounded-lg border border-border-default bg-surface-warm pl-10 pr-24 text-body-sm font-body-sm text-text-primary placeholder:text-text-disabled focus:border-orange-500 focus:bg-surface-white focus:outline-none"
          placeholder="Search 45,000+ power tools, fixings, plumbing, SKUs, MPNs..."
        />
        <button type="submit" className="absolute right-1 rounded bg-orange-500 px-3 py-1.5 text-label-sm font-label-sm font-semibold text-text-inverse hover:bg-orange-600">
          Search
        </button>
      </form>

      {showDropdown ? (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-40 overflow-hidden rounded-xl border border-border-default bg-surface-white shadow-lg">
          {loading && !hasMatches ? (
            <p className="p-4 text-body-sm font-body-sm text-text-secondary">Searching…</p>
          ) : hasMatches ? (
            <div className="flex flex-col sm:flex-row">
              {products.length ? (
                <div className="min-w-0 flex-1 border-b border-border-default p-2 sm:border-b-0 sm:border-r">
                  <p className="px-2.5 pb-1.5 pt-1 text-label-sm font-label-sm font-semibold uppercase tracking-wide text-text-disabled">Products</p>
                  {products.map((product) => (
                    <Link
                      key={product.id}
                      href={`/p/${product.slug}`}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-surface-container-low"
                    >
                      <ProductImage src={product.image} categorySlug={product.categorySlug} className="h-10 w-10 shrink-0 overflow-hidden rounded-md object-cover" />

                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-body-sm font-body-sm font-semibold text-text-primary">{product.name}</span>
                        <span className="block text-label-sm font-label-sm text-text-secondary">{product.brand}</span>
                      </span>
                      <span className="shrink-0 text-label-md font-label-md font-bold text-orange-600">{formatPrice(product.priceIncVat)}</span>
                    </Link>
                  ))}
                </div>
              ) : null}
              {categoryMatches.length || brandMatches.length ? (
                <div className="w-full shrink-0 p-2 sm:w-48">
                  {categoryMatches.length ? (
                    <>
                      <p className="px-2.5 pb-1.5 pt-1 text-label-sm font-label-sm font-semibold uppercase tracking-wide text-text-disabled">Categories</p>
                      {categoryMatches.map((category) => (
                        <Link
                          key={category.slug}
                          href={`/c/${category.slug}`}
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => setOpen(false)}
                          className="block truncate rounded-lg px-2.5 py-1.5 text-body-sm font-body-sm text-text-primary transition-colors hover:bg-surface-container-low"
                        >
                          {category.name}
                        </Link>
                      ))}
                    </>
                  ) : null}
                  {brandMatches.length ? (
                    <>
                      <p className="px-2.5 pb-1.5 pt-1 text-label-sm font-label-sm font-semibold uppercase tracking-wide text-text-disabled">Brands</p>
                      {brandMatches.map((brand) => (
                        <Link
                          key={brand.slug}
                          href={`/brands/${brand.slug}`}
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => setOpen(false)}
                          className="block truncate rounded-lg px-2.5 py-1.5 text-body-sm font-body-sm text-text-primary transition-colors hover:bg-surface-container-low"
                        >
                          {brand.title}
                        </Link>
                      ))}
                    </>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : (
            <p className="p-4 text-body-sm font-body-sm text-text-secondary">No matches — press Enter to search the full catalog anyway.</p>
          )}
          {hasMatches ? (
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => runSearch(q)}
              className="flex w-full items-center justify-center gap-1.5 border-t border-border-default bg-surface-warm px-3 py-2.5 text-label-md font-label-md font-semibold text-orange-600 hover:bg-orange-50"
            >
              View all results for &ldquo;{trimmed}&rdquo;
              <span aria-hidden className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
