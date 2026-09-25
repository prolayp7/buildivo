"use client";

import { useState } from "react";
import type { AccountOrder, AccountOrderItem } from "./order-types";

const CANCELLABLE = ["PENDING", "AWAITING_PAYMENT", "PROCESSING"];
const RETURN_REASONS = ["Item is faulty or damaged", "Wrong item received", "Item not as described", "No longer needed", "Ordered by mistake", "Other"];
const ACTIVE_RETURN = ["REQUESTED", "APPROVED", "RECEIVED"];
const label = (value: string) => value.toLowerCase().replaceAll("_", " ");

const canReturn = (item: AccountOrderItem) =>
  item.returnEligible && !item.returns.some((entry) => ACTIVE_RETURN.includes(entry.returnStatus)) && (!item.returnDeadline || new Date(item.returnDeadline) >= new Date(new Date().toDateString()));

async function send(url: string, method: "PATCH" | "POST", body: unknown): Promise<{ ok: boolean; data: Record<string, unknown> }> {
  try {
    const response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    return { ok: response.ok, data: await response.json().catch(() => ({})) };
  } catch {
    return { ok: false, data: { message: "Could not reach the shop. Please try again." } };
  }
}

/** Self-service for one order: cancel it while it has not been packed, or ask to return delivered items. */
export function OrderActions({ order, onChange }: { order: AccountOrder; onChange: (uuid: string, update: (order: AccountOrder) => AccountOrder) => void }) {
  const [panel, setPanel] = useState<"none" | "cancel" | "return">("none");
  const [reason, setReason] = useState("");
  const [returnItemId, setReturnItemId] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const cancellable = CANCELLABLE.includes(order.status);
  const returnable = order.status === "DELIVERED" && order.items.some(canReturn);
  const withReturns = order.items.filter((item) => item.returns.length > 0);
  if (!cancellable && !returnable && !withReturns.length && !message) return null;

  async function cancel() {
    setBusy(true);
    const result = await send(`/api/customer-session/orders/${order.uuid}/cancel`, "PATCH", { reason });
    setBusy(false);
    if (!result.ok) return setMessage({ ok: false, text: String(result.data.message ?? "This order could not be cancelled.") });
    onChange(order.uuid, (current) => ({ ...current, status: "CANCELLED" }));
    setPanel("none");
    setMessage({ ok: true, text: "Order cancelled. The items have gone back into stock." });
  }

  async function requestReturn() {
    if (returnItemId === null) return;
    setBusy(true);
    const result = await send("/api/customer-session/returns", "POST", { orderItemId: returnItemId, reason, comment });
    setBusy(false);
    if (!result.ok) return setMessage({ ok: false, text: String(result.data.message ?? "The return could not be requested.") });
    onChange(order.uuid, (current) => ({ ...current, items: current.items.map((item) => (item.id === returnItemId ? { ...item, returns: [...item.returns, { id: -1, returnStatus: "REQUESTED" }] } : item)) }));
    setPanel("none");
    setReturnItemId(null);
    setReason("");
    setComment("");
    setMessage({ ok: true, text: "Return requested. We've emailed you a confirmation and will be in touch." });
  }

  const box = "mt-3 rounded-lg border border-border-default bg-surface-white p-4 text-[13.5px]";
  const button = "rounded-md border border-border-default px-3 py-1.5 text-[13px] font-semibold hover:border-orange-500 disabled:opacity-50";

  return (
    <section aria-label={`Manage order ${order.orderNumber}`} className="border-t border-border-default px-[22px] pb-5 pt-4">
      <div className="flex flex-wrap items-center gap-2">
        {cancellable && <button type="button" className={button} onClick={() => { setPanel(panel === "cancel" ? "none" : "cancel"); setMessage(null); }}>Cancel order</button>}
        {returnable && <button type="button" className={button} onClick={() => { setPanel(panel === "return" ? "none" : "return"); setMessage(null); }}>Return items</button>}
        {withReturns.map((item) => <span key={item.id} className="rounded-full bg-orange-50 px-3 py-1 text-[12.5px] font-semibold text-orange-700">{item.titleSnapshot}: return {label(item.returns[item.returns.length - 1].returnStatus)}</span>)}
      </div>

      {message && <p role={message.ok ? "status" : "alert"} className={`mt-3 text-[13.5px] font-medium ${message.ok ? "text-success-500" : "text-error-500"}`}>{message.text}</p>}

      {panel === "cancel" && (
        <div className={box}>
          <p className="font-semibold">Cancel order #{order.orderNumber}?</p>
          <p className="mt-1 text-text-secondary">The items go back into stock. If you have already paid, please contact us about your refund.</p>
          <label htmlFor={`cancel-reason-${order.uuid}`} className="mt-3 block text-[12.5px] font-semibold">Reason (optional)</label>
          <textarea id={`cancel-reason-${order.uuid}`} value={reason} onChange={(event) => setReason(event.target.value)} maxLength={500} rows={2} className="mt-1 w-full rounded-md border border-border-default px-3 py-2" />
          <div className="mt-3 flex gap-2">
            <button type="button" className={`${button} bg-graphite-900 text-white hover:border-graphite-900`} disabled={busy} onClick={cancel}>{busy ? "Cancelling…" : "Yes, cancel order"}</button>
            <button type="button" className={button} disabled={busy} onClick={() => setPanel("none")}>Keep order</button>
          </div>
        </div>
      )}

      {panel === "return" && (
        <div className={box}>
          <p className="font-semibold">Which item would you like to return?</p>
          <div className="mt-2 flex flex-col gap-2">
            {order.items.filter(canReturn).map((item) => (
              <label key={item.id} className="flex items-start gap-2">
                <input type="radio" name={`return-${order.uuid}`} checked={returnItemId === item.id} onChange={() => setReturnItemId(item.id)} className="mt-1" />
                <span>{item.titleSnapshot} <span className="text-text-secondary">· {item.variantTitleSnapshot} · Qty {item.quantity}{item.returnDeadline ? ` · return by ${new Date(item.returnDeadline).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}` : ""}</span></span>
              </label>
            ))}
          </div>
          <label htmlFor={`return-reason-${order.uuid}`} className="mt-3 block text-[12.5px] font-semibold">Reason</label>
          <select id={`return-reason-${order.uuid}`} value={reason} onChange={(event) => setReason(event.target.value)} className="mt-1 w-full rounded-md border border-border-default px-3 py-2">
            <option value="">Choose a reason…</option>
            {RETURN_REASONS.map((entry) => <option key={entry} value={entry}>{entry}</option>)}
          </select>
          <label htmlFor={`return-comment-${order.uuid}`} className="mt-3 block text-[12.5px] font-semibold">Anything else we should know? (optional)</label>
          <textarea id={`return-comment-${order.uuid}`} value={comment} onChange={(event) => setComment(event.target.value)} maxLength={2000} rows={2} className="mt-1 w-full rounded-md border border-border-default px-3 py-2" />
          <div className="mt-3 flex gap-2">
            <button type="button" className={`${button} bg-graphite-900 text-white hover:border-graphite-900`} disabled={busy || returnItemId === null || !reason} onClick={requestReturn}>{busy ? "Sending…" : "Request return"}</button>
            <button type="button" className={button} disabled={busy} onClick={() => setPanel("none")}>Close</button>
          </div>
        </div>
      )}
    </section>
  );
}
