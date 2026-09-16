"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductImage } from "@/components/commerce/product-image";
import { QuantityInput } from "@/components/commerce/quantity-input";
import { Price } from "@/components/commerce/price";
import { StockBadge } from "@/components/commerce/stock-badge";
import { OrderSummary } from "@/components/commerce/order-summary";
import { FreeDeliveryProgress } from "@/components/commerce/free-delivery-progress";
import { DeliveryMethodSelector } from "@/components/checkout/delivery-method-selector";
import { COUPONS } from "@/lib/checkout";
import { lineProduct, lineUnitPrice, useCartStore, useCartTotals } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";
import type { DeliveryMethodId } from "@/types";

const TRUST_STRIP = [
  { icon: "lock", label: "256-Bit SSL Encrypted Checkout" },
  { icon: "cached", label: "30-Day Returns Policy" },
  { icon: "workspace_premium", label: "Official Manufacturer Warranty" },
  { icon: "local_shipping", label: "Free Next-Day Orders Over £75" },
  { icon: "support_agent", label: "Trade Desk 0800 456 7890" },
];

export default function CartPage() {
  const { activeLines, savedLines, subtotal, multiBuySavings } = useCartTotals();
  const setQty = useCartStore((s) => s.setQty);
  const removeItem = useCartStore((s) => s.removeItem);
  const toggleSaveForLater = useCartStore((s) => s.toggleSaveForLater);
  const clear = useCartStore((s) => s.clear);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethodId>("standard");
  const [coupon, setCoupon] = useState<string | null>(null);
  const [voucherInput, setVoucherInput] = useState("");
  const router = useRouter();

  function applyVoucher() {
    const code = voucherInput.trim().toUpperCase();
    if (!code) return;
    if (COUPONS[code]) {
      setCoupon(code);
      toast.success(COUPONS[code].label);
    } else {
      toast.error("That promo or trade code isn't valid.");
    }
    setVoucherInput("");
  }

  if (activeLines.length === 0 && savedLines.length === 0) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-24 text-center">
        <span aria-hidden className="material-symbols-outlined text-[56px] text-graphite-200">shopping_bag</span>
        <h1 className="text-headline-md font-headline-md font-bold text-graphite-900">Your cart is empty</h1>
        <p className="text-body-md font-body-md text-text-secondary">Browse our departments to find the tools and materials for your next job.</p>
        <Button asChild className="bg-orange-500 hover:bg-orange-600">
          <Link href="/">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-margin-desktop">
      <div className="mb-1 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-headline-lg-mobile font-headline-lg-mobile font-bold text-graphite-900 sm:text-headline-lg sm:font-headline-lg">
            Your Cart
          </h1>
          <span className="rounded-full bg-orange-100 px-2 py-0.5 text-label-sm font-label-sm font-bold text-orange-700">
            {activeLines.reduce((n, l) => n + l.qty, 0)} Items
          </span>
        </div>
        <Link href="/" className="flex items-center gap-1 text-label-md font-label-md font-semibold text-orange-600 hover:underline">
          <span aria-hidden className="material-symbols-outlined text-[16px]">arrow_back</span>
          Continue Shopping
        </Link>
      </div>
      <p className="mb-4 flex items-center gap-1.5 text-label-sm font-label-sm text-text-secondary">
        <span aria-hidden className="material-symbols-outlined text-[14px]">cloud_done</span>
        Auto-saved to your account · Apex Mechanical · Synced just now
      </p>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          {activeLines.length > 0 && (
            <div className="mb-4">
              <FreeDeliveryProgress subtotal={subtotal} />
            </div>
          )}

          <div className="mb-4 flex items-center justify-between">
            <p className="text-body-sm font-body-sm text-text-secondary">
              <span className="font-bold text-text-primary">{activeLines.reduce((n, l) => n + l.qty, 0)}</span> items
            </p>
            {activeLines.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  clear();
                  toast.success("Cart cleared");
                }}
                className="text-label-sm font-label-sm text-error-500 hover:underline"
              >
                Clear All
              </button>
            )}
          </div>

          <ul className="flex flex-col gap-4">
            {activeLines.map((line) => {
              const product = lineProduct(line);
              if (!product) return null;
              return (
                <li key={`${line.productId}-${line.variantId ?? "base"}`} className="flex flex-col gap-3 rounded-xl border border-border-default bg-surface-white p-4">
                  <div className="flex gap-4">
                    <div className="relative shrink-0">
                      {product.badges?.[0] && (
                        <span className="absolute -left-1 -top-1 z-10 rounded bg-graphite-900 px-1.5 py-0.5 text-label-sm font-label-sm font-semibold text-text-inverse">
                          {product.badges[0]}
                        </span>
                      )}
                      <ProductImage src={product.image} categorySlug={product.categorySlug} className="h-24 w-24 shrink-0 rounded-lg object-cover object-center" />
                    </div>
                    <div className="flex flex-1 flex-col gap-1">
                      <p className="text-label-sm font-label-sm text-text-secondary">
                        {product.brand} · SKU: {product.sku}
                      </p>
                      <Link href={`/p/${product.slug}`} className="text-body-sm font-body-sm font-bold text-text-primary hover:underline">
                        {product.name}
                      </Link>
                      {(() => {
                        const variant = product.variants?.find((v) => v.id === line.variantId);
                        if (!variant) return null;
                        return (
                          <p className="text-label-sm font-label-sm text-text-secondary">
                            Variant: {variant.label} ·{" "}
                            <Link href={`/p/${product.slug}`} className="font-semibold text-orange-600 hover:underline">
                              Edit Variant
                            </Link>
                          </p>
                        );
                      })()}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <StockBadge status={product.stock} count={product.stockCount} />
                        <span className="text-label-sm font-label-sm text-text-secondary">{product.deliveryEta}</span>
                      </div>
                      {product.tradePriceIncVat && (
                        <p className="text-label-sm font-label-sm text-graphite-600">
                          Trade price: <span className="font-semibold">{formatPrice(product.tradePriceIncVat)} ea.</span>
                        </p>
                      )}
                    </div>
                    <div className="shrink-0 text-right">
                      <Price priceIncVat={lineUnitPrice(line) * line.qty} compareAtIncVat={product.compareAtIncVat ? product.compareAtIncVat * line.qty : undefined} vatRate={product.vatRate} size="sm" />
                      {product.compareAtIncVat && (
                        <p className="text-label-sm font-label-sm font-semibold text-error-500">
                          -{Math.round((1 - product.priceIncVat / product.compareAtIncVat) * 100)}%
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <QuantityInput value={line.qty} onChange={(qty) => setQty(line.productId, qty, line.variantId)} label={product.name} />
                    <div className="ml-auto flex flex-wrap items-center gap-3">
                      <span className="flex items-center gap-1 text-label-sm font-label-sm text-text-secondary">
                        <span aria-hidden className="material-symbols-outlined text-[16px]">local_shipping</span>
                        Standard Next-Day Courier
                      </span>
                      <button type="button" onClick={() => toggleSaveForLater(line.productId, line.variantId)} className="flex items-center gap-1 text-label-sm font-label-sm text-text-secondary hover:text-text-primary">
                        <span aria-hidden className="material-symbols-outlined text-[16px]">bookmark</span>
                        Save for Later
                      </button>
                      <button type="button" onClick={() => removeItem(line.productId, line.variantId)} className="flex items-center gap-1 text-label-sm font-label-sm text-error-500 hover:underline">
                        <span aria-hidden className="material-symbols-outlined text-[16px]">delete</span>
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {activeLines.length > 0 && (
            <div className="mt-8 rounded-xl border border-border-default bg-surface-white p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-body-lg font-body-lg font-bold text-graphite-900">Vouchers, Trade Discounts &amp; Offers</h2>
              </div>
              {coupon && COUPONS[coupon] ? (
                <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-success-500/40 bg-success-100 px-3 py-1 text-label-sm font-label-sm font-semibold text-success-500">
                  <span aria-hidden className="material-symbols-outlined text-[16px]">check_circle</span>
                  {coupon}
                  <button type="button" onClick={() => setCoupon(null)} aria-label="Remove voucher">
                    <span aria-hidden className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                </span>
              ) : (
                <p className="mb-3 text-label-sm font-label-sm text-text-secondary">No vouchers or trade discounts applied yet.</p>
              )}
              <div className="flex gap-2">
                <Input
                  value={voucherInput}
                  onChange={(e) => setVoucherInput(e.target.value)}
                  placeholder="Have another promo code or trade voucher?"
                  aria-label="Promo code or trade voucher"
                  onKeyDown={(e) => e.key === "Enter" && applyVoucher()}
                />
                <Button type="button" variant="outline" onClick={applyVoucher}>
                  Apply
                </Button>
              </div>
            </div>
          )}

          {savedLines.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-3 text-body-lg font-body-lg font-bold text-graphite-900">Saved for Later ({savedLines.length})</h2>
              <ul className="flex flex-col gap-3">
                {savedLines.map((line) => {
                  const product = lineProduct(line);
                  if (!product) return null;
                  return (
                    <li key={`${line.productId}-saved`} className="flex items-center gap-4 rounded-xl border border-dashed border-border-default p-3">
                      <ProductImage src={product.image} categorySlug={product.categorySlug} className="h-14 w-14 shrink-0 rounded-lg object-cover object-center" />
                      <div className="flex-1">
                        <p className="text-body-sm font-body-sm font-semibold text-text-primary">{product.name}</p>
                        <p className="text-label-sm font-label-sm text-text-secondary">{formatPrice(lineUnitPrice(line))}</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => toggleSaveForLater(line.productId, line.variantId)}>
                        Move to Cart
                      </Button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div className="mt-8 rounded-xl border border-border-default bg-surface-white p-5">
            <h2 className="mb-3 text-body-lg font-body-lg font-bold text-graphite-900">Delivery &amp; Fulfilment Options</h2>
            <DeliveryMethodSelector value={deliveryMethod} onChange={setDeliveryMethod} />
          </div>

          {activeLines.length > 0 && (
            <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-xl border border-graphite-700 bg-graphite-900 p-5 text-text-inverse sm:flex-row sm:items-center">
              <div>
                <p className="mb-1 flex items-center gap-1.5 text-label-sm font-label-sm font-semibold uppercase tracking-wide text-orange-500">
                  <span aria-hidden className="material-symbols-outlined text-[16px]">request_quote</span>
                  Trade Tender &amp; Site Procurement
                </p>
                <p className="text-body-sm font-body-sm font-bold">Ordering in Bulk or Specifying a Jobsite Tender?</p>
                <p className="text-label-sm font-label-sm text-text-inverse-muted">Transfer every item into a formal RFQ tender, locked in for 30 days with dedicated commercial trade assignment.</p>
              </div>
              <Button
                className="shrink-0 bg-orange-500 font-label-lg text-label-lg font-bold hover:bg-orange-600"
                onClick={() => toast.info("RFQ tender conversion isn't wired up in this prototype — call the Trade Desk to arrange one.")}
              >
                Convert Cart to RFQ
                <span aria-hidden className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Button>
            </div>
          )}

          <div className="mt-8 grid grid-cols-2 gap-3 rounded-xl border border-border-default bg-surface-white p-4 sm:grid-cols-5">
            {TRUST_STRIP.map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-1 text-center">
                <span aria-hidden className="material-symbols-outlined text-[20px] text-orange-600">{item.icon}</span>
                <p className="text-label-sm font-label-sm text-text-secondary">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:sticky lg:top-[172px]">
          <OrderSummary
            subtotal={subtotal}
            deliveryMethod={deliveryMethod}
            appliedCoupon={coupon}
            onApplyCoupon={setCoupon}
            showCouponInput={false}
            showTradeAccountBadge
            multiBuySavings={multiBuySavings}
            showWalletPay
            showDeliveryInfo
            itemCount={activeLines.reduce((n, l) => n + l.qty, 0)}
            primaryCtaLabel="Proceed to Secure Checkout"
            primaryCtaDisabled={activeLines.length === 0}
            onPrimaryCta={() => router.push("/checkout")}
            secondaryCta={{
              label: "Pay on Account (Net 30) · Trade Invoice",
              onClick: () => toast.info("Net 30 account checkout requires a verified Trade sign-in — use Proceed to Secure Checkout for now."),
            }}
          />
          <div className="flex items-start gap-3 rounded-xl border border-border-default bg-surface-white p-4">
            <span aria-hidden className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success-100 text-success-500">
              <span className="material-symbols-outlined text-[18px]">verified</span>
            </span>
            <div>
              <p className="text-label-lg font-label-lg font-bold text-graphite-900">PCI-DSS Level 1 Compliant</p>
              <p className="text-label-sm font-label-sm text-text-secondary">Your card and account details are tokenized with financial-grade security.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
