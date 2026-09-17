"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ListingGuideBanner } from "@/components/commerce/listing-guide-banner";
import { ProductCard } from "@/components/commerce/product-card";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCategoryFacets, useCategoryProducts } from "@/lib/use-category-products";
import type { ProductListMeta } from "@/lib/adapters";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";

type SortKey = "newest" | "price_asc" | "price_desc" | "name_asc" | "name_desc";

interface ProductListingProps {
  initialProducts: { items: Product[]; meta: ProductListMeta };
  categorySlug: string;
  categoryName: string;
}

const DEFAULT_PER_PAGE = 12;
const DEFAULT_SORT: SortKey = "newest";

export function ProductListing({ initialProducts, categorySlug, categoryName }: ProductListingProps) {
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [specs, setSpecs] = useState<Record<string, string[]>>({});
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [inStock, setInStock] = useState(false);
  const [sort, setSort] = useState<SortKey>(DEFAULT_SORT);
  const [perPage, setPerPage] = useState<12 | 24 | 48>(DEFAULT_PER_PAGE);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    params.set("category", categorySlug);
    if (selectedBrands.length) params.set("brand", selectedBrands.join(","));
    if (Object.keys(specs).length) params.set("specs", JSON.stringify(specs));
    if (priceMin) params.set("priceMin", priceMin);
    if (priceMax) params.set("priceMax", priceMax);
    if (inStock) params.set("inStock", "true");
    params.set("sort", sort);
    params.set("perPage", String(perPage));
    return params.toString();
  }, [categorySlug, selectedBrands, specs, priceMin, priceMax, inStock, sort, perPage]);

  // initialProducts was server-fetched with the same defaults this component
  // starts with (category, page 1, perPage 12, sort newest, no filters) - it's
  // only valid as the hook's seed while the query still matches that.
  const isDefaultQuery = selectedBrands.length === 0 && Object.keys(specs).length === 0 && !priceMin && !priceMax && !inStock && sort === DEFAULT_SORT && perPage === DEFAULT_PER_PAGE;
  const results = useCategoryProducts(query, isDefaultQuery ? initialProducts : null);

  const sentinel = useRef<HTMLDivElement>(null);
  const { loadMore, hasMore } = results;
  const loadMoreRef = useRef(loadMore);
  useEffect(() => { loadMoreRef.current = loadMore; }, [loadMore]);
  useEffect(() => {
    const target = sentinel.current;
    if (!target || !hasMore) return;
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) loadMoreRef.current(); }, { rootMargin: "1000px" });
    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore]);

  const shown = results.data?.items ?? [];
  const total = results.data?.meta.total ?? 0;
  const facets = useCategoryFacets(categorySlug, initialProducts.meta.facets);
  const maxPrice = Math.ceil(facets.priceMax ?? 0);
  const filtered = selectedBrands.length > 0 || Object.keys(specs).length > 0 || priceMin !== "" || priceMax !== "" || inStock;

  function reset() {
    setSelectedBrands([]);
    setSpecs({});
    setPriceMin("");
    setPriceMax("");
    setInStock(false);
  }

  const activeFilters = [
    ...selectedBrands.map((slug) => ({
      key: `brand:${slug}`, label: `Brand: ${facets.brands.find((brand) => brand.slug === slug)?.title ?? slug}`,
      clear: () => setSelectedBrands((current) => current.filter((value) => value !== slug)),
    })),
    ...Object.entries(specs).flatMap(([title, values]) => values.map((value) => ({
      key: `spec:${title}:${value}`, label: `${title}: ${value}`,
      clear: () => setSpecs((current) => {
        const next = { ...current };
        const remaining = (next[title] ?? []).filter((item) => item !== value);
        if (remaining.length) next[title] = remaining;
        else delete next[title];
        return next;
      }),
    }))),
    ...(priceMin !== "" || priceMax !== "" ? [{
      key: "price",
      label: priceMin !== "" && priceMax !== "" ? `£${priceMin}–£${priceMax}` : priceMin !== "" ? `From £${priceMin}` : `Up to £${priceMax}`,
      clear: () => { setPriceMin(""); setPriceMax(""); },
    }] : []),
    ...(inStock ? [{ key: "stock", label: "In Stock Only", clear: () => setInStock(false) }] : []),
  ];

  const filterPanel = (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-orange-500/30 bg-orange-50 p-4">
        <p className="text-label-md font-label-md font-bold uppercase tracking-wide text-orange-700">Trade Account</p>
        <p className="text-body-md font-body-md font-bold text-graphite-900">15% Trade Discount</p>
        <p className="text-label-sm font-label-sm text-text-secondary">Trade credit tier unlocks net pricing and jobsite pallet deliveries.</p>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-label-lg font-label-lg font-bold text-graphite-900">Refine Results</p>
        <button type="button" onClick={reset} className="text-label-sm font-label-sm text-orange-600 hover:underline">
          Reset
        </button>
      </div>

      <fieldset>
        <legend className="mb-2 text-label-md font-label-md font-bold text-graphite-900">Manufacturer</legend>
        <div className="flex flex-col gap-2">
          {facets.brands.map((brand) => (
            <label key={brand.slug} className="flex items-center gap-2 text-body-sm font-body-sm text-text-primary">
              <Checkbox
                checked={selectedBrands.includes(brand.slug)}
                onCheckedChange={(checked) =>
                  setSelectedBrands((s) => (checked ? [...s, brand.slug] : s.filter((b) => b !== brand.slug)))
                }
              />
              {brand.title}
              <span className="ml-auto text-label-sm font-label-sm text-text-disabled">{brand.count}</span>
            </label>
          ))}
          {!facets.brands.length && <p className="text-label-sm font-label-sm text-text-disabled">No manufacturers</p>}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-label-md font-label-md font-bold text-graphite-900">Price Range (£)</legend>
        <div className="flex items-center gap-2">
          <input
            type="number" min={0} placeholder="Min" value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            className="h-9 w-full rounded-md border border-border-default bg-surface-white px-2 text-body-sm font-body-sm text-text-primary"
          />
          <span className="text-text-disabled">–</span>
          <input
            type="number" min={0} placeholder="Max" value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            className="h-9 w-full rounded-md border border-border-default bg-surface-white px-2 text-body-sm font-body-sm text-text-primary"
          />
        </div>
        {maxPrice > 0 && (
          <>
            <Slider min={0} max={maxPrice} step={1} value={[Number(priceMax) || maxPrice]} onValueChange={([v]) => setPriceMax(String(v))} className="mt-3" />
            <p className="mt-2 text-label-sm font-label-sm text-text-secondary">Up to £{priceMax || maxPrice}</p>
          </>
        )}
      </fieldset>

      {facets.specifications.map((spec) => (
        <fieldset key={spec.title}>
          <legend className="mb-2 text-label-md font-label-md font-bold text-graphite-900">{spec.title}</legend>
          <div className="flex flex-col gap-2">
            {spec.values.map(({ value, count }) => (
              <label key={value} className="flex items-center gap-2 text-body-sm font-body-sm text-text-primary">
                <Checkbox
                  checked={specs[spec.title]?.includes(value) ?? false}
                  onCheckedChange={(checked) => setSpecs((current) => {
                    const next = { ...current };
                    const selected = next[spec.title] ?? [];
                    const values = checked ? [...selected, value] : selected.filter((v) => v !== value);
                    if (values.length) next[spec.title] = values;
                    else delete next[spec.title];
                    return next;
                  })}
                />
                {value}
                <span className="ml-auto text-label-sm font-label-sm text-text-disabled">{count}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ))}

      <fieldset>
        <legend className="mb-2 text-label-md font-label-md font-bold text-graphite-900">Availability</legend>
        <label className="flex items-center gap-2 text-body-sm font-body-sm text-text-primary">
          <Checkbox checked={inStock} onCheckedChange={(checked) => setInStock(Boolean(checked))} />
          In Stock Only
        </label>
      </fieldset>
    </div>
  );

  if (!results.loading && !results.data && results.error) {
    return (
      <div className="mx-auto max-w-[1600px] px-4 py-16 sm:px-margin-desktop">
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border-default py-16 text-center">
          <span aria-hidden className="material-symbols-outlined text-[40px] text-graphite-200">error</span>
          <p className="text-body-md font-body-md font-semibold text-text-primary">Products could not be loaded.</p>
          <Button variant="outline" onClick={results.retry}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-margin-desktop">
      <p aria-live="polite" className="sr-only">{total} products found</p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="hidden h-fit rounded-xl border border-border-default bg-surface-white p-5 lg:sticky lg:top-[164px] lg:block lg:max-h-[calc(100vh-180px)] lg:overflow-y-auto">{filterPanel}</aside>

        <div className="min-w-0">
          <div className="sticky top-[76px] z-10 mb-4 rounded-xl border border-border-default bg-surface-white px-3 shadow-[0_1px_2px_rgb(0_0_0/0.04)] sm:top-[120px] lg:top-[164px]">
            <div className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="flex flex-1 flex-wrap items-center gap-3">
                <p className="whitespace-nowrap text-[11px] leading-4 font-semibold text-graphite-900">
                  {!results.data && results.loading ? "Loading products…" : (
                    <>Showing <span className="font-bold text-orange-600">{shown.length ? 1 : 0}-{shown.length}</span> of{" "}
                      <span className="font-bold text-text-primary">{total}</span> Products</>
                  )}
                </p>
              </div>

              <div className="flex min-w-0 max-w-full flex-wrap items-center gap-3">
                <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setFilterSheetOpen(true)}>
                  <span aria-hidden className="material-symbols-outlined text-[16px]">tune</span>
                  Filters
                </Button>
                <label className="flex items-center gap-1.5 whitespace-nowrap text-[10px] text-text-secondary">
                  Sort:
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortKey)}
                    className="h-8 max-w-[185px] rounded-md border border-border-default bg-surface-container-low px-2 text-[10px] font-semibold text-graphite-900"
                  >
                    <option value="newest">Newest Arrivals</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="name_asc">Name: A-Z</option>
                    <option value="name_desc">Name: Z-A</option>
                  </select>
                </label>

                <div className="flex shrink-0 items-center gap-2">
                  <span className="whitespace-nowrap text-[10px] text-text-secondary">Show:</span>
                  <div className="flex items-center gap-1">
                    {([12, 24, 48] as const).map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setPerPage(size)}
                        aria-pressed={perPage === size}
                        aria-label={`Show ${size} products`}
                        className={cn(
                          "flex h-7 w-7 shrink-0 items-center justify-center rounded text-[11px] leading-4 font-semibold",
                          perPage === size ? "bg-orange-100 text-orange-700" : "text-text-secondary hover:bg-surface-container-low",
                        )}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex shrink-0 items-center rounded-md border border-border-default bg-surface-container-low p-0.5">
                  <button
                    type="button"
                    aria-pressed={view === "grid"}
                    aria-label="Grid view"
                    onClick={() => setView("grid")}
                    className={cn("flex h-7 w-7 items-center justify-center rounded", view === "grid" ? "bg-white text-orange-600" : "text-text-secondary")}
                  >
                    <span aria-hidden className="material-symbols-outlined text-[18px]">grid_view</span>
                  </button>
                  <button
                    type="button"
                    aria-pressed={view === "list"}
                    aria-label="List view"
                    onClick={() => setView("list")}
                    className={cn("flex h-7 w-7 items-center justify-center rounded", view === "list" ? "bg-white text-orange-600" : "text-text-secondary")}
                  >
                    <span aria-hidden className="material-symbols-outlined text-[18px]">view_list</span>
                  </button>
                </div>
              </div>
            </div>

            {activeFilters.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 border-t border-border-default py-2.5">
                <span className="text-label-sm font-label-sm font-semibold uppercase tracking-wide text-text-secondary">Active:</span>
                {activeFilters.map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={f.clear}
                    className="flex min-h-7 max-w-full items-center gap-1 rounded border border-orange-500/40 bg-orange-50 px-2 py-1 text-[10px] leading-4 text-orange-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                  >
                    <span className="text-left">{f.label}</span>
                    <span aria-hidden className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                ))}
                <button type="button" onClick={reset} className="ml-auto whitespace-nowrap text-label-sm font-label-sm font-semibold text-orange-600 hover:underline">
                  Clear All ({activeFilters.length})
                </button>
              </div>
            )}
          </div>

          {!results.loading && results.data && !shown.length ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border-default py-16 text-center">
              <span aria-hidden className="material-symbols-outlined text-[40px] text-graphite-200">
                {filtered ? "search_off" : "inventory_2"}
              </span>
              <p className="text-body-md font-body-md font-semibold text-text-primary">
                {filtered ? "No products match these filters." : `No products listed in ${categoryName} yet.`}
              </p>
              {filtered ? (
                <Button variant="outline" onClick={reset}>Clear all filters</Button>
              ) : (
                <Button asChild variant="outline"><Link href="/">Browse Departments</Link></Button>
              )}
            </div>
          ) : (
            <>
              <div className={cn("grid gap-4", view === "grid" ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-1")}>
                {shown.map((product, index) => (
                  <Fragment key={product.id}>
                    <ProductCard product={product} layout={view} featured={view === "grid"} />
                    {index === (view === "grid" ? 3 : 2) && index < shown.length - 1 && (
                      <ListingGuideBanner />
                    )}
                  </Fragment>
                ))}
                {results.loading && Array.from({ length: perPage }, (_, i) => (
                  <div key={`skeleton-${i}`} aria-hidden className="animate-pulse rounded-xl border border-border-default bg-surface-white p-3">
                    <div className="aspect-square rounded-lg bg-surface-container-low" />
                    <div className="mt-3 h-4 w-3/4 rounded bg-surface-container-low" />
                    <div className="mt-2 h-4 w-1/2 rounded bg-surface-container-low" />
                  </div>
                ))}
              </div>
              {results.error && (
                <div className="mt-6 flex flex-col items-center gap-3 rounded-xl border border-dashed border-danger-500/40 py-8 text-center">
                  <p className="text-body-sm font-body-sm text-text-primary">More products could not be loaded.</p>
                  <Button variant="outline" onClick={results.retry}>Retry</Button>
                </div>
              )}
              <div ref={sentinel} className="mt-6 flex justify-center">
                {results.hasMore && !results.error && (
                  <Button variant="outline" disabled={results.loading} onClick={results.loadMore}>
                    {results.loading ? "Loading more products…" : "Load more products"}
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>Refine Results</SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-6">{filterPanel}</div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
