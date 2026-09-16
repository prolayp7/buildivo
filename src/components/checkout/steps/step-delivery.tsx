"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ProductImage } from "@/components/commerce/product-image";
import { DELIVERY_METHODS } from "@/lib/checkout";
import { formatPrice } from "@/lib/format";
import { lineProduct, useCartTotals } from "@/lib/cart-store";
import type { Address, DeliveryMethodId } from "@/types";
import { cn } from "@/lib/utils";

interface StepDeliveryProps {
  address: Address;
  value: DeliveryMethodId;
  onChange: (value: DeliveryMethodId) => void;
  onContinue: () => void;
  onBack: () => void;
}

export function StepDelivery({ address, value, onChange, onContinue, onBack }: StepDeliveryProps) {
  const { activeLines } = useCartTotals();
  const [forkliftConfirmed, setForkliftConfirmed] = useState(true);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-1 text-label-sm font-label-sm font-semibold uppercase tracking-wide text-orange-600">Step 3 of 5 · Logistics &amp; Routing</p>
        <h1 className="text-headline-lg-mobile font-headline-lg-mobile font-bold text-graphite-900 sm:text-headline-lg sm:font-headline-lg">
          Choose Your Delivery &amp; Fulfilment Method
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
          <h2 className="text-body-lg font-body-lg font-bold text-graphite-900">Equipment Dispatch ({activeLines.length} Items)</h2>
          <span className="rounded-full bg-success-100 px-2 py-0.5 text-label-sm font-label-sm font-semibold text-success-500">Ready</span>
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
                  <p className="text-label-sm font-label-sm text-text-secondary">SKU: {product.sku} · Qty {line.qty}</p>
                </div>
              </div>
            );
          })}
        </div>

        <p className="mb-2 text-label-md font-label-md font-bold text-graphite-900">Select Delivery Method</p>
        <RadioGroup value={value} onValueChange={(v) => onChange(v as DeliveryMethodId)} className="flex flex-col gap-2">
          {DELIVERY_METHODS.map((method) => (
            <label
              key={method.id}
              htmlFor={`step-delivery-${method.id}`}
              className={cn(
                "flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-4",
                value === method.id ? "border-orange-500 bg-orange-50" : "border-border-default",
              )}
            >
              <div className="flex items-start gap-3">
                <RadioGroupItem value={method.id} id={`step-delivery-${method.id}`} className="mt-1" />
                <div>
                  <p className="text-body-sm font-body-sm font-bold text-text-primary">{method.label}</p>
                  <p className="text-label-sm font-label-sm text-text-secondary">{method.eta}</p>
                </div>
              </div>
              <span className={cn("shrink-0 text-body-sm font-body-sm font-bold", method.price === 0 ? "text-success-500" : "text-text-primary")}>
                {method.price === 0 ? "FREE" : formatPrice(method.price)}
              </span>
            </label>
          ))}
        </RadioGroup>
      </div>

      <div className="rounded-xl border border-border-default bg-surface-white p-5">
        <h2 className="mb-3 flex items-center gap-2 text-body-lg font-body-lg font-bold text-graphite-900">
          <span aria-hidden className="material-symbols-outlined text-[18px] text-orange-600">handyman</span>
          Jobsite Access &amp; Delivery Instructions
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="drop-zone" className="mb-1 block text-label-md font-label-md font-semibold text-graphite-900">Designated Safe Drop Zone</label>
            <select id="drop-zone" defaultValue="loading-bay-3" className="h-10 w-full rounded-md border border-border-default bg-surface-white px-3 text-body-sm font-body-sm">
              <option value="loading-bay-3">Goods In Loading Bay (Bay 3)</option>
              <option value="reception">Site Reception</option>
              <option value="gate">Front Gate / Security Hut</option>
            </select>
          </div>
          <div>
            <label htmlFor="gate-code" className="mb-1 block text-label-md font-label-md font-semibold text-graphite-900">Gate PIN / Keycode &amp; Driver Notes</label>
            <input
              id="gate-code"
              defaultValue="Ring buzzer on arrival"
              className="h-10 w-full rounded-md border border-border-default bg-surface-white px-3 text-body-sm font-body-sm"
            />
          </div>
        </div>
        <label className="mt-4 flex items-start gap-2 rounded-lg bg-orange-50 p-3 text-body-sm font-body-sm text-text-primary">
          <Checkbox checked={forkliftConfirmed} onCheckedChange={(c) => setForkliftConfirmed(Boolean(c))} className="mt-0.5" />
          Forklift / Offload Capability Confirmed: site premises have clear turning access for heavy commercial fleet during the delivery window.
        </label>
      </div>

      <div className="flex items-center justify-between">
        <Button type="button" variant="ghost" onClick={onBack}>
          <span aria-hidden className="material-symbols-outlined text-[18px]">arrow_back</span>
          Return to Address
        </Button>
        <Button className="bg-orange-500 font-label-lg text-label-lg font-bold hover:bg-orange-600" onClick={onContinue}>
          Continue to Payment Method
          <span aria-hidden className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </Button>
      </div>
    </div>
  );
}
