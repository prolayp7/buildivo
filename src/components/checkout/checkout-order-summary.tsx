"use client";

import { useState } from "react";
import { ProductImage } from "@/components/commerce/product-image";
import { formatPrice } from "@/lib/format";
import { COUPONS, vatAmount } from "@/lib/checkout";
import { lineProduct, lineUnitPrice, useCartTotals } from "@/lib/cart-store";
import { cn } from "@/lib/utils";

interface CheckoutOrderSummaryProps {
  appliedCoupon?: string | null;
  showItems?: boolean;
  className?: string;
}

export function CheckoutOrderSummary({ appliedCoupon = "BUILD10", showItems = true, className }: CheckoutOrderSummaryProps) {
  const { activeLines, subtotal } = useCartTotals();
  const [mobileOpen, setMobileOpen] = useState(false);
  const coupon = appliedCoupon ? COUPONS[appliedCoupon] : undefined;
  const discount = coupon ? (subtotal * coupon.discountPct) / 100 : 0;
  const total = Math.max(0, subtotal - discount);
  const itemCount = activeLines.reduce((n, l) => n + l.qty, 0);

  return (
    <div className={cn("rounded-xl border border-border-default bg-surface-white", className)}>
      <button
        type="button"
        onClick={() => setMobileOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 p-4 lg:hidden"
        aria-expanded={mobileOpen}
      >
        <span className="flex items-center gap-2 text-body-sm font-body-sm font-semibold text-text-primary">
          <span aria-hidden className="material-symbols-outlined text-[18px] text-orange-600">
            shopping_bag
          </span>
          Order Summary ({itemCount})
        </span>
        <span className="flex items-center gap-2">
          <span className="text-body-md font-body-md font-bold text-orange-600">{formatPrice(total)}</span>
          <span aria-hidden className="material-symbols-outlined text-[18px]">
            {mobileOpen ? "expand_less" : "expand_more"}
          </span>
        </span>
      </button>

      <div className={cn("flex-col gap-4 p-5 lg:flex", mobileOpen ? "flex" : "hidden")}>
        <div className="hidden items-center justify-between lg:flex">
          <h2 className="text-body-lg font-body-lg font-bold text-graphite-900">Order Summary</h2>
          <span className="rounded-full bg-surface-container-low px-2 py-0.5 text-label-sm font-label-sm text-text-secondary">{itemCount} Items</span>
        </div>

        {showItems && (
          <ul className="flex flex-col gap-3 border-b border-border-default pb-4">
            {activeLines.map((line) => {
              const product = lineProduct(line);
              if (!product) return null;
              return (
                <li key={`${line.productId}-${line.variantId ?? "base"}`} className="flex items-center gap-3">
                  <ProductImage categorySlug={product.categorySlug} className="h-12 w-12 shrink-0 rounded-lg" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-label-lg font-label-lg font-semibold text-text-primary">{product.name}</p>
                    <p className="text-label-sm font-label-sm text-text-secondary">Qty: {line.qty} · In Stock</p>
                  </div>
                  <p className="shrink-0 text-label-lg font-label-lg font-semibold text-text-primary">{formatPrice(lineUnitPrice(line) * line.qty)}</p>
                </li>
              );
            })}
          </ul>
        )}

        {coupon && (
          <div className="flex items-center justify-between rounded-lg bg-orange-50 px-3 py-2 text-label-sm font-label-sm text-orange-700">
            <span className="flex items-center gap-1 font-semibold">
              <span aria-hidden className="material-symbols-outlined text-[16px]">sell</span>
              {appliedCoupon} ({coupon.discountPct}% Trade Promo)
            </span>
            <span>-{formatPrice(discount)}</span>
          </div>
        )}

        <div className="flex flex-col gap-1.5 text-body-sm font-body-sm">
          <div className="flex justify-between">
            <span className="text-text-secondary">Merchandise Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Courier Next-Day Dispatch</span>
            <span className="font-semibold text-success-500">FREE</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">VAT (20% Included)</span>
            <span>{formatPrice(vatAmount(total))}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Trade Net Total (ex. VAT)</span>
            <span>{formatPrice(total - vatAmount(total))}</span>
          </div>
        </div>

        <div className="rounded-lg bg-graphite-900 p-4 text-text-inverse">
          <p className="text-label-sm font-label-sm uppercase tracking-wide text-text-inverse-muted">Total Payable Now</p>
          <div className="flex items-baseline justify-between">
            <p className="text-label-sm font-label-sm text-text-inverse-muted">Includes all applicable UK VAT</p>
            <p className="text-headline-lg font-headline-lg font-bold text-orange-500">{formatPrice(total)}</p>
          </div>
        </div>

        {coupon && (
          <p className="flex items-center gap-1 rounded-lg bg-success-100 px-3 py-2 text-label-sm font-label-sm font-semibold text-success-500">
            <span aria-hidden className="material-symbols-outlined text-[16px]">savings</span>
            You save {formatPrice(discount)} on this industrial order
          </p>
        )}

        <ul className="flex flex-col gap-1.5 text-label-sm font-label-sm text-text-secondary">
          <li className="flex items-center gap-1.5">
            <span aria-hidden className="material-symbols-outlined text-[14px] text-success-500">verified_user</span>
            100% Authorized UK Dealer Warranty Included
          </li>
          <li className="flex items-center gap-1.5">
            <span aria-hidden className="material-symbols-outlined text-[14px] text-success-500">local_shipping</span>
            Tracked DPD / FedEx Priority Freight Dispatch
          </li>
          <li className="flex items-center gap-1.5">
            <span aria-hidden className="material-symbols-outlined text-[14px] text-success-500">description</span>
            Instant Automated HMRC VAT Receipt Download
          </li>
        </ul>
      </div>
    </div>
  );
}
