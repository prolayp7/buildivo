"use client";

import { Fragment, useMemo, useState } from "react";
import Link from "next/link";
import { ListingGuideBanner } from "@/components/commerce/listing-guide-banner";
import { ProductCard } from "@/components/commerce/product-card";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";

type SortKey = "popularity" | "price-asc" | "price-desc" | "rating";

function extractVoltage(name: string): string | null {
  const match = name.match(/\b(\d{1,3}V)\b/i);
  return match ? match[1].toUpperCase() : null;
}

interface ProductListingProps {
  products: Product[];
  categoryName: string;
}

export function ProductListing({ products, categoryName }: ProductListingProps) {
  if (products.length === 0) {
    return (
      <div className="mx-auto max-w-[1600px] px-4 py-16 sm:px-margin-desktop">
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border-default py-16 text-center">
          <span aria-hidden className="material-symbols-outlined text-[40px] text-graphite-200">
            inventory_2
          </span>
          <p className="text-body-md font-body-md font-semibold text-text-primary">No products listed in {categoryName} yet.</p>
          <p className="text-body-sm font-body-sm text-text-secondary">New stock is added regularly — check back soon, or browse another department.</p>
          <Button asChild variant="outline">
            <Link href="/">Browse Departments</Link>
          </Button>
        </div>
      </div>
    );
  }

  return <ProductListingWithResults products={products} categoryName={categoryName} />;
}

function ProductListingWithResults({ products, categoryName }: ProductListingProps) {
  const brands = useMemo(() => Array.from(new Set(products.map((p) => p.brand))).sort(), [products]);
  const voltages = useMemo(
    () => Array.from(new Set(products.map((p) => extractVoltage(p.name)).filter(Boolean))) as string[],
    [products],
  );
  const maxPrice = useMemo(() => Math.max(...products.map((p) => p.priceIncVat), 100), [products]);

  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedVoltages, setSelectedVoltages] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [brushlessOnly, setBrushlessOnly] = useState(false);
  const [proTradeOnly, setProTradeOnly] = useState(false);
  const [priceMax, setPriceMax] = useState(maxPrice);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("popularity");
  const [pageSize, setPageSize] = useState<12 | 24 | 48>(12);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  const isBrushless = (p: Product) => /brushless/i.test(p.name) || p.highlights.some((h) => /brushless/i.test(h.caption));
  const isProTrade = (p: Product) => p.tradePriceIncVat !== undefined;

  const filtered = useMemo(() => {
    let result = products.filter((p) => {
      if (query && !p.name.toLowerCase().includes(query.toLowerCase())) return false;
      if (selectedBrands.length && !selectedBrands.includes(p.brand)) return false;
      if (selectedVoltages.length) {
        const v = extractVoltage(p.name);
        if (!v || !selectedVoltages.includes(v)) return false;
      }
      if (inStockOnly && p.stock === "out-of-stock") return false;
      if (brushlessOnly && !isBrushless(p)) return false;
      if (proTradeOnly && !isProTrade(p)) return false;
      if (p.priceIncVat > priceMax) return false;
      return true;
    });
    result = [...result].sort((a, b) => {
      if (sort === "price-asc") return a.priceIncVat - b.priceIncVat;
      if (sort === "price-desc") return b.priceIncVat - a.priceIncVat;
      if (sort === "rating") return b.rating - a.rating;
      return b.reviewCount - a.reviewCount;
    });
    return result;
  }, [products, query, selectedBrands, selectedVoltages, inStockOnly, brushlessOnly, proTradeOnly, priceMax, sort]);

  const paged = useMemo(() => filtered.slice(0, pageSize), [filtered, pageSize]);

  const activeFilters = [
    ...selectedVoltages.map((voltage) => ({ key: `platform-${voltage}`, label: `Platform: ${voltage}`, tone: "default" as const, clear: () => setSelectedVoltages((selected) => selected.filter((value) => value !== voltage)) })),
    ...(brushlessOnly ? [{ key: "motor", label: "Motor: Brushless", tone: "default" as const, clear: () => setBrushlessOnly(false) }] : []),
    ...selectedBrands.map((brand) => ({ key: `brand-${brand}`, label: `Brand: ${brand}`, tone: "default" as const, clear: () => setSelectedBrands((selected) => selected.filter((value) => value !== brand)) })),
    ...(inStockOnly ? [{ key: "stock", label: "In Stock Only", tone: "success" as const, clear: () => setInStockOnly(false) }] : []),
    ...(proTradeOnly ? [{ key: "grade", label: "Grade: Pro Trade", tone: "default" as const, clear: () => setProTradeOnly(false) }] : []),
    ...(priceMax < maxPrice ? [{ key: "price", label: `Under £${priceMax}`, tone: "default" as const, clear: () => setPriceMax(maxPrice) }] : []),
  ];

  function clearAll() {
    setSelectedBrands([]);
    setSelectedVoltages([]);
    setInStockOnly(false);
    setBrushlessOnly(false);
    setProTradeOnly(false);
    setPriceMax(maxPrice);
  }

  const filterPanel = (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-orange-500/30 bg-orange-50 p-4">
        <p className="text-label-md font-label-md font-bold uppercase tracking-wide text-orange-700">Trade Account</p>
        <p className="text-body-md font-body-md font-bold text-graphite-900">15% Trade Discount</p>
        <p className="text-label-sm font-label-sm text-text-secondary">Trade credit tier unlocks net pricing and jobsite pallet deliveries.</p>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-label-lg font-label-lg font-bold text-graphite-900">Refine Results</p>
        <button type="button" onClick={clearAll} className="text-label-sm font-label-sm text-orange-600 hover:underline">
          Reset
        </button>
      </div>

      {brands.length > 0 && (
        <fieldset>
          <legend className="mb-2 text-label-md font-label-md font-bold text-graphite-900">Manufacturer</legend>
          <div className="flex flex-col gap-2">
            {brands.map((brand) => (
              <label key={brand} className="flex items-center gap-2 text-body-sm font-body-sm text-text-primary">
                <Checkbox
                  checked={selectedBrands.includes(brand)}
                  onCheckedChange={(checked) =>
                    setSelectedBrands((s) => (checked ? [...s, brand] : s.filter((b) => b !== brand)))
                  }
                />
                {brand}
                <span className="ml-auto text-label-sm font-label-sm text-text-disabled">
                  {products.filter((p) => p.brand === brand).length}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {voltages.length > 0 && (
        <fieldset>
          <legend className="mb-2 text-label-md font-label-md font-bold text-graphite-900">Voltage &amp; Battery System</legend>
          <div className="flex flex-col gap-2">
            {voltages.map((v) => (
              <label key={v} className="flex items-center gap-2 text-body-sm font-body-sm text-text-primary">
                <Checkbox
                  checked={selectedVoltages.includes(v)}
                  onCheckedChange={(checked) => setSelectedVoltages((s) => (checked ? [...s, v] : s.filter((x) => x !== v)))}
                />
                {v} System
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <fieldset>
        <legend className="mb-2 text-label-md font-label-md font-bold text-graphite-900">Price Range (£)</legend>
        <Slider min={0} max={maxPrice} step={5} value={[priceMax]} onValueChange={([v]) => setPriceMax(v)} />
        <p className="mt-2 text-label-sm font-label-sm text-text-secondary">Up to £{priceMax.toFixed(0)}</p>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-label-md font-label-md font-bold text-graphite-900">Motor Type</legend>
        <label className="flex items-center gap-2 text-body-sm font-body-sm text-text-primary">
          <Checkbox checked={brushlessOnly} onCheckedChange={(checked) => setBrushlessOnly(Boolean(checked))} />
          Brushless Only
        </label>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-label-md font-label-md font-bold text-graphite-900">Grade</legend>
        <label className="flex items-center gap-2 text-body-sm font-body-sm text-text-primary">
          <Checkbox checked={proTradeOnly} onCheckedChange={(checked) => setProTradeOnly(Boolean(checked))} />
          Pro Trade
        </label>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-label-md font-label-md font-bold text-graphite-900">Availability</legend>
        <label className="flex items-center gap-2 text-body-sm font-body-sm text-text-primary">
          <Checkbox checked={inStockOnly} onCheckedChange={(checked) => setInStockOnly(Boolean(checked))} />
          In Stock Only
        </label>
      </fieldset>
    </div>
  );

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-margin-desktop">
      <p aria-live="polite" className="sr-only">
        {filtered.length} products found
      </p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="hidden h-fit rounded-xl border border-border-default bg-surface-white p-5 lg:block">{filterPanel}</aside>

        <div>
          <div className="mb-4 rounded-xl border border-border-default bg-surface-white px-3 shadow-[0_1px_2px_rgb(0_0_0/0.04)]">
            <div className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="flex flex-1 flex-wrap items-center gap-3">
                <p className="whitespace-nowrap text-[11px] leading-4 font-semibold text-graphite-900">
                  Showing <span className="font-bold text-orange-600">{paged.length ? 1 : 0}-{paged.length}</span> of{" "}
                  <span className="font-bold text-text-primary">{filtered.length}</span> Products
                </p>
                <label className="relative w-full min-w-0 sm:w-[280px] sm:flex-none">
                  <span aria-hidden className="material-symbols-outlined pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[18px] text-text-disabled">
                    search
                  </span>
                  <input
                    aria-label={`Search within ${categoryName}`}
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={`Search within ${categoryName}...`}
                    className="h-8 w-full rounded-md border border-border-default bg-surface-container-low pl-8 pr-3 text-[12px] text-text-primary placeholder:text-text-disabled focus:border-orange-500 focus:outline-none"
                  />
                </label>
              </div>

              <div className="flex flex-wrap items-center gap-3">
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
                    <option value="popularity">Recommended for Trade</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="rating">Customer Rating</option>
                  </select>
                </label>

                <div className="flex items-center gap-2">
                  <span className="whitespace-nowrap text-[10px] text-text-secondary">Show:</span>
                  <div className="flex items-center gap-1">
                    {([12, 24, 48] as const).map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setPageSize(size)}
                        aria-pressed={pageSize === size}
                        aria-label={`Show ${size} products`}
                        className={cn(
                          "flex h-7 w-7 items-center justify-center rounded text-label-sm font-label-sm font-semibold",
                          pageSize === size ? "bg-orange-100 text-orange-700" : "text-text-secondary hover:bg-surface-container-low",
                        )}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center rounded-md border border-border-default bg-surface-container-low p-0.5">
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
                    className={cn(
                      "flex min-h-7 max-w-full items-center gap-1 rounded border px-2 py-1 text-[10px] leading-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500",
                      f.tone === "success"
                        ? "border-success-500/40 bg-success-100 text-success-500"
                        : f.key === "grade" ? "border-border-default bg-surface-container-low text-graphite-600" : "border-orange-500/40 bg-orange-50 text-orange-700",
                    )}
                  >
                    <span className="text-left">{f.label}</span>
                    <span aria-hidden className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                ))}
                <button type="button" onClick={clearAll} className="ml-auto whitespace-nowrap text-label-sm font-label-sm font-semibold text-orange-600 hover:underline">
                  Clear All ({activeFilters.length})
                </button>
              </div>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border-default py-16 text-center">
              <span aria-hidden className="material-symbols-outlined text-[40px] text-graphite-200">search_off</span>
              <p className="text-body-md font-body-md font-semibold text-text-primary">No products match these filters.</p>
              <p className="text-body-sm font-body-sm text-text-secondary">
                Try clearing a filter, or browse the rest of {categoryName}.
              </p>
              <Button variant="outline" onClick={clearAll}>
                Clear all filters
              </Button>
            </div>
          ) : (
            <div className={cn("grid gap-4", view === "grid" ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-1")}>
              {paged.map((product, index) => (
                <Fragment key={product.id}>
                  <ProductCard product={product} layout={view} featured={view === "grid"} />
                  {index === (view === "grid" ? 3 : 2) && index < paged.length - 1 && (
                    <ListingGuideBanner />
                  )}
                </Fragment>
              ))}
            </div>
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
