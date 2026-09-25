"use client";

import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { vatAmount } from "@/lib/checkout";

interface OrderSummaryProps {
  /** VAT-inclusive merchandise total from the cart (quantity/bundle pricing already applied). */
  subtotal: number;
  /** Money off from the applied coupon (0 when none, or when the coupon is free delivery). */
  discount: number;
  couponCode?: string | null;
  freeDeliveryCoupon?: boolean;
  /** Quantity-pricing savings already inside `subtotal` - shown for information, never subtracted again. */
  multiBuySavings?: number;
  primaryCtaLabel: string;
  onPrimaryCta: () => void;
  primaryCtaDisabled?: boolean;
  itemCount?: number;
}

// Delivery is chosen (and priced) at checkout, so this panel shows the total before delivery.
export function OrderSummary({ subtotal, discount, couponCode, freeDeliveryCoupon = false, multiBuySavings = 0, primaryCtaLabel, onPrimaryCta, primaryCtaDisabled, itemCount }: OrderSummaryProps) {
  const total = Math.max(0, Math.round((subtotal - discount) * 100) / 100);
  const vat = vatAmount(total);

  return (
    <div className="rounded-xl border border-border-default bg-surface-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-body-lg font-body-lg font-bold text-graphite-900">Order Summary</h2>
        {itemCount !== undefined && (
          <span className="rounded-full bg-surface-container-low px-2 py-0.5 text-label-sm font-label-sm text-text-secondary">{itemCount} Items</span>
        )}
      </div>

      <div className="flex flex-col gap-2 text-body-sm font-body-sm">
        <div className="flex justify-between">
          <span className="text-text-secondary">Merchandise Subtotal</span>
          <span className="font-semibold">{formatPrice(subtotal)}</span>
        </div>
        {couponCode && (
          <div className="flex justify-between">
            <span className="flex items-center gap-1 text-orange-600">
              <span aria-hidden className="material-symbols-outlined text-[16px]">sell</span>
              Coupon ({couponCode})
            </span>
            <span className="font-semibold text-orange-600">{freeDeliveryCoupon ? "Free delivery" : `-${formatPrice(discount)}`}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-text-secondary">Delivery</span>
          <span className="text-text-secondary">{freeDeliveryCoupon ? "FREE" : "Calculated at checkout"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-secondary">VAT included in prices</span>
          <span>{formatPrice(vat)}</span>
        </div>
        <div className="flex justify-between rounded bg-surface-container-low px-2 py-1.5">
          <span className="text-text-secondary">Total excluding VAT</span>
          <span className="font-semibold">{formatPrice(total - vat)}</span>
        </div>
      </div>

      <div className="my-3 flex items-baseline justify-between border-t border-border-default pt-3">
        <span className="text-body-md font-body-md font-semibold text-graphite-900">Total (before delivery)</span>
        <div className="text-right">
          <p className="text-headline-md font-headline-md font-bold text-graphite-900">{formatPrice(total)}</p>
          <p className="text-label-sm font-label-sm text-text-secondary">Including VAT</p>
        </div>
      </div>

      {(discount > 0 || multiBuySavings > 0) && (
        <p className="mb-4 flex items-center gap-1 rounded-lg bg-orange-50 px-3 py-2 text-label-sm font-label-sm font-semibold text-orange-700">
          <span aria-hidden className="material-symbols-outlined text-[16px]">sell</span>
          You&apos;re saving {formatPrice(discount + multiBuySavings)}{multiBuySavings > 0 && discount === 0 ? " with quantity pricing" : ""}
        </p>
      )}

      <Button
        type="button"
        className="w-full bg-orange-500 py-6 font-label-lg text-label-lg font-bold text-text-inverse hover:bg-orange-600"
        onClick={onPrimaryCta}
        disabled={primaryCtaDisabled}
      >
        <span aria-hidden className="material-symbols-outlined text-[18px]">lock</span>
        {primaryCtaLabel}
      </Button>
    </div>
  );
}
