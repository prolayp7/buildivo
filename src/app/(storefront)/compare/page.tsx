"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { LoaderCircle, Plus, Search, ShoppingCart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/commerce/product-image";
import { Rating } from "@/components/commerce/rating";
import { StockBadge } from "@/components/commerce/stock-badge";
import { formatPrice } from "@/lib/format";
import { useCartStore } from "@/lib/cart-store";
import { fetchCompareProducts, fetchFrequentlyBoughtTogether, fetchProductSuggestions, type CompareResult } from "@/lib/storefront-client";
import type { Product } from "@/types";

const MAX_COMPARE = 4;

export default function ComparePage() {
  const compare = useCartStore((s) => s.compare);
  const toggleCompare = useCartStore((s) => s.toggleCompare);
  const addItem = useCartStore((s) => s.addItem);
  const [result, setResult] = useState<CompareResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [highlightDiff, setHighlightDiff] = useState(true);
  const [hideIdentical, setHideIdentical] = useState(false);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [searching, setSearching] = useState(false);
  const [fbtProducts, setFbtProducts] = useState<Product[]>([]);
  const [fbtLoading, setFbtLoading] = useState(false);
  const [fbtAddingId, setFbtAddingId] = useState<number | null>(null);
  const [addingAll, setAddingAll] = useState(false);

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

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      if (query.trim().length < 2) { setSuggestions([]); return; }
      setSearching(true);
      fetchProductSuggestions(query.trim(), controller.signal)
        .then((items) => { if (!controller.signal.aborted) setSuggestions(items.filter((p) => !compare.includes(p.id))); })
        .catch(() => {})
        .finally(() => { if (!controller.signal.aborted) setSearching(false); });
    }, 250);
    return () => { controller.abort(); window.clearTimeout(timer); };
  }, [query, compare]);

  const anchorSlug = result?.products[0]?.slug;
  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      if (!anchorSlug) { setFbtProducts([]); return; }
      setFbtLoading(true);
      fetchFrequentlyBoughtTogether(anchorSlug, 3)
        .then((items) => { if (!cancelled) setFbtProducts(items); })
        .catch(() => { if (!cancelled) setFbtProducts([]); })
        .finally(() => { if (!cancelled) setFbtLoading(false); });
    }, 0);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [anchorSlug]);

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
  const commonCategory = products.every((p) => p.category.slug === products[0].category.slug) ? products[0].category : null;
  const visibleSpecs = specifications
    .map((spec) => ({ ...spec, allSame: spec.values.every((v) => v === spec.values[0]) }))
    .filter((spec) => !hideIdentical || !spec.allSame);

  function exportCsv() {
    const rows = [["", ...products.map((p) => p.title)], ...specifications.map((spec) => [spec.key, ...spec.values.map((v) => v ?? "—")])];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url; link.download = "buildivo-comparison.csv"; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function addToCart(product: CompareResult["products"][number]) {
    if (!product.defaultVariantId) return;
    setAddingId(product.id);
    try { await addItem(product.defaultVariantId, 1); toast.success(`Added ${product.title} to cart`); }
    catch { toast.error("Could not add this product. Try again."); }
    finally { setAddingId(null); }
  }

  const purchasable = products.filter((p) => p.inStock && p.defaultVariantId);
  const bundleTotalExVat = products.reduce((sum, p) => sum + Number(p.salePrice ?? p.price ?? 0) / (1 + Number(p.vatRatePercent ?? 0) / 100), 0);

  async function addAllToCart() {
    if (!purchasable.length) return;
    setAddingAll(true);
    try {
      for (const p of purchasable) await addItem(p.defaultVariantId!, 1);
      toast.success(`Added ${purchasable.length} ${purchasable.length === 1 ? "product" : "products"} to cart`);
    } catch { toast.error("Could not add all products. Try again."); }
    finally { setAddingAll(false); }
  }

  async function addFbtToCart(product: Product) {
    if (!product.defaultVariantId) return;
    setFbtAddingId(product.id);
    try { await addItem(product.defaultVariantId, 1); toast.success(`Added ${product.name} to cart`); }
    catch { toast.error("Could not add this product. Try again."); }
    finally { setFbtAddingId(null); }
  }

  return (
    <div>
      <div className="border-b border-border-default bg-surface-white">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-1 px-4 py-3 text-label-sm font-label-sm text-text-secondary sm:px-margin-desktop">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1">
            <Link href="/" className="flex items-center hover:underline">
              <span aria-hidden className="material-symbols-outlined text-[16px]">home</span>
              <span className="sr-only">Home</span>
            </Link>
            <span aria-hidden>/</span>
            {commonCategory?.parent && <><Link href={`/c/${commonCategory.parent.slug}`} className="hover:underline">{commonCategory.parent.title}</Link><span aria-hidden>/</span></>}
            {commonCategory && <><Link href={`/c/${commonCategory.slug}`} className="hover:underline">{commonCategory.title}</Link><span aria-hidden>/</span></>}
            <span className="font-semibold text-text-primary">Product Comparison</span>
          </nav>
        </div>
      </div>
      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-margin-desktop">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="mb-2 inline-block rounded-full bg-orange-50 px-3 py-1 text-label-sm font-label-sm font-semibold text-orange-700">
            {products.length} of {MAX_COMPARE} slots used
          </span>
          <h1 className="text-headline-lg-mobile font-headline-lg-mobile font-bold text-graphite-900 sm:text-headline-lg sm:font-headline-lg">
            {commonCategory ? `Compare ${commonCategory.title}` : "Compare Products"} ({products.length})
          </h1>
          <p className="mt-1 text-body-sm font-body-sm text-text-secondary">Side-by-side specifications and pricing to help you pick the right tool.</p>
        </div>
        <div className="flex flex-shrink-0 gap-2">
          <Button variant="outline" onClick={exportCsv}>Export CSV</Button>
          <Button variant="outline" onClick={() => compare.forEach((id) => toggleCompare(id))}>Clear all</Button>
        </div>
      </div>

      <div className="mb-6 grid gap-4" style={{ gridTemplateColumns: `repeat(${products.length}, minmax(0, 1fr))` }}>
        {products.map((p) => (
          <div key={p.id} className="rounded-lg border border-border-default bg-white p-4">
            <button type="button" onClick={() => toggleCompare(p.id)} className="mb-2 flex items-center gap-1 text-label-sm font-label-sm text-error-500 hover:underline">
              <X size={14} />Remove
            </button>
            <ProductImage src={p.image ?? undefined} categorySlug="" className="mb-3 flex h-28 w-28 items-center justify-center rounded-lg" />
            <Link href={`/p/${p.slug}`} className="mb-1 block text-body-sm font-body-sm font-bold hover:underline">{p.title}</Link>
            <p className="text-label-sm font-label-sm text-text-secondary">{p.brand ?? "Unbranded"}</p>
            {p.reviewSummary.count > 0 && (
              <div className="mt-2 flex items-center gap-1.5">
                <Rating value={p.reviewSummary.average} />
                <span className="text-label-sm font-label-sm text-text-secondary">{p.reviewSummary.average.toFixed(1)} ({p.reviewSummary.count})</span>
              </div>
            )}
            <div className="mt-2 flex items-baseline gap-2">
              <p className="text-body-md font-body-md font-bold text-graphite-900">{formatPrice(Number(p.salePrice ?? p.price ?? 0))}</p>
              {p.salePrice && p.price && Number(p.salePrice) < Number(p.price) && (
                <p className="text-label-sm font-label-sm text-text-disabled line-through">{formatPrice(Number(p.price))}</p>
              )}
            </div>
            <StockBadge status={p.inStock ? "in-stock" : "out-of-stock"} count={p.stockQty} className="mt-1.5" />
            <Button
              className="mt-3 w-full bg-orange-500 hover:bg-orange-600"
              disabled={!p.inStock || !p.defaultVariantId || addingId === p.id}
              onClick={() => addToCart(p)}
            >
              <ShoppingCart size={15} />{addingId === p.id ? "Adding…" : "Add to cart"}
            </Button>
          </div>
        ))}
      </div>

      {products.length < MAX_COMPARE && (
        <div className="relative mb-6 rounded-lg border border-dashed border-border-default bg-surface-warm p-4">
          <p className="mb-2 text-body-sm font-body-sm font-semibold text-graphite-900">Compare another product</p>
          <div className="flex items-center gap-2 rounded-md border border-border-default bg-white px-3 py-2">
            <Search size={16} className="flex-shrink-0 text-text-secondary" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search SKU, model or brand…"
              className="w-full min-w-0 text-body-sm font-body-sm outline-none"
            />
          </div>
          {query.trim().length >= 2 && (
            <div className="absolute z-10 mt-1 w-full max-w-md overflow-hidden rounded-md border border-border-default bg-white shadow-lg">
              {searching ? (
                <p className="p-3 text-label-sm font-label-sm text-text-secondary">Searching…</p>
              ) : suggestions.length ? (
                suggestions.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => { toggleCompare(p.id); setQuery(""); setSuggestions([]); }}
                    className="flex w-full items-center gap-2 p-2 text-left hover:bg-surface-warm"
                  >
                    <ProductImage src={p.image} categorySlug={p.categorySlug} className="h-9 w-9 flex-shrink-0 rounded" />
                    <span className="min-w-0 flex-1 truncate text-body-sm font-body-sm">{p.name}</span>
                  </button>
                ))
              ) : (
                <p className="p-3 text-label-sm font-label-sm text-text-secondary">No matching products.</p>
              )}
            </div>
          )}
        </div>
      )}

      <div className="mb-6 overflow-hidden rounded-lg bg-graphite-900 text-white">
        <p className="px-4 pt-4 text-label-sm font-label-sm font-semibold uppercase tracking-wide text-orange-500">Pricing &amp; Stock Overview</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-separate border-spacing-0">
            <tbody>
              <tr>
                <th scope="row" className="w-40 border-b border-white/10 p-3 text-left text-label-sm font-label-sm font-semibold text-white/70">Trade price (ex. VAT)</th>
                {products.map((p) => <td key={p.id} className="border-b border-white/10 p-3 text-body-sm font-body-sm font-semibold">{formatPrice(Number(p.salePrice ?? p.price ?? 0) / (1 + Number(p.vatRatePercent ?? 0) / 100))}</td>)}
              </tr>
              <tr>
                <th scope="row" className="border-b border-white/10 p-3 text-left text-label-sm font-label-sm font-semibold text-white/70">Standard retail (inc. VAT)</th>
                {products.map((p) => <td key={p.id} className="border-b border-white/10 p-3 text-body-sm font-body-sm">{p.salePrice && p.price && Number(p.salePrice) < Number(p.price) ? formatPrice(Number(p.price)) : "—"}</td>)}
              </tr>
              <tr>
                <th scope="row" className="border-b border-white/10 p-3 text-left text-label-sm font-label-sm font-semibold text-white/70">Savings</th>
                {products.map((p) => <td key={p.id} className="border-b border-white/10 p-3 text-body-sm font-body-sm text-orange-400">{p.salePrice && p.price && Number(p.salePrice) < Number(p.price) ? `${Math.round((1 - Number(p.salePrice) / Number(p.price)) * 100)}%` : "—"}</td>)}
              </tr>
              <tr>
                <th scope="row" className="p-3 text-left text-label-sm font-label-sm font-semibold text-white/70">Stock</th>
                {products.map((p) => <td key={p.id} className="p-3 text-body-sm font-body-sm">{p.inStock ? `${p.stockQty} available` : "Out of stock"}</td>)}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-5">
        <label className="flex items-center gap-2 text-body-sm font-body-sm text-graphite-900">
          <input type="checkbox" checked={highlightDiff} onChange={(event) => setHighlightDiff(event.target.checked)} className="accent-orange-500" />
          Highlight differences
        </label>
        <label className="flex items-center gap-2 text-body-sm font-body-sm text-graphite-900">
          <input type="checkbox" checked={hideIdentical} onChange={(event) => setHideIdentical(event.target.checked)} className="accent-orange-500" />
          Hide identical rows
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="w-40 text-left text-label-sm font-label-sm text-text-disabled"> </th>
              {products.map((p) => <th key={p.id} className="border-b border-border-default p-3 text-left text-label-sm font-label-sm font-semibold text-text-secondary">{p.title}</th>)}
            </tr>
          </thead>
          <tbody>
            {visibleSpecs.length === 0 && (
              <tr><td colSpan={products.length + 1} className="p-6 text-center text-body-sm font-body-sm text-text-secondary">No differing specifications to show.</td></tr>
            )}
            {visibleSpecs.map((spec) => (
              <tr key={spec.key} className={highlightDiff && !spec.allSame ? "bg-orange-50/60" : undefined}>
                <th scope="row" className="border-b border-border-default p-3 text-left text-label-sm font-label-sm font-semibold text-text-secondary">{spec.key}</th>
                {spec.values.map((value, index) => (
                  <td key={`${spec.key}-${products[index]?.id ?? index}`} className="border-b border-border-default p-3 text-body-sm font-body-sm">{value ?? "—"}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 overflow-hidden rounded-lg bg-graphite-900 text-white">
        <div className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div>
            <h2 className="text-body-md font-body-md font-bold">Add all {products.length} to your basket</h2>
            <p className="mt-1 text-label-sm font-label-sm text-white/70">Skip adding items one by one — add every compared product to your basket in one click.</p>
          </div>
          <div className="flex flex-shrink-0 items-center gap-4">
            <div className="text-right">
              <p className="text-label-sm font-label-sm text-white/60">Total (ex. VAT)</p>
              <p className="text-body-md font-body-md font-bold text-orange-400">{formatPrice(bundleTotalExVat)}</p>
            </div>
            <Button className="bg-orange-500 hover:bg-orange-600" disabled={!purchasable.length || addingAll} onClick={addAllToCart}>
              <ShoppingCart size={15} />{addingAll ? "Adding…" : `Add all ${purchasable.length} to cart`}
            </Button>
          </div>
        </div>
      </div>

      {(fbtLoading || fbtProducts.length > 0) && (
        <div className="mt-8">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-label-sm font-label-sm font-semibold uppercase tracking-wide text-orange-700">Frequently bought together</p>
              <h2 className="text-body-lg font-body-lg font-bold text-graphite-900">
                {commonCategory ? `Frequently Paired with ${commonCategory.title}` : "Customers Also Bought"}
              </h2>
            </div>
            {commonCategory && (
              <Link href={`/c/${commonCategory.slug}`} className="text-label-sm font-label-sm font-semibold text-orange-700 hover:underline">
                Browse all {commonCategory.title} →
              </Link>
            )}
          </div>
          {fbtLoading ? (
            <div className="flex justify-center p-6"><LoaderCircle className="h-5 w-5 animate-spin text-graphite-300" /></div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-3">
              {fbtProducts.map((p) => (
                <div key={p.id} className="rounded-lg border border-border-default bg-white p-4">
                  <ProductImage src={p.image} categorySlug={p.categorySlug} className="mb-3 flex h-32 w-full items-center justify-center rounded-lg" />
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <span className="rounded bg-surface-warm px-2 py-0.5 text-label-sm font-label-sm font-semibold text-text-secondary">{p.brand}</span>
                    <StockBadge status={p.stock} count={p.stockCount} />
                  </div>
                  <Link href={`/p/${p.slug}`} className="mb-1 block text-body-sm font-body-sm font-bold hover:underline">{p.name}</Link>
                  <p className="mb-3 line-clamp-2 text-label-sm font-label-sm text-text-secondary">{p.description.replace(/<[^>]*>/g, " ").trim()}</p>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-body-sm font-body-sm font-bold text-graphite-900">
                      {formatPrice(p.priceIncVat / (1 + p.vatRate))} <span className="text-label-sm font-label-sm font-normal text-text-secondary">ex VAT</span>
                    </p>
                    <Button size="sm" className="bg-orange-500 hover:bg-orange-600" disabled={!p.defaultVariantId || p.stock === "out-of-stock" || fbtAddingId === p.id} onClick={() => addFbtToCart(p)}>
                      <Plus size={14} />{fbtAddingId === p.id ? "Adding…" : "Add"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
}
