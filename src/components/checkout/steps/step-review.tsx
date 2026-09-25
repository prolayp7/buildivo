"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ProductImage } from "@/components/commerce/product-image";
import { deliveryEstimate } from "@/lib/checkout";
import type { ShippingQuote } from "@/lib/storefront-client";
import { formatPrice } from "@/lib/format";
import { lineProduct, lineUnitPrice, useCartTotals } from "@/lib/cart-store";
import type { Address } from "@/types";
import type { PaymentMethodId } from "@/components/checkout/steps/step-payment";
import Link from "next/link";

const PAYMENT_LABEL: Record<PaymentMethodId, string> = {
  stripe: "Credit / Debit Card (Stripe)",
  paypal: "PayPal",
};

interface StepReviewProps {
  email: string;
  address: Address;
  shipping: ShippingQuote;
  /** Delivery charge after any free-delivery coupon. */
  deliveryCharge: number;
  paymentMethod: PaymentMethodId;
  total: number;
  onEdit: (step: 1 | 2 | 3 | 4) => void;
  onPlaceOrder: () => void;
  onBack: () => void;
  placing?: boolean;
}

function SectionCard({
  icon,
  title,
  onEdit,
  children,
}: {
  icon: string;
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border-default bg-surface-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-body-md font-body-md font-bold text-graphite-900">
          <span aria-hidden className="material-symbols-outlined text-[18px] text-orange-600">{icon}</span>
          {title}
        </h2>
        <button type="button" onClick={onEdit} className="flex items-center gap-1 text-label-sm font-label-sm font-semibold text-orange-600 hover:underline">
          <span aria-hidden className="material-symbols-outlined text-[14px]">edit</span>
          Edit
        </button>
      </div>
      {children}
    </div>
  );
}

export function StepReview({ email, address, shipping, deliveryCharge, paymentMethod, total, onEdit, onPlaceOrder, onBack, placing }: StepReviewProps) {
  const [consent, setConsent] = useState(false);
  const { activeLines } = useCartTotals();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-1 text-label-sm font-label-sm font-semibold uppercase tracking-wide text-orange-600">Order Validation · Transaction Pre-Commit</p>
        <h1 className="text-headline-lg-mobile font-headline-lg-mobile font-bold text-graphite-900 sm:text-headline-lg sm:font-headline-lg">
          Review and Place Your Order
        </h1>
        <p className="mt-1 text-body-md font-body-md text-text-secondary">Please check your details carefully before committing your order. You can edit any section below.</p>
      </div>

      <SectionCard icon="badge" title="Contact & Identity" onEdit={() => onEdit(1)}>
        <p className="text-body-sm font-body-sm font-bold text-text-primary">{address.fullName}</p>
        <p className="text-label-sm font-label-sm text-text-secondary">{email || "guest checkout"}</p>
        <p className="text-label-sm font-label-sm text-text-secondary">Mobile: {address.phone}</p>
      </SectionCard>

      <SectionCard icon="location_on" title="Delivery Address" onEdit={() => onEdit(2)}>
        <p className="text-body-sm font-body-sm font-bold text-text-primary">{address.line1}</p>
        <p className="text-label-sm font-label-sm text-text-secondary">
          {address.line2 ? `${address.line2}, ` : ""}
          {address.city}, {address.postcode}, United Kingdom
        </p>
      </SectionCard>

      <SectionCard icon="local_shipping" title="Delivery Method & Schedule" onEdit={() => onEdit(3)}>
        <div className="flex items-center justify-between rounded-lg bg-surface-container-low p-3">
          <div>
            <p className="text-body-sm font-body-sm font-semibold text-text-primary">{shipping.title}</p>
            <p className="text-label-sm font-label-sm text-text-secondary">{shipping.carrier} · {deliveryEstimate(shipping)}</p>
          </div>
          <span className={deliveryCharge === 0 ? "text-label-sm font-label-sm font-bold text-success-500" : "text-label-sm font-label-sm font-bold text-text-primary"}>{deliveryCharge === 0 ? "FREE" : formatPrice(deliveryCharge)}</span>
        </div>
      </SectionCard>

      <SectionCard icon="credit_card" title="Payment Instrument" onEdit={() => onEdit(4)}>
        <p className="text-body-sm font-body-sm font-bold text-text-primary">{PAYMENT_LABEL[paymentMethod]}</p>
        <p className="text-label-sm font-label-sm text-text-secondary">Billing address same as delivery address</p>
      </SectionCard>

      <div className="rounded-xl border border-border-default bg-surface-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-body-md font-body-md font-bold text-graphite-900">
            <span aria-hidden className="material-symbols-outlined text-[18px] text-orange-600">inventory_2</span>
            Detailed Items in Order ({activeLines.length})
          </h2>
          <span className="rounded-full bg-success-100 px-2 py-0.5 text-label-sm font-label-sm font-semibold text-success-500">All Verified In Stock</span>
        </div>
        <ul className="flex flex-col gap-3">
          {activeLines.map((line) => {
            const product = lineProduct(line);
            if (!product) return null;
            return (
              <li key={`${line.productId}-${line.variantId ?? "base"}`} className="flex items-center gap-3 border-b border-border-default pb-3 last:border-0 last:pb-0">
                <ProductImage categorySlug={product.categorySlug} className="h-12 w-12 shrink-0 rounded-lg" />
                <div className="min-w-0 flex-1">
                  <p className="text-label-sm font-label-sm text-text-secondary">{product.brand} · SKU: {product.sku}</p>
                  <p className="truncate text-body-sm font-body-sm font-semibold text-text-primary">{product.name}</p>
                  <p className="text-label-sm font-label-sm text-text-secondary">Qty: {line.qty}</p>
                </div>
                <p className="shrink-0 text-body-sm font-body-sm font-bold text-graphite-900">{formatPrice(lineUnitPrice(line) * line.qty)}</p>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="rounded-xl border border-border-default bg-surface-white p-5">
        <label className="flex items-start gap-2 text-body-sm font-body-sm text-text-primary">
          <Checkbox checked={consent} onCheckedChange={(c) => setConsent(Boolean(c))} className="mt-0.5" />
          <span>
            I agree to the{" "}
            <Link href="/help" className="text-orange-600 hover:underline">
              Buildivo Terms of Trading
            </Link>
            ,{" "}
            <Link href="/help" className="text-orange-600 hover:underline">
              Conditions of Sale
            </Link>{" "}
            and{" "}
            <Link href="/help" className="text-orange-600 hover:underline">
              Returns &amp; Restocking Policy
            </Link>
            .
          </span>
        </label>
        <p className="mt-3 flex items-start gap-1.5 rounded-lg bg-surface-container-low p-3 text-label-sm font-label-sm text-text-secondary">
          <span aria-hidden className="material-symbols-outlined text-[16px]">info</span>
          Clicking &quot;Place Order &amp; Pay&quot; creates a legally binding contract of sale. Total due:{" "}
          <span className="font-semibold text-text-primary">{formatPrice(total)}</span>.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <Button type="button" variant="ghost" onClick={onBack}>
          <span aria-hidden className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Payment Method
        </Button>
        <Button
          className="bg-orange-500 font-label-lg text-label-lg font-bold hover:bg-orange-600"
          disabled={!consent || placing}
          onClick={onPlaceOrder}
        >
          <span aria-hidden className="material-symbols-outlined text-[18px]">lock</span>
          {placing ? "Placing Order…" : `Place Order & Pay — ${formatPrice(total)}`}
        </Button>
      </div>
    </div>
  );
}
