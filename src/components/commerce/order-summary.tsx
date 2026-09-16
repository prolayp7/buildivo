"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/format";
import { COUPONS, DELIVERY_METHODS, FREE_DELIVERY_THRESHOLD, vatAmount } from "@/lib/checkout";
import type { DeliveryMethodId } from "@/types";

interface OrderSummaryProps {
  subtotal: number;
  deliveryMethod: DeliveryMethodId;
  appliedCoupon: string | null;
  onApplyCoupon: (code: string | null) => void;
  primaryCtaLabel: string;
  onPrimaryCta: () => void;
  primaryCtaDisabled?: boolean;
  /** Hide the promo-code input (still shows the applied coupon line). Cart shows its own Vouchers card instead. */
  showCouponInput?: boolean;
  /** Optional secondary action, e.g. "Pay on Account (Net 30)". */
  secondaryCta?: { label: string; onClick: () => void };
  /** Show the trade account banner at the top of the panel. */
  showTradeAccountBadge?: boolean;
  /** Real savings (inc. VAT) from quantity-tier pricing already applied to line items. */
  multiBuySavings?: number;
  /** Show the Apple Pay / G Pay / PayPal row inside the panel. */
  showWalletPay?: boolean;
  /** Show the deliver-to postcode and delivery/collection info rows. */
  showDeliveryInfo?: boolean;
  itemCount?: number;
}

const TOMORROW_LABEL = new Date(Date.now() + 86400000).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

const WALLETS = [
  { id: "apple-pay", label: "Apple Pay", className: "bg-graphite-900 text-text-inverse" },
  { id: "google-pay", label: "G Pay", className: "border border-border-default bg-surface-white text-text-primary" },
  { id: "paypal", label: "PayPal", className: "bg-[#FFC439] text-graphite-900" },
];

export function OrderSummary({
  subtotal,
  deliveryMethod,
  appliedCoupon,
  onApplyCoupon,
  primaryCtaLabel,
  onPrimaryCta,
  primaryCtaDisabled,
  showCouponInput = true,
  secondaryCta,
  showTradeAccountBadge = false,
  multiBuySavings = 0,
  showWalletPay = false,
  showDeliveryInfo = false,
  itemCount,
}: OrderSummaryProps) {
  const [couponInput, setCouponInput] = useState("");
  const delivery = DELIVERY_METHODS.find((d) => d.id === deliveryMethod) ?? DELIVERY_METHODS[0];
  const deliveryFree = delivery.price === 0 || subtotal >= FREE_DELIVERY_THRESHOLD;
  const deliveryCharge = deliveryFree ? 0 : delivery.price;

  const coupon = appliedCoupon ? COUPONS[appliedCoupon] : undefined;
  const couponDiscount = coupon ? (subtotal * coupon.discountPct) / 100 : 0;
  const totalSavings = couponDiscount + multiBuySavings;
  const total = Math.max(0, subtotal - totalSavings + deliveryCharge);
  const savingsPct = subtotal > 0 ? Math.round((totalSavings / subtotal) * 100) : 0;
  const clickCollect = DELIVERY_METHODS.find((d) => d.id === "click-collect");

  function applyCoupon() {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    if (COUPONS[code]) {
      onApplyCoupon(code);
      toast.success(`${COUPONS[code].label}`);
    } else {
      toast.error("That promo code isn't valid.");
    }
    setCouponInput("");
  }

  return (
    <div className="rounded-xl border border-border-default bg-surface-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-body-lg font-body-lg font-bold text-graphite-900">Order Summary</h2>
        {itemCount !== undefined && (
          <span className="rounded-full bg-surface-container-low px-2 py-0.5 text-label-sm font-label-sm text-text-secondary">{itemCount} Items</span>
        )}
      </div>

      {showTradeAccountBadge && (
        <div className="mb-4 flex items-center justify-between rounded-lg bg-graphite-900 p-3 text-text-inverse">
          <span className="flex items-center gap-2">
            <span aria-hidden className="flex h-7 w-7 items-center justify-center rounded-full border border-orange-500 text-orange-500">
              <span className="material-symbols-outlined text-[16px]">verified_user</span>
            </span>
            <span>
              <span className="block text-label-lg font-label-lg font-bold">Apex Mechanical</span>
              <span className="block text-label-sm font-label-sm text-text-inverse-muted">Tier 2 Net 30 Active</span>
            </span>
          </span>
          <span className="rounded bg-graphite-700 px-2 py-1 text-label-sm font-label-sm font-semibold text-orange-400">£12,500 Limit</span>
        </div>
      )}

      <div className="flex flex-col gap-2 text-body-sm font-body-sm">
        <div className="flex justify-between">
          <span className="text-text-secondary">Merchandise Subtotal</span>
          <span className="font-semibold">{formatPrice(subtotal)}</span>
        </div>
        {multiBuySavings > 0 && (
          <div className="flex justify-between">
            <span className="flex items-center gap-1 text-text-secondary">
              <span aria-hidden className="material-symbols-outlined text-[16px] text-success-500">local_offer</span>
              Product Multi-Buy Savings
            </span>
            <span className="font-semibold text-success-500">-{formatPrice(multiBuySavings)}</span>
          </div>
        )}
        {coupon && (
          <div className="flex justify-between">
            <span className="flex items-center gap-1 text-orange-600">
              <span aria-hidden className="material-symbols-outlined text-[16px]">sell</span>
              Coupon ({appliedCoupon})
            </span>
            <span className="font-semibold text-orange-600">-{formatPrice(couponDiscount)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="flex items-center gap-1 text-text-secondary">
            Courier Delivery
            <span aria-hidden className="material-symbols-outlined text-[14px] text-text-disabled">info</span>
          </span>
          <span className={deliveryFree ? "font-semibold text-success-500" : ""}>{deliveryFree ? "FREE" : formatPrice(deliveryCharge)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-secondary">VAT (20% standard included)</span>
          <span>{formatPrice(vatAmount(subtotal))}</span>
        </div>
        <div className="flex justify-between rounded bg-surface-container-low px-2 py-1.5">
          <span className="text-text-secondary">Trade Net Total (ex. VAT)</span>
          <span className="font-semibold">{formatPrice(subtotal - vatAmount(subtotal))}</span>
        </div>
      </div>

      {showCouponInput && (
        <div className="my-3 flex gap-2">
          <Input
            value={couponInput}
            onChange={(e) => setCouponInput(e.target.value)}
            placeholder="Promo or trade code"
            aria-label="Promo or trade code"
            onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
          />
          <Button type="button" variant="outline" onClick={applyCoupon}>
            Apply
          </Button>
        </div>
      )}

      <div className="my-3 flex items-baseline justify-between border-t border-border-default pt-3">
        <span className="text-body-md font-body-md font-semibold text-graphite-900">Total Due</span>
        <div className="text-right">
          <p className="text-headline-md font-headline-md font-bold text-graphite-900">{formatPrice(total)}</p>
          <p className="text-label-sm font-label-sm text-text-secondary">Including VAT &amp; free courier</p>
        </div>
      </div>

      {totalSavings > 0 && (
        <p className="mb-4 flex items-center gap-1 rounded-lg bg-orange-50 px-3 py-2 text-label-sm font-label-sm font-semibold text-orange-700">
          <span aria-hidden className="material-symbols-outlined text-[16px]">sell</span>
          Total Savings Today: {formatPrice(totalSavings)} ({savingsPct}% overall)
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

      {secondaryCta && (
        <Button
          type="button"
          variant="secondary"
          className="mt-2 w-full bg-graphite-900 py-5 font-label-md text-label-md font-bold text-text-inverse hover:bg-graphite-800"
          onClick={secondaryCta.onClick}
        >
          <span aria-hidden className="material-symbols-outlined text-[18px]">credit_card</span>
          {secondaryCta.label}
        </Button>
      )}

      {showWalletPay && (
        <>
          <div className="my-4 flex items-center gap-3">
            <span className="h-px flex-1 bg-border-default" />
            <span className="text-label-sm font-label-sm uppercase tracking-wide text-text-disabled">Or Instant Express Pay</span>
            <span className="h-px flex-1 bg-border-default" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {WALLETS.map((wallet) => (
              <button
                key={wallet.id}
                type="button"
                onClick={() => toast.info(`${wallet.label} isn't wired up in this prototype — use ${primaryCtaLabel}.`)}
                className={`rounded-lg py-2.5 text-label-md font-label-md font-bold ${wallet.className}`}
              >
                {wallet.label}
              </button>
            ))}
          </div>
        </>
      )}

      {showDeliveryInfo && (
        <div className="mt-4 flex flex-col gap-3 border-t border-border-default pt-4">
          <div className="flex items-center justify-between text-label-md font-label-md">
            <span className="flex items-center gap-1.5 text-text-secondary">
              <span aria-hidden className="material-symbols-outlined text-[16px] text-orange-600">near_me</span>
              Deliver to: <span className="font-semibold text-text-primary">SW1A 1AA</span>
            </span>
            <button
              type="button"
              onClick={() => toast.info("Changing your delivery postcode isn't wired up in this prototype.")}
              className="text-label-sm font-label-sm font-semibold text-orange-600 hover:underline"
            >
              Change Postcode
            </button>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-surface-container-low p-3">
            <span className="flex items-center gap-2">
              <span aria-hidden className="material-symbols-outlined text-[18px] text-graphite-600">local_shipping</span>
              <span>
                <span className="block text-label-md font-label-md font-semibold text-text-primary">Courier: Tomorrow, {TOMORROW_LABEL}</span>
                <span className="block text-label-sm font-label-sm text-text-secondary">Tracked DPD / Tuffnells</span>
              </span>
            </span>
            <span className="text-label-md font-label-md font-bold text-success-500">FREE</span>
          </div>
          {clickCollect && (
            <div className="flex items-center justify-between rounded-lg bg-surface-container-low p-3">
              <span className="flex items-center gap-2">
                <span aria-hidden className="material-symbols-outlined text-[18px] text-graphite-600">storefront</span>
                <span>
                  <span className="block text-label-md font-label-md font-semibold text-text-primary">Click &amp; Collect: In 30 Mins</span>
                  <span className="block text-label-sm font-label-sm text-text-secondary">Central London Trade Depot</span>
                </span>
              </span>
              <span className="text-label-md font-label-md font-bold text-success-500">FREE</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
