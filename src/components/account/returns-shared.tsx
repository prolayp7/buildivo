"use client";

import { CURRENCY } from "@/lib/format";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Link from "next/link";

// ---- Returns (order-item level: partial quantities, several returns per order) ----
export type ReturnStatus = "RETURN_REQUESTED" | "RETURN_APPROVED" | "RETURN_REJECTED" | "PICKUP_SCHEDULED" | "PICKED_UP" | "RETURN_RECEIVED" | "INSPECTION" | "REFUND_APPROVED" | "REFUND_PROCESSING" | "COMPLETED" | "CANCELLED";
export type ReturnReason = "DAMAGED" | "DEFECTIVE" | "WRONG_ITEM" | "MISSING_PARTS" | "NOT_AS_DESCRIBED" | "POOR_CONDITION" | "CHANGED_MIND" | "OTHER";
export type ReturnAddress = { fullName: string; line1: string; line2: string | null; city: string; county: string | null; postcode: string; phone: string | null };
export type ReturnableItem = {
  orderItemId: number; title: string; variant: string; sku: string | null; productId: number;
  ordered: number; delivered: number; previouslyReturned: number; returnable: number;
  eligible: boolean; reason: string | null; returnDeadline: string | null; unitRefund: number;
};
export type ReturnableOrder = {
  order: { uuid: string; orderNumber: string; status: string };
  deliveryAddress: ReturnAddress;
  savedAddresses: (ReturnAddress & { id: number; label: string | null })[];
  reasons: { value: ReturnReason; label: string }[];
  items: ReturnableItem[];
};
export type ReturnItemView = {
  id: number; orderItemId: number; title: string; variant: string; sku: string | null; productId: number;
  orderedQuantity: number; quantity: number; approvedQuantity: number | null; receivedQuantity: number | null; acceptedQuantity: number | null;
  reason: ReturnReason; reasonLabel: string; reasonOther: string | null; description: string | null;
  inspectionResult: "ACCEPTED" | "PARTIALLY_ACCEPTED" | "REJECTED" | null; inspectionRejectionReason: string | null;
  deductionAmount: number; deductionReason: string | null; refundAmount: number; refundIsFinal: boolean; imageIds: number[];
};
export type ReturnView = {
  returnNumber: string; status: ReturnStatus; createdAt: string;
  order: { uuid: string; orderNumber: string };
  pickupAddress: ReturnAddress;
  pickup: { courier: string | null; date: string | null; window: string | null; trackingNumber: string | null } | null;
  rejectionReason: string | null;
  items: ReturnItemView[];
  shippingRefund: number; refundTotal: number;
  refunds: { amount: number; status: "PENDING" | "PROCESSING" | "PROCESSED" | "FAILED" | "CANCELLED"; providerRefundId: string | null; method: string; processedAt: string | null; createdAt: string }[];
  events: { status: ReturnStatus | null; action: string; note: string | null; createdAt: string }[];
};

export const money = (value: string | number) => new Intl.NumberFormat("en-GB", { style: "currency", currency: CURRENCY }).format(Number(value));
export const formatAddress = (address: Omit<ReturnAddress, "phone">) => [address.fullName, address.line1, address.line2, address.city, address.county, address.postcode].filter(Boolean).join(", ");

/** Calls a customer-session route; throws the API's message on failure. */
export async function sessionRequest<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { cache: "no-store", ...init });
  const body = await response.json().catch(() => ({}));
  if (response.status === 401) { window.location.href = `/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`; throw new Error("Please sign in."); }
  if (!response.ok) throw new Error(typeof body.message === "string" ? body.message : "Something went wrong. Please try again.");
  return body as T;
}

export const RETURN_STATUS_LABEL: Record<ReturnStatus, string> = {
  RETURN_REQUESTED: "Requested", RETURN_APPROVED: "Approved", RETURN_REJECTED: "Rejected", PICKUP_SCHEDULED: "Pickup scheduled", PICKED_UP: "Picked up",
  RETURN_RECEIVED: "Received", INSPECTION: "Inspection", REFUND_APPROVED: "Refund approved", REFUND_PROCESSING: "Refund processing", COMPLETED: "Refunded", CANCELLED: "Cancelled",
};

/** What the customer is told at each stage (docs: ecom refund flow). */
export const RETURN_STATUS_MESSAGE: Record<ReturnStatus, string> = {
  RETURN_REQUESTED: "We are reviewing your return request.",
  RETURN_APPROVED: "Your return request has been approved. Pickup will be scheduled shortly.",
  RETURN_REJECTED: "Your return request was not approved.",
  PICKUP_SCHEDULED: "Your collection is booked. Please have the items packed and ready.",
  PICKED_UP: "Your returned product has been picked up.",
  RETURN_RECEIVED: "We have received your returned product. It is now being inspected.",
  INSPECTION: "Inspection in progress.",
  REFUND_APPROVED: "Your refund has been approved and will be sent to your original payment method.",
  REFUND_PROCESSING: "Your refund is being processed.",
  COMPLETED: "Refund completed successfully.",
  CANCELLED: "You cancelled this return request.",
};

export function ReturnStatusBadge({ status }: { status: ReturnStatus }) {
  const tone = status === "COMPLETED" ? "bg-success-100 text-success-500" : status === "RETURN_REJECTED" ? "bg-error-100 text-error-500" : status === "CANCELLED" ? "bg-surface-sunken text-text-secondary" : "bg-orange-50 text-orange-700";
  return <span className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-[12.5px] font-semibold ${tone}`}>{RETURN_STATUS_LABEL[status]}</span>;
}

// The ten customer-facing steps, placed on the status order; "Under review" (0.5) is the wait in RETURN_REQUESTED.
const ORDER: ReturnStatus[] = ["RETURN_REQUESTED", "RETURN_APPROVED", "PICKUP_SCHEDULED", "PICKED_UP", "RETURN_RECEIVED", "INSPECTION", "REFUND_APPROVED", "REFUND_PROCESSING", "COMPLETED"];
const STEPS: { label: string; position: number; status?: ReturnStatus }[] = [
  { label: "Return requested", position: 0, status: "RETURN_REQUESTED" },
  { label: "Under review", position: 0.5 },
  ...ORDER.slice(1).map((status, index) => ({ label: ["Return approved", "Pickup scheduled", "Picked up", "Product received", "Inspection", "Refund approved", "Refund processing", "Refund completed"][index], position: index + 1, status })),
];

export function ReturnTimeline({ ret }: { ret: ReturnView }) {
  const stopped = ret.status === "RETURN_REJECTED" || ret.status === "CANCELLED";
  // Where the return is: a stopped one shows how far it got, a completed one has every step done.
  const reached = stopped ? [...ret.events].reverse().find((event) => event.status && ORDER.includes(event.status))?.status ?? "RETURN_REQUESTED" : ret.status;
  const index = ORDER.indexOf(reached);
  const currentPosition = ret.status === "COMPLETED" ? Infinity : index === 0 ? 0.5 : index;
  const dateOf = (status?: ReturnStatus) => status ? [...ret.events].reverse().find((event) => event.status === status)?.createdAt : undefined;
  return (
    <ol className="relative">
      {STEPS.map((step, i) => {
        const done = stopped ? step.position <= index : step.position < currentPosition;
        const current = !stopped && step.position === currentPosition;
        const when = done || current ? dateOf(step.status) : undefined;
        return (
          <li key={step.label} className={`relative grid grid-cols-[22px_1fr] gap-3 pb-3.5 text-[13.5px] ${done || current ? "text-text-primary" : "text-text-secondary"} ${current ? "font-semibold" : ""}`}>
            {i < STEPS.length - 1 ? <span aria-hidden="true" className="absolute left-[7px] top-[18px] bottom-0 w-0.5 bg-border-default" /> : null}
            <span aria-hidden="true" className={`mt-[3px] h-3 w-3 rounded-full border-2 ${done ? "border-orange-500 bg-orange-500" : current ? "border-orange-500 bg-surface-white" : "border-border-default bg-surface-white"}`} />
            <span>{step.label}{when ? <small className="block text-[12px] font-normal text-text-secondary">{new Date(when).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</small> : null}</span>
          </li>
        );
      })}
    </ol>
  );
}

/** Evidence photos are private: streamed through the signed-in session, never public URLs.
 * Clicking a thumbnail opens an in-page viewer with previous/next. */
export function EvidenceGallery({ returnNumber, imageIds }: { returnNumber: string; imageIds: number[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const viewer = useRef<HTMLDialogElement>(null);
  const src = (id: number) => `/api/customer-session/returns/${encodeURIComponent(returnNumber)}/images/${id}`;
  const count = imageIds.length;
  const open = (i: number) => { setIndex(i); viewer.current?.showModal(); };
  const step = (by: number) => setIndex((current) => current === null ? current : Math.min(count - 1, Math.max(0, current + by)));
  const control = "fixed grid h-11 w-11 place-items-center rounded-full bg-white/90 text-graphite-900 disabled:cursor-default disabled:opacity-35";
  return (
    <>
      <span className="mt-2.5 flex flex-wrap gap-2.5">
        {imageIds.map((id, i) => (
          <button type="button" key={id} onClick={() => open(i)} aria-label={`View photo ${i + 1} of ${count}`} className="block h-20 w-20 cursor-zoom-in overflow-hidden rounded-md border border-border-default bg-surface-sunken">
            {/* eslint-disable-next-line @next/next/no-img-element -- private image behind the session route */}
            <img src={src(id)} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
      </span>
      <dialog ref={viewer} aria-label="Return photos" onClose={() => setIndex(null)}
        onClick={(event) => { if (event.target === event.currentTarget) viewer.current?.close(); }}
        onKeyDown={(event) => { if (event.key === "ArrowLeft") step(-1); if (event.key === "ArrowRight") step(1); }}
        className="m-0 h-screen max-h-none w-screen max-w-none bg-transparent p-0 backdrop:bg-graphite-900/85 open:grid open:place-items-center">
        {index !== null ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- private image behind the session route */}
            <img src={src(imageIds[index])} alt={`Return photo ${index + 1} of ${count}`} className="max-h-[82vh] max-w-[min(92vw,1100px)] rounded-lg bg-white object-contain" />
            <button type="button" onClick={() => viewer.current?.close()} aria-label="Close" className={`${control} right-4 top-4`}><X size={22} /></button>
            {count > 1 ? (
              <>
                <button type="button" onClick={() => step(-1)} disabled={index === 0} aria-label="Previous photo" className={`${control} left-4 top-1/2 -translate-y-1/2`}><ChevronLeft size={24} /></button>
                <button type="button" onClick={() => step(1)} disabled={index === count - 1} aria-label="Next photo" className={`${control} right-4 top-1/2 -translate-y-1/2`}><ChevronRight size={24} /></button>
                <p aria-live="polite" className="fixed bottom-5 left-1/2 m-0 -translate-x-1/2 text-[13px] font-semibold text-white">{index + 1} / {count}</p>
              </>
            ) : null}
          </>
        ) : null}
      </dialog>
    </>
  );
}

/** Customer Account > Returns. */
export function AccountReturns() {
  const [returns, setReturns] = useState<ReturnView[] | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    sessionRequest<{ items: ReturnView[] }>("/api/customer-session/returns").then((body) => { if (active) setReturns(body.items); }).catch((err) => { if (active) setError(err.message); });
    return () => { active = false; };
  }, [attempt]);

  const panel = "rounded-lg border border-border-default bg-surface-white p-[22px]";
  if (error) return <section className={panel} id="account-panel"><p role="alert" className="text-error-500">{error}</p><button type="button" onClick={() => { setError(""); setAttempt(attempt + 1); }} className="mt-3 rounded-md border border-border-default px-3 py-1.5 text-[13px] font-semibold">Try again</button></section>;
  if (!returns) return <section className={panel} id="account-panel"><p role="status" className="text-text-secondary">Loading your returns…</p></section>;
  return (
    <section className={panel} id="account-panel" aria-labelledby="returns-title">
      <h2 id="returns-title" className="text-[18px] font-bold">Returns</h2>
      {!returns.length ? (
        <p className="mt-2 text-[13.5px] text-text-secondary">You haven’t returned anything. To start a return, choose <b>Return items</b> on a delivered order under Orders &amp; Dispatches.</p>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-[13.5px]">
            <thead className="text-[12px] text-text-secondary"><tr><th className="border-b border-border-default px-3 py-2 font-semibold">Return</th><th className="border-b border-border-default px-3 py-2 font-semibold">Order</th><th className="border-b border-border-default px-3 py-2 font-semibold">Items</th><th className="border-b border-border-default px-3 py-2 font-semibold">Amount</th><th className="border-b border-border-default px-3 py-2 font-semibold">Requested</th><th className="border-b border-border-default px-3 py-2 font-semibold">Status</th></tr></thead>
            <tbody>
              {returns.map((ret) => (
                <tr key={ret.returnNumber}>
                  <td className="border-b border-border-default px-3 py-3"><Link href={`/account/returns/${encodeURIComponent(ret.returnNumber)}`} className="font-bold hover:text-orange-600">{ret.returnNumber}</Link></td>
                  <td className="border-b border-border-default px-3 py-3">{ret.order.orderNumber}</td>
                  <td className="border-b border-border-default px-3 py-3">{ret.items.length} item{ret.items.length === 1 ? "" : "s"}</td>
                  <td className="border-b border-border-default px-3 py-3 font-semibold tabular-nums">{money(ret.refundTotal)}</td>
                  <td className="border-b border-border-default px-3 py-3">{new Date(ret.createdAt).toLocaleDateString("en-GB")}</td>
                  <td className="border-b border-border-default px-3 py-3"><ReturnStatusBadge status={ret.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
