"use client";

import { FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { useCartStore } from "@/lib/cart-store";
import { calculateMaterials, type CalculatorProduct, type MaterialsResult } from "@/lib/storefront-client";

// "m2_per_bag" -> "bag": the noun the customer buys by.
const nounOf = (unit: string | null) => (unit?.includes("_per_") ? unit.split("_per_")[1] : "unit");
const plural = (count: number, noun: string) => (count === 1 ? noun : `${noun}s`);
const inputClass = "mt-1 h-11 w-full rounded-md border border-border-default bg-white px-3";

/** How many bags / boxes / litres to buy for an area, using each product's coverage rate set in the admin. */
export function MaterialsCalculator({ products }: { products: CalculatorProduct[] }) {
  const addItem = useCartStore((state) => state.addItem);
  const [slug, setSlug] = useState(products[0]?.slug ?? "");
  const [area, setArea] = useState("");
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [wastage, setWastage] = useState("10");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<MaterialsResult | null>(null);
  const [adding, setAdding] = useState(false);

  const product = products.find((item) => item.slug === slug);
  const groups = useMemo(() => [...new Set(products.map((item) => item.category))], [products]);
  const lengthWidthArea = Number(length) > 0 && Number(width) > 0 ? Math.round(Number(length) * Number(width) * 100) / 100 : null;

  async function submit(event: FormEvent) {
    event.preventDefault();
    const effectiveArea = Number(area) > 0 ? Number(area) : lengthWidthArea;
    if (!product || !effectiveArea) return setError("Enter the area, or a length and width.");
    setBusy(true);
    setError("");
    try {
      setResult(await calculateMaterials(product.slug, effectiveArea, Math.max(0, Number(wastage) || 0)));
    } catch (failure) {
      setResult(null);
      setError(failure instanceof Error ? failure.message : "The calculation failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function addToBasket() {
    if (!result?.variantId) return;
    setAdding(true);
    try {
      await addItem(result.variantId, result.unitsNeeded);
      toast.success(`Added ${result.unitsNeeded} × ${result.productTitle} to your basket`);
    } catch (failure) {
      toast.error(failure instanceof Error ? failure.message : "Could not add to your basket.");
    } finally {
      setAdding(false);
    }
  }

  if (products.length === 0) {
    return <p role="status" className="mt-8 rounded-xl border border-border-default bg-white p-6">No products are set up for the calculator yet. Check back soon.</p>;
  }

  const noun = nounOf(result?.coverageUnit ?? product?.coverageUnit ?? null);
  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
      <form onSubmit={submit} className="rounded-xl border border-border-default bg-white p-6">
        <label className="block text-sm font-semibold" htmlFor="calc-product">Product</label>
        <select id="calc-product" value={slug} onChange={(event) => { setSlug(event.target.value); setResult(null); }} className={inputClass}>
          {groups.map((group) => (
            <optgroup key={group} label={group}>
              {products.filter((item) => item.category === group).map((item) => <option key={item.slug} value={item.slug}>{item.title}</option>)}
            </optgroup>
          ))}
        </select>
        {product && <p className="mt-1 text-sm text-text-secondary">One {nounOf(product.coverageUnit)} covers about {product.coverageValue} m².</p>}

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-3">
            <label className="block text-sm font-semibold" htmlFor="calc-area">Area to cover (m²)</label>
            <input id="calc-area" type="number" min="0.01" step="0.01" value={area} onChange={(event) => setArea(event.target.value)} placeholder={lengthWidthArea ? String(lengthWidthArea) : "e.g. 23"} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-semibold" htmlFor="calc-length">…or length (m)</label>
            <input id="calc-length" type="number" min="0.01" step="0.01" value={length} onChange={(event) => setLength(event.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-semibold" htmlFor="calc-width">width (m)</label>
            <input id="calc-width" type="number" min="0.01" step="0.01" value={width} onChange={(event) => setWidth(event.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-semibold" htmlFor="calc-wastage">Wastage allowance (%)</label>
            <input id="calc-wastage" type="number" min="0" max="100" step="1" value={wastage} onChange={(event) => setWastage(event.target.value)} className={inputClass} />
          </div>
        </div>

        {error && <p role="alert" className="mt-4 text-sm text-error-500">{error}</p>}
        <Button type="submit" disabled={busy} className="mt-5 bg-orange-500 hover:bg-orange-600">{busy ? "Calculating…" : "Calculate"}</Button>
      </form>

      <aside aria-live="polite" className="rounded-xl border border-border-default bg-white p-6">
        <h2 className="text-lg font-bold">Your estimate</h2>
        {!result ? <p className="mt-2 text-sm text-text-secondary">Choose a product and enter the area to see how much you need.</p> : (
          <>
            <p className="mt-3 text-4xl font-bold text-orange-600">{result.unitsNeeded} <span className="text-lg font-semibold text-graphite-900">{plural(result.unitsNeeded, noun)}</span></p>
            <p className="mt-2 text-sm text-text-secondary">For {result.area} m² with {result.wastagePercent}% wastage, at {result.coverageValue} m² per {noun}.</p>
            {result.estimatedCost !== null && <p className="mt-3 font-semibold">Estimated cost: {formatPrice(result.estimatedCost)} <span className="font-normal text-text-secondary">inc. VAT</span></p>}
            {result.variantId && <Button type="button" onClick={addToBasket} disabled={adding} className="mt-4 w-full bg-orange-500 hover:bg-orange-600">{adding ? "Adding…" : `Add ${result.unitsNeeded} to basket`}</Button>}
            <p className="mt-3 text-xs text-text-secondary">An estimate only - always check the manufacturer&apos;s guidance for your surface.</p>
          </>
        )}
      </aside>
    </div>
  );
}
