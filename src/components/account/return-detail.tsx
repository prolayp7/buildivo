"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { EvidenceGallery, formatAddress, money, RETURN_STATUS_MESSAGE, ReturnStatusBadge, ReturnTimeline, sessionRequest, type ReturnView } from "./returns-shared";

const METHOD: Record<string, string> = { STRIPE: "Card (Stripe)", PAYPAL: "PayPal", TWOCHECKOUT: "Card (2Checkout)" };
const REFUND_STATUS: Record<string, string> = { PENDING: "Pending", PROCESSING: "Processing", PROCESSED: "Successful", FAILED: "Failed - we are retrying", CANCELLED: "Cancelled" };
const panel = "mb-4 rounded-lg border border-border-default bg-surface-white p-[22px]";
const row = "flex justify-between gap-4 border-t border-border-default py-2 text-[14px] first-of-type:border-t-0";

/** /account/returns/<returnNumber>: status, timeline, items, refund and collection details. */
export function ReturnDetail() {
  const { returnNumber } = useParams<{ returnNumber: string }>();
  const justSubmitted = useSearchParams().get("submitted") === "1";
  const [ret, setRet] = useState<ReturnView | null>(null);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");
  const url = `/api/customer-session/returns/${encodeURIComponent(returnNumber)}`;

  useEffect(() => {
    sessionRequest<ReturnView>(url).then(setRet).catch((err) => setError(err.message));
  }, [url]);

  async function cancel() {
    if (!window.confirm("Cancel this return request?")) return;
    setCancelling(true);
    setCancelError("");
    try {
      setRet(await sessionRequest<ReturnView>(`${url}/cancel`, { method: "POST" }));
    } catch (err) {
      setCancelError(err instanceof Error ? err.message : "We couldn’t cancel this return.");
    } finally {
      setCancelling(false);
    }
  }

  const final = ret?.items.every((item) => item.refundIsFinal) ?? false;
  const notice = ret?.status === "RETURN_REJECTED" ? "border-error-500/30 bg-error-100 text-error-500" : ret?.status === "COMPLETED" ? "border-success-500/30 bg-success-100 text-success-500" : "border-orange-100 bg-orange-50 text-orange-700";
  return (
    <section className="mx-auto w-full max-w-[1100px] px-4 pb-16 pt-6" aria-labelledby="return-title">
      <nav aria-label="Breadcrumb" className="mb-3 text-[12.5px] text-text-secondary"><Link href="/account">Customer Account</Link> / <span aria-current="page">Return {returnNumber}</span></nav>
      {error ? (
        <div className={panel}><p role="alert" className="mb-3 text-error-500">{error}</p><Link href="/account" className="rounded-md border border-border-default px-4 py-2 text-[13.5px] font-semibold">Back to your account</Link></div>
      ) : !ret ? (
        <div className={panel}><p role="status" className="text-text-secondary">Loading…</p></div>
      ) : (
        <>
          <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 id="return-title" className="text-[26px] font-bold">Return {ret.returnNumber}</h1>
              <p className="mt-1 text-[14px] text-text-secondary">Order #{ret.order.orderNumber} · Requested {new Date(ret.createdAt).toLocaleDateString("en-GB")}</p>
            </div>
            <ReturnStatusBadge status={ret.status} />
          </div>

          {justSubmitted && ret.status === "RETURN_REQUESTED" ? <div role="status" className="mb-4 rounded-lg border border-success-500/30 bg-success-100 px-4 py-3.5 text-[14px] text-success-500"><strong className="block">Return request submitted successfully.</strong>We’ve emailed you a confirmation and will review it shortly.</div> : null}
          <div className={`mb-4 rounded-lg border px-4 py-3.5 text-[14px] ${notice}`}>
            <strong className="block">{RETURN_STATUS_MESSAGE[ret.status]}</strong>
            {ret.status === "RETURN_REJECTED" && ret.rejectionReason ? <>Reason: {ret.rejectionReason}</> : null}
          </div>

          <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <div>
              {ret.pickup ? (
                <section className={panel}>
                  <h2 className="mb-2 text-[17px] font-bold">Collection</h2>
                  {ret.pickup.date ? <div className={row}><span>Pickup date</span><b>{new Date(ret.pickup.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}</b></div> : null}
                  {ret.pickup.window ? <div className={row}><span>Time window</span><b>{ret.pickup.window}</b></div> : null}
                  {ret.pickup.courier ? <div className={row}><span>Courier</span><b>{ret.pickup.courier}</b></div> : null}
                  {ret.pickup.trackingNumber ? <div className={row}><span>Tracking number</span><b>{ret.pickup.trackingNumber}</b></div> : null}
                </section>
              ) : null}

              <section className={panel}>
                <h2 className="mb-2 text-[17px] font-bold">Items</h2>
                {ret.items.map((item) => (
                  <div key={item.id} className="flex items-start gap-3.5 border-t border-border-default py-4 first-of-type:border-t-0">
                    <span className="min-w-0 flex-1">
                      <strong className="text-[14px]">{item.title}</strong>
                      {item.variant ? <span className="block text-[12.5px] text-text-secondary">{item.variant}</span> : null}
                      <span className="mt-2 flex flex-wrap gap-x-3.5 gap-y-1 text-[12px] text-text-secondary">
                        <span>Returning <b className="text-text-primary">{item.quantity}</b> of {item.orderedQuantity}</span>
                        {item.approvedQuantity !== null ? <span>Approved <b className="text-text-primary">{item.approvedQuantity}</b></span> : null}
                        {item.receivedQuantity !== null ? <span>Received <b className="text-text-primary">{item.receivedQuantity}</b></span> : null}
                        {item.acceptedQuantity !== null ? <span>Accepted <b className="text-text-primary">{item.acceptedQuantity}</b></span> : null}
                        <span>Reason <b className="text-text-primary">{item.reason === "OTHER" && item.reasonOther ? item.reasonOther : item.reasonLabel}</b></span>
                      </span>
                      {item.description ? <span className="mt-1 block text-[12.5px] text-text-secondary">{item.description}</span> : null}
                      {item.inspectionResult === "REJECTED" && item.inspectionRejectionReason ? <span className="mt-1 block text-[12.5px]"><b>Not accepted at inspection:</b> {item.inspectionRejectionReason}</span> : null}
                      {item.deductionAmount > 0 ? <span className="mt-1 block text-[12.5px]"><b>Deduction {money(item.deductionAmount)}:</b> {item.deductionReason}</span> : null}
                      {item.imageIds.length ? <EvidenceGallery returnNumber={ret.returnNumber} imageIds={item.imageIds} /> : null}
                    </span>
                    <span className="whitespace-nowrap font-bold tabular-nums">{money(item.refundAmount)}</span>
                  </div>
                ))}
              </section>

              <section className={panel}>
                <h2 className="mb-2 text-[17px] font-bold">Refund</h2>
                <div className={row}><span>{final ? "Refund amount" : "Estimated refund"}</span><b className="tabular-nums">{money(ret.refundTotal)}</b></div>
                {ret.shippingRefund > 0 ? <div className={row}><span>Includes delivery charge</span><span className="tabular-nums">{money(ret.shippingRefund)}</span></div> : null}
                <div className={row}><span>Refund method</span><span>Original payment method</span></div>
                {ret.refunds.map((refund, index) => (
                  <div key={index} className={row}>
                    <span>{METHOD[refund.method] ?? refund.method} · {REFUND_STATUS[refund.status] ?? refund.status}
                      {refund.providerRefundId ? <small className="block text-text-secondary">Refund ID {refund.providerRefundId}</small> : null}
                      {refund.processedAt ? <small className="block text-text-secondary">Completed {new Date(refund.processedAt).toLocaleDateString("en-GB")}</small> : null}
                    </span>
                    <b className="tabular-nums">{money(refund.amount)}</b>
                  </div>
                ))}
                {!final ? <p className="mt-2 text-[13px] text-text-secondary">The final amount is confirmed after we receive and inspect your items.</p> : null}
              </section>
            </div>

            <aside>
              <section className={panel}>
                <h2 className="mb-3 text-[17px] font-bold">Return progress</h2>
                <ReturnTimeline ret={ret} />
              </section>
              <section className={panel}>
                <h2 className="mb-2 text-[17px] font-bold">Collect from</h2>
                <p className="text-[13px] text-text-secondary">{formatAddress(ret.pickupAddress)}</p>
              </section>
              {ret.status === "RETURN_REQUESTED" ? (
                <section className={panel}>
                  <p className="mb-3 text-[13px] text-text-secondary">Changed your mind? You can cancel this return until we’ve reviewed it.</p>
                  {cancelError ? <p role="alert" className="mb-3 text-[13px] text-error-500">{cancelError}</p> : null}
                  <button type="button" onClick={() => void cancel()} disabled={cancelling} className="rounded-md border border-border-default px-4 py-2 text-[13.5px] font-semibold hover:border-orange-500 disabled:opacity-50">{cancelling ? "Cancelling…" : "Cancel return request"}</button>
                </section>
              ) : null}
            </aside>
          </div>
        </>
      )}
    </section>
  );
}
