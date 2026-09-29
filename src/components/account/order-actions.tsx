"use client";

import { useState } from "react";
import Link from "next/link";
import type { AccountOrder, AccountOrderItem } from "./order-types";
import { RETURN_STATUS_LABEL, type ReturnStatus } from "./returns-shared";

const CANCELLABLE = ["PENDING", "AWAITING_PAYMENT", "PROCESSING", "FAILED"];
const RETURNABLE_ORDER = ["DELIVERED", "PARTIALLY_RETURNED"];
const CLOSED_RETURN = ["RETURN_REJECTED", "CANCELLED"];

// A hint only: the return flow asks the API for the exact returnable quantity of each item.
const canReturn = (item: AccountOrderItem) =>
  item.returnEligible
  && item.returnItems.filter((entry) => !CLOSED_RETURN.includes(entry.returnRequest.status)).reduce((sum, entry) => sum + entry.quantity, 0) < item.quantity
  && (!item.returnDeadline || new Date(item.returnDeadline) >= new Date(new Date().toDateString()));

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
  const [panel, setPanel] = useState<"none" | "cancel">("none");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const cancellable = CANCELLABLE.includes(order.status) && (order.status !== "FAILED" || order.paymentStatus === "FAILED");
  const failedUnpaid = order.status === "FAILED" && order.paymentStatus === "FAILED";
  const returnable = RETURNABLE_ORDER.includes(order.status) && order.items.some(canReturn);
  const returns = [...new Map(order.items.flatMap((item) => item.returnItems.map((entry) => [entry.returnRequest.returnNumber, entry.returnRequest] as const))).values()];
  if (!cancellable && !returnable && !returns.length && !message) return null;

  async function cancel() {
    setBusy(true);
    const result = await send(`/api/customer-session/orders/${order.uuid}/cancel`, "PATCH", { reason });
    setBusy(false);
    if (!result.ok) return setMessage({ ok: false, text: String(result.data.message ?? "This order could not be cancelled.") });
    onChange(order.uuid, (current) => ({ ...current, status: "CANCELLED" }));
    setPanel("none");
    setMessage({ ok: true, text: "Order cancelled. The items have gone back into stock." });
  }

  const box = "mt-3 rounded-lg border border-border-default bg-surface-white p-4 text-[13.5px]";
  const button = "rounded-md border border-border-default px-3 py-1.5 text-[13px] font-semibold hover:border-orange-500 disabled:opacity-50";

  return (
    <section aria-label={`Manage order ${order.orderNumber}`} className="border-t border-border-default px-[22px] pb-5 pt-4">
      <div className="flex flex-wrap items-center gap-2">
        {cancellable && <button type="button" className={button} onClick={() => { setPanel(panel === "cancel" ? "none" : "cancel"); setMessage(null); }}>{failedUnpaid ? "Remove failed order" : "Cancel order"}</button>}
        {returnable && <Link className={button} href={`/account/returns/new?order=${encodeURIComponent(order.uuid)}`}>Return items</Link>}
        {returns.map((entry) => <Link key={entry.returnNumber} href={`/account/returns/${encodeURIComponent(entry.returnNumber)}`} className="rounded-full bg-orange-50 px-3 py-1 text-[12.5px] font-semibold text-orange-700 hover:underline">Return {entry.returnNumber}: {RETURN_STATUS_LABEL[entry.status as ReturnStatus] ?? entry.status}</Link>)}
      </div>

      {message && <p role={message.ok ? "status" : "alert"} className={`mt-3 text-[13.5px] font-medium ${message.ok ? "text-success-500" : "text-error-500"}`}>{message.text}</p>}

      {panel === "cancel" && (
        <div className={box}>
          <p className="font-semibold">{failedUnpaid ? "Remove failed order" : "Cancel order"} #{order.orderNumber}?</p>
          <p className="mt-1 text-text-secondary">{failedUnpaid ? "This unpaid order will be marked cancelled and its reserved items returned to stock. It will remain in your order history." : "The items go back into stock. If you have already paid, please contact us about your refund."}</p>
          <label htmlFor={`cancel-reason-${order.uuid}`} className="mt-3 block text-[12.5px] font-semibold">Reason (optional)</label>
          <textarea id={`cancel-reason-${order.uuid}`} value={reason} onChange={(event) => setReason(event.target.value)} maxLength={500} rows={2} className="mt-1 w-full rounded-md border border-border-default px-3 py-2" />
          <div className="mt-3 flex gap-2">
            <button type="button" className={`${button} bg-graphite-900 text-white hover:border-graphite-900`} disabled={busy} onClick={cancel}>{busy ? "Cancelling…" : failedUnpaid ? "Yes, remove order" : "Yes, cancel order"}</button>
            <button type="button" className={button} disabled={busy} onClick={() => setPanel("none")}>Keep order</button>
          </div>
        </div>
      )}

    </section>
  );
}
