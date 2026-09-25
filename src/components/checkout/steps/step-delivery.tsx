"use client";

import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ProductImage } from "@/components/commerce/product-image";
import { deliveryEstimate } from "@/lib/checkout";
import type { ShippingQuote } from "@/lib/storefront-client";
import { formatPrice } from "@/lib/format";
import { lineProduct, useCartTotals } from "@/lib/cart-store";
import type { Address } from "@/types";
import { cn } from "@/lib/utils";

interface StepDeliveryProps {
  address: Address;
  /** Delivery methods and prices from the API; null while loading. */
  quotes: ShippingQuote[] | null;
  value: number | null;
  onChange: (id: number) => void;
  note: string;
  onNoteChange: (note: string) => void;
  onContinue: () => void;
  onBack: () => void;
}

export function StepDelivery({ address, quotes, value, onChange, note, onNoteChange, onContinue, onBack }: StepDeliveryProps) {
  const { activeLines, freeShippingCoupon } = useCartTotals();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-1 text-label-sm font-label-sm font-semibold uppercase tracking-wide text-orange-600">Step 3 of 5 · Delivery</p>
        <h1 className="text-headline-lg-mobile font-headline-lg-mobile font-bold text-graphite-900 sm:text-headline-lg sm:font-headline-lg">
          Choose Your Delivery Method
        </h1>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-border-default bg-surface-white p-4">
        <p className="flex items-center gap-2 text-body-sm font-body-sm text-text-primary">
          <span aria-hidden className="material-symbols-outlined text-[18px] text-orange-600">location_on</span>
          <span>
            {address.line1}, {address.city} {address.postcode} · {address.fullName}
          </span>
        </p>
        <button type="button" onClick={onBack} className="flex items-center gap-1 text-label-sm font-label-sm font-semibold text-orange-600 hover:underline">
          <span aria-hidden className="material-symbols-outlined text-[16px]">edit</span>
          Edit Address
        </button>
      </div>

      <div className="rounded-xl border border-border-default bg-surface-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-body-lg font-body-lg font-bold text-graphite-900">Items in this delivery ({activeLines.length})</h2>
        </div>
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {activeLines.map((line) => {
            const product = lineProduct(line);
            if (!product) return null;
            return (
              <div key={`${line.productId}-${line.variantId ?? "base"}`} className="flex items-center gap-2 rounded-lg border border-border-default p-2">
                <ProductImage categorySlug={product.categorySlug} className="h-10 w-10 shrink-0 rounded" />
                <div className="min-w-0">
                  <p className="truncate text-label-sm font-label-sm font-semibold text-text-primary">{product.name}</p>
                  <p className="text-label-sm font-label-sm text-text-secondary">Qty {line.qty}</p>
                </div>
              </div>
            );
          })}
        </div>

        <p className="mb-2 text-label-md font-label-md font-bold text-graphite-900">Select Delivery Method</p>
        {quotes === null ? (
          <p role="status" className="py-4 text-body-sm font-body-sm text-text-secondary">Loading delivery options…</p>
        ) : quotes.length === 0 ? (
          <p role="alert" className="rounded-lg bg-error-100 p-4 text-body-sm font-body-sm text-error-500">No delivery methods are available for this basket right now. Please try again shortly or contact us.</p>
        ) : (
          <RadioGroup value={value === null ? "" : String(value)} onValueChange={(v) => onChange(Number(v))} className="flex flex-col gap-2">
            {quotes.map((method) => {
              const charge = freeShippingCoupon ? 0 : method.rate;
              return (
                <label
                  key={method.id}
                  htmlFor={`step-delivery-${method.id}`}
                  className={cn(
                    "flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-4",
                    value === method.id ? "border-orange-500 bg-orange-50" : "border-border-default",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <RadioGroupItem value={String(method.id)} id={`step-delivery-${method.id}`} className="mt-1" />
                    <div>
                      <p className="text-body-sm font-body-sm font-bold text-text-primary">{method.title}</p>
                      <p className="text-label-sm font-label-sm text-text-secondary">{method.carrier} · {deliveryEstimate(method)}</p>
                    </div>
                  </div>
                  <span className={cn("shrink-0 text-body-sm font-body-sm font-bold", charge === 0 ? "text-success-500" : "text-text-primary")}>
                    {charge === 0 ? "FREE" : formatPrice(charge)}
                  </span>
                </label>
              );
            })}
          </RadioGroup>
        )}
      </div>

      <div className="rounded-xl border border-border-default bg-surface-white p-5">
        <label htmlFor="delivery-note" className="mb-1 block text-label-md font-label-md font-semibold text-graphite-900">Delivery instructions (optional)</label>
        <textarea
          id="delivery-note"
          value={note}
          onChange={(event) => onNoteChange(event.target.value)}
          maxLength={500}
          rows={3}
          placeholder="Gate code, safe place, site contact…"
          className="w-full rounded-md border border-border-default bg-surface-white px-3 py-2 text-body-sm font-body-sm"
        />
        <p className="mt-1 text-label-sm font-label-sm text-text-secondary">Passed to our team with your order.</p>
      </div>

      <div className="flex items-center justify-between">
        <Button type="button" variant="ghost" onClick={onBack}>
          <span aria-hidden className="material-symbols-outlined text-[18px]">arrow_back</span>
          Return to Address
        </Button>
        <Button className="bg-orange-500 font-label-lg text-label-lg font-bold hover:bg-orange-600" onClick={onContinue} disabled={value === null}>
          Continue to Payment Method
          <span aria-hidden className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </Button>
      </div>
    </div>
  );
}
