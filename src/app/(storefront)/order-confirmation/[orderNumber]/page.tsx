"use client";

import { use, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductImage } from "@/components/commerce/product-image";
import { formatPrice } from "@/lib/format";
import { useCartStore } from "@/lib/cart-store";
import { toast } from "sonner";

interface OrderConfirmationPageProps {
  params: Promise<{ orderNumber: string }>;
}

export default function OrderConfirmationPage({ params }: OrderConfirmationPageProps) {
  const { orderNumber } = use(params);
  const lastOrder = useCartStore((s) => s.lastOrder);
  const [password, setPassword] = useState("");
  const [activated, setActivated] = useState(false);

  const items = lastOrder?.orderNumber === orderNumber ? lastOrder.items : [];
  const subtotal = lastOrder?.orderNumber === orderNumber ? lastOrder.subtotal : 0;
  const vat = lastOrder?.orderNumber === orderNumber ? lastOrder.vatTotal : 0;
  const total = lastOrder?.orderNumber === orderNumber ? lastOrder.total : 0;

  if (!lastOrder || lastOrder.orderNumber !== orderNumber) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-24 text-center">
        <span aria-hidden className="material-symbols-outlined text-[56px] text-success-500">
          check_circle
        </span>
        <h1 className="text-headline-md font-headline-md font-bold text-graphite-900">Order {orderNumber} confirmed</h1>
        <p className="text-body-md font-body-md text-text-secondary">
          The itemized receipt for this order is no longer available in this session. A confirmation email was sent when it was placed.
        </p>
        <Button asChild className="bg-orange-500 hover:bg-orange-600">
          <Link href="/">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-margin-desktop">
      <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1 text-label-sm font-label-sm text-text-secondary">
        <span>Trade Depot</span>
        <span aria-hidden>/</span>
        <span>Secure Checkout</span>
        <span aria-hidden>/</span>
        <span className="flex items-center gap-1 font-semibold text-success-500">
          <span aria-hidden className="material-symbols-outlined text-[14px]">check_circle</span>
          Confirmation
        </span>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-6">
          <div className="rounded-xl border border-success-500/30 bg-surface-white p-6">
            <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-success-500 text-text-inverse">
              <span aria-hidden className="material-symbols-outlined text-[24px]">check</span>
            </span>
            <p className="mb-1 text-label-sm font-label-sm font-semibold uppercase tracking-wide text-success-500">Payment Processed &amp; Allocated</p>
            <h1 className="mb-1 text-headline-lg-mobile font-headline-lg-mobile font-bold text-graphite-900 sm:text-headline-lg sm:font-headline-lg">
              Thank you — your order is confirmed!
            </h1>
            <p className="mb-4 text-body-sm font-body-sm text-text-secondary">
              Order Reference: <span className="font-mono font-semibold text-text-primary">{orderNumber}</span>
            </p>
            <p className="text-body-sm font-body-sm text-text-secondary">
              A confirmation email with your digital VAT receipt, serial logs and carrier dispatch links has been sent to your registered inbox.
            </p>
          </div>

          <div className="rounded-xl border border-border-default bg-surface-white p-6">
            <p className="mb-1 text-label-sm font-label-sm font-semibold uppercase tracking-wide text-orange-600">Fulfilment Architecture</p>
            <h2 className="mb-4 text-body-lg font-body-lg font-bold text-graphite-900">Shipment &amp; Logistics Breakdown</h2>
            <div className="rounded-lg border border-border-default p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-body-sm font-body-sm font-bold text-text-primary">Consignment 1 of 1: Full Order</p>
                <span className="rounded-full bg-orange-100 px-2 py-0.5 text-label-sm font-label-sm font-semibold text-orange-700">Processing at Central Depot</span>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {items.map((item, index) => (
                  <div key={`${item.title}-${index}`} className="flex items-center gap-2 rounded-lg bg-surface-container-low p-2">
                    <ProductImage categorySlug="" className="h-9 w-9 shrink-0 rounded" />
                    <div className="min-w-0">
                      <p className="truncate text-label-sm font-label-sm font-semibold text-text-primary">{item.title}</p>
                      <p className="text-label-sm font-label-sm text-text-secondary">Qty {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border-default bg-surface-white p-6">
            <p className="mb-1 text-label-sm font-label-sm font-semibold uppercase tracking-wide text-text-disabled">Audited Ledger</p>
            <h2 className="mb-4 text-body-lg font-body-lg font-bold text-graphite-900">Itemized Financial Recap</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-body-sm font-body-sm">
                <thead className="text-label-sm font-label-sm uppercase tracking-wide text-text-disabled">
                  <tr className="border-b border-border-default">
                    <th className="py-2 text-left font-semibold">Product</th>
                    <th className="py-2 text-right font-semibold">Qty</th>
                    <th className="py-2 text-right font-semibold">Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={`${item.title}-${index}`} className="border-b border-border-default">
                      <td className="py-2 pr-2">{item.title}{item.variantTitle ? ` — ${item.variantTitle}` : ""}</td>
                      <td className="py-2 text-right">{item.quantity}</td>
                      <td className="py-2 text-right font-semibold">{formatPrice(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex flex-col gap-1 border-t border-border-default pt-3 text-body-sm font-body-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Merchandise Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">UK Standard VAT</span>
                <span>{formatPrice(vat)}</span>
              </div>
              <div className="flex justify-between text-body-md font-body-md font-bold text-graphite-900">
                <span>Total Paid</span>
                <span className="text-orange-600">{formatPrice(total)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-graphite-700 bg-graphite-900 p-6 text-text-inverse">
            <p className="mb-1 text-label-sm font-label-sm font-semibold uppercase tracking-wide text-orange-500">Pro Contractor Portal Fast-Track</p>
            <h2 className="mb-1 text-body-lg font-body-lg font-bold">Create a password to activate your Buildivo Pro Portal</h2>
            <p className="mb-4 text-body-sm font-body-sm text-text-inverse-muted">
              Retain automated warranty claims, schedule Net-30 invoicing, and sync this purchase to your crew&apos;s live tool register.
            </p>
            {activated ? (
              <p className="flex items-center gap-2 text-body-sm font-body-sm font-semibold text-success-500">
                <span aria-hidden className="material-symbols-outlined text-[18px]">check_circle</span>
                Trade portal activated — sign in any time with this password.
              </p>
            ) : (
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  type="password"
                  placeholder="Min. 8 characters with numbers"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-graphite-800 text-text-inverse"
                />
                <Button
                  className="shrink-0 bg-orange-500 font-label-lg text-label-lg font-bold hover:bg-orange-600"
                  disabled={password.length < 8}
                  onClick={() => {
                    setActivated(true);
                    toast.success("Trade portal activated");
                  }}
                >
                  Save &amp; Activate
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-border-default bg-surface-white p-5">
            <p className="mb-3 text-label-sm font-label-sm font-semibold uppercase tracking-wide text-orange-600">Instant Operations</p>
            <h2 className="mb-3 text-body-md font-body-md font-bold text-graphite-900">Quick Action Tools</h2>
            <div className="flex flex-col gap-2">
              <Button asChild className="w-full bg-orange-500 font-label-md text-label-md font-bold hover:bg-orange-600">
                <Link href="/track-order">
                  <span aria-hidden className="material-symbols-outlined text-[18px]">near_me</span>
                  Track Order Status Live
                </Link>
              </Button>
              <Button variant="outline" className="w-full" onClick={() => toast.info("VAT invoice PDF isn't generated in this prototype.")}>
                <span aria-hidden className="material-symbols-outlined text-[18px]">download</span>
                Download Official VAT Invoice
              </Button>
              <Button asChild variant="ghost" className="w-full">
                <Link href="/">
                  <span aria-hidden className="material-symbols-outlined text-[18px]">arrow_back</span>
                  Continue Shopping
                </Link>
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-border-default bg-surface-white p-5">
            <p className="mb-1 text-label-sm font-label-sm font-semibold uppercase tracking-wide text-orange-600">Dedicated Trade Support Desk</p>
            <a href="tel:08004567890" className="text-body-lg font-body-lg font-bold text-graphite-900">
              0800 456 7890
            </a>
            <p className="text-label-sm font-label-sm text-text-secondary">Mon–Fri 06:30 – 18:00 · Urgent route dispatches</p>
          </div>
        </div>
      </div>
    </div>
  );
}
