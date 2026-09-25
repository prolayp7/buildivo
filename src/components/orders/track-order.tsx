"use client";

import { FormEvent, useState } from "react";
import { Check, Package, Truck, XCircle } from "lucide-react";
import { trackOrder, type TrackedOrder } from "@/lib/storefront-client";

const STEPS = ["Order placed", "Being prepared", "Shipped", "Delivered"];
const stageOf = (status: string) => (status === "DELIVERED" ? 3 : status === "SHIPPED" ? 2 : status === "PROCESSING" || status === "PACKED" ? 1 : 0);
const STATUS_TEXT: Record<string, string> = {
  PENDING: "Order received", AWAITING_PAYMENT: "Awaiting payment", PROCESSING: "Being prepared", PACKED: "Packed and ready to dispatch",
  SHIPPED: "On its way", DELIVERED: "Delivered", CANCELLED: "Cancelled", FAILED: "Payment failed",
};
const label = (value: string) => value.toLowerCase().replaceAll("_", " ");
const when = (value: string) => new Date(value).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
const safeUrl = (value: string | null) => { try { const url = value ? new URL(value) : null; return url && ["http:", "https:"].includes(url.protocol) ? url.href : undefined; } catch { return undefined; } };

export function TrackOrder() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<TrackedOrder | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setOrder(null);
    try {
      setOrder(await trackOrder(orderNumber.trim(), email.trim()));
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "We couldn't look that order up. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const stopped = order ? ["CANCELLED", "FAILED"].includes(order.status) : false;
  const stage = order ? stageOf(order.status) : 0;
  const link = order ? safeUrl(order.trackingUrl ?? order.shipments.find((shipment) => shipment.trackingUrl)?.trackingUrl ?? null) : undefined;
  const events = order ? order.shipments.flatMap((shipment) => shipment.events).sort((a, b) => +new Date(b.occurredAt) - +new Date(a.occurredAt)) : [];

  return (
    <div className="mx-auto w-full max-w-[760px] px-4 py-10 sm:px-8">
      <h1 className="text-3xl font-bold">Track your order</h1>
      <p className="mt-2 text-text-secondary">Enter your order number and the email address you ordered with. You don&apos;t need an account.</p>

      <form onSubmit={submit} className="mt-6 grid gap-4 rounded-xl border border-border-default bg-white p-5 sm:grid-cols-2">
        <div>
          <label htmlFor="track-order-number" className="mb-1 block text-sm font-semibold">Order number</label>
          <input id="track-order-number" required value={orderNumber} onChange={(event) => setOrderNumber(event.target.value)} placeholder="e.g. BLD-000123" autoComplete="off" className="h-11 w-full rounded-md border border-border-default px-3" />
        </div>
        <div>
          <label htmlFor="track-email" className="mb-1 block text-sm font-semibold">Email address</label>
          <input id="track-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" className="h-11 w-full rounded-md border border-border-default px-3" />
        </div>
        <div className="sm:col-span-2">
          <button type="submit" disabled={busy} className="h-11 rounded-md bg-orange-500 px-6 font-semibold text-white hover:bg-orange-600 disabled:opacity-60">{busy ? "Looking up…" : "Track order"}</button>
        </div>
      </form>

      {error && <p role="alert" className="mt-4 rounded-lg bg-error-100 px-4 py-3 text-sm text-error-500">{error}</p>}

      {order && (
        <section aria-label={`Order ${order.orderNumber}`} className="mt-6 rounded-xl border border-border-default bg-white p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-xl font-bold">Order #{order.orderNumber}</h2>
            <p className="text-sm text-text-secondary">Placed {when(order.placedAt)}</p>
          </div>
          <p className="mt-1 flex items-center gap-2 font-semibold">
            {stopped ? <XCircle aria-hidden className="size-5 text-error-500" /> : <Package aria-hidden className="size-5 text-orange-600" />}
            {STATUS_TEXT[order.status] ?? label(order.status)}
          </p>

          {!stopped && (
            <ol aria-label="Order progress" className="mt-5 grid grid-cols-4 gap-2">
              {STEPS.map((step, index) => (
                <li key={step} aria-current={index === stage ? "step" : undefined} className="text-center text-xs">
                  <span className={`mx-auto mb-1 flex size-8 items-center justify-center rounded-full ${index <= stage ? "bg-orange-500 text-white" : "bg-graphite-100 text-text-secondary"}`}>
                    {index < stage || order.status === "DELIVERED" ? <Check aria-hidden className="size-4" /> : index + 1}
                  </span>
                  <span className={index <= stage ? "font-semibold" : "text-text-secondary"}>{step}</span>
                </li>
              ))}
            </ol>
          )}

          {(order.trackingNumber || link || order.shippingMethod) && (
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-orange-50 px-4 py-3 text-sm">
              <span className="flex items-center gap-2"><Truck aria-hidden className="size-4" />
                <span><strong>{order.trackingCarrier || order.shippingMethod?.carrier || "Delivery"}</strong>{order.shippingMethod ? ` · ${order.shippingMethod.title}` : ""}{order.trackingNumber ? ` · ${order.trackingNumber}` : ""}</span>
              </span>
              {link && <a href={link} target="_blank" rel="noopener noreferrer" className="font-semibold text-orange-700 underline">Track with the carrier</a>}
            </div>
          )}

          {events.length > 0 && (
            <div className="mt-5">
              <h3 className="mb-2 font-semibold">Delivery updates</h3>
              <ul className="flex flex-col gap-2 text-sm">
                {events.map((event, index) => <li key={index} className="border-l-2 border-orange-300 pl-3"><span className="font-medium">{event.description || label(event.status)}</span><span className="block text-text-secondary">{[event.location, when(event.occurredAt)].filter(Boolean).join(" · ")}</span></li>)}
              </ul>
            </div>
          )}

          <div className="mt-5">
            <h3 className="mb-2 font-semibold">Items</h3>
            <ul className="text-sm">{order.items.map((item, index) => <li key={index} className="flex justify-between gap-3 border-b border-border-default py-2 last:border-0"><span>{item.titleSnapshot}<span className="block text-text-secondary">{item.variantTitleSnapshot}</span></span><span className="shrink-0">× {item.quantity}</span></li>)}</ul>
          </div>

          {order.history.length > 0 && (
            <details className="mt-5 text-sm">
              <summary className="cursor-pointer font-semibold">Order history</summary>
              <ul className="mt-2 flex flex-col gap-1">{order.history.map((entry, index) => <li key={index}>{STATUS_TEXT[entry.toStatus] ?? label(entry.toStatus)} <span className="text-text-secondary">· {when(entry.createdAt)}</span></li>)}</ul>
            </details>
          )}
        </section>
      )}
    </div>
  );
}
