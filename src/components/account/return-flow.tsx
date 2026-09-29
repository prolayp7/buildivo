"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ImagePlus, X } from "lucide-react";
import { formatAddress, money, sessionRequest, type ReturnableOrder, type ReturnReason, type ReturnView } from "./returns-shared";

const MAX_PHOTOS = 5;
const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

type Draft = { quantity: number; reason: ReturnReason | ""; reasonOther: string; description: string; photos: { file: File; url: string }[] };
const STEPS = ["Select products", "Return details", "Collection address", "Review"] as const;

const panel = "mb-4 rounded-lg border border-border-default bg-surface-white p-[22px]";
const field = "mt-1 w-full rounded-md border border-border-default bg-surface-white px-3 py-2 text-[13.5px] font-normal";
const label = "mb-3 block text-[12.5px] font-semibold";
const primary = "rounded-md border border-graphite-900 bg-graphite-900 px-4 py-2 text-[13.5px] font-semibold text-white disabled:opacity-50";
const secondary = "rounded-md border border-border-default px-4 py-2 text-[13.5px] font-semibold hover:border-orange-500 disabled:opacity-50";
const facts = "mt-2 flex flex-wrap gap-x-3.5 gap-y-1 text-[12px] text-text-secondary";

/** /account/returns/new?order=<uuid>: select products → details and photos → collection address → review. */
export function ReturnFlow() {
  const router = useRouter();
  const orderUuid = useSearchParams().get("order") ?? "";
  const [data, setData] = useState<ReturnableOrder | null>(null);
  const [loadError, setLoadError] = useState("");
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<number[]>([]);
  const [drafts, setDrafts] = useState<Record<number, Draft>>({});
  const [addressId, setAddressId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!orderUuid) return;
    sessionRequest<ReturnableOrder>(`/api/customer-session/returns/orders/${encodeURIComponent(orderUuid)}`).then(setData).catch((err) => setLoadError(err.message));
  }, [orderUuid]);
  // Free preview URLs only when the page goes away (removing a photo frees its own URL).
  const draftsRef = useRef(drafts);
  useEffect(() => { draftsRef.current = drafts; }, [drafts]);
  useEffect(() => () => Object.values(draftsRef.current).forEach((draft) => draft.photos.forEach((photo) => URL.revokeObjectURL(photo.url))), []);

  const items = useMemo(() => data?.items ?? [], [data]);
  const chosen = items.filter((item) => selected.includes(item.orderItemId));
  const draftOf = (id: number): Draft => drafts[id] ?? { quantity: 1, reason: "", reasonOther: "", description: "", photos: [] };
  const update = (id: number, patch: Partial<Draft>) => setDrafts((current) => ({ ...current, [id]: { ...draftOf(id), ...patch } }));
  const reasonLabel = (value: ReturnReason | "") => data?.reasons.find((reason) => reason.value === value)?.label ?? "";
  const address = addressId ? data?.savedAddresses.find((saved) => saved.id === addressId) : data?.deliveryAddress;
  const estimated = chosen.reduce((sum, item) => sum + item.unitRefund * draftOf(item.orderItemId).quantity, 0);

  function addPhotos(id: number, files: FileList | null) {
    if (!files) return;
    const draft = draftOf(id);
    const accepted: { file: File; url: string }[] = [];
    for (const file of Array.from(files)) {
      if (!PHOTO_TYPES.includes(file.type)) { setError(`${file.name}: photos must be JPG, PNG or WEBP.`); continue; }
      if (file.size > MAX_PHOTO_BYTES) { setError(`${file.name}: each photo must be 10 MB or smaller.`); continue; }
      if (draft.photos.length + accepted.length >= MAX_PHOTOS) { setError(`Up to ${MAX_PHOTOS} photos per product.`); break; }
      accepted.push({ file, url: URL.createObjectURL(file) });
    }
    update(id, { photos: [...draft.photos, ...accepted] });
  }

  function removePhoto(id: number, index: number) {
    const draft = draftOf(id);
    URL.revokeObjectURL(draft.photos[index].url);
    update(id, { photos: draft.photos.filter((_, i) => i !== index) });
  }

  function next() {
    setError("");
    if (step === 0 && !chosen.length) return setError("Select at least one product to return.");
    if (step === 1) {
      for (const item of chosen) {
        const draft = draftOf(item.orderItemId);
        if (!draft.reason) return setError(`Choose a reason for ${item.title}.`);
        if (draft.reason === "OTHER" && !draft.reasonOther.trim()) return setError(`Tell us the reason for returning ${item.title}.`);
      }
    }
    setStep((current) => current + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit() {
    setSubmitting(true);
    setError("");
    // One multipart request: the details as JSON plus each item's photos as evidence_<index>.
    const form = new FormData();
    form.append("data", JSON.stringify({
      orderUuid,
      ...(addressId ? { addressId } : {}),
      items: chosen.map((item) => {
        const draft = draftOf(item.orderItemId);
        return { orderItemId: item.orderItemId, quantity: draft.quantity, reason: draft.reason, ...(draft.reason === "OTHER" ? { reasonOther: draft.reasonOther.trim() } : {}), ...(draft.description.trim() ? { description: draft.description.trim() } : {}) };
      }),
    }));
    chosen.forEach((item, index) => draftOf(item.orderItemId).photos.forEach((photo) => form.append(`evidence_${index}`, photo.file, photo.file.name)));
    try {
      const created = await sessionRequest<ReturnView>("/api/customer-session/returns", { method: "POST", body: form });
      router.push(`/account/returns/${encodeURIComponent(created.returnNumber)}?submitted=1`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn’t submit your return. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-[1100px] px-4 pb-16 pt-6" aria-labelledby="return-title">
      <nav aria-label="Breadcrumb" className="mb-3 text-[12.5px] text-text-secondary"><Link href="/account">Customer Account</Link> / <span aria-current="page">Return products</span></nav>
      <h1 id="return-title" className="text-[26px] font-bold">Return products</h1>
      <p className="mb-5 mt-1 text-[14px] text-text-secondary">{data ? `Order #${data.order.orderNumber}` : "Loading your order…"}</p>

      {!orderUuid || loadError ? (
        <div className={panel}><p role="alert" className="mb-3 text-error-500">{loadError || "Choose an order to return from Orders & Dispatches."}</p><Link className={secondary} href="/account">Back to your account</Link></div>
      ) : !data ? (
        <div className={panel}><p role="status" className="text-text-secondary">Loading…</p></div>
      ) : (
        <>
          <ol aria-label="Return steps" className="mb-4 flex flex-wrap gap-1.5">{STEPS.map((name, index) => <li key={name} aria-current={index === step ? "step" : undefined} className={`rounded-full px-3 py-1.5 text-[12px] font-semibold ${index === step ? "bg-graphite-900 text-white" : "bg-surface-sunken text-text-secondary"}`}>{index + 1}. {name}</li>)}</ol>
          {error ? <p role="alert" className="mb-4 rounded-md border border-error-500/30 bg-error-100 px-3 py-2.5 text-[13px] text-error-500">{error}</p> : null}

          {step === 0 ? (
            <section className={panel}>
              <h2 className="mb-2 text-[17px] font-bold">Select products to return</h2>
              {items.map((item) => (
                <label key={item.orderItemId} className={`flex items-start gap-3.5 border-t border-border-default py-4 first-of-type:border-t-0 ${item.eligible ? "cursor-pointer" : "opacity-60"}`}>
                  <input type="checkbox" className="mt-1 h-[18px] w-[18px] accent-orange-500" checked={selected.includes(item.orderItemId)} disabled={!item.eligible} onChange={() => setSelected((current) => current.includes(item.orderItemId) ? current.filter((value) => value !== item.orderItemId) : [...current, item.orderItemId])} aria-label={`Return ${item.title}`} />
                  <span className="min-w-0 flex-1">
                    <strong className="text-[14px]">{item.title}</strong>
                    {item.variant ? <span className="block text-[12.5px] text-text-secondary">{item.variant}</span> : null}
                    <span className={facts}>
                      <span>Ordered <b className="text-text-primary">{item.ordered}</b></span>
                      <span>Delivered <b className="text-text-primary">{item.delivered}</b></span>
                      <span>Previously returned <b className="text-text-primary">{item.previouslyReturned}</b></span>
                      <span>Returnable <b className="text-text-primary">{item.returnable}</b></span>
                      {item.returnDeadline ? <span>Return by <b className="text-text-primary">{new Date(item.returnDeadline).toLocaleDateString("en-GB")}</b></span> : null}
                    </span>
                    {!item.eligible && item.reason ? <span className="mt-1 block text-[12.5px] text-text-secondary">{item.reason}</span> : null}
                  </span>
                </label>
              ))}
              <div className="mt-4 flex justify-end"><button type="button" className={primary} onClick={next}>Continue</button></div>
            </section>
          ) : null}

          {step === 1 ? (
            <section className={panel}>
              <h2 className="mb-3 text-[17px] font-bold">Tell us about each product</h2>
              {chosen.map((item) => {
                const draft = draftOf(item.orderItemId);
                return (
                  <div key={item.orderItemId} className="mb-3.5 rounded-lg border border-border-default p-4">
                    <h3 className="mb-3 text-[15px] font-bold">{item.title}</h3>
                    <div className="grid gap-3 sm:grid-cols-[140px_1fr]">
                      <label className={label}>Quantity
                        <select className={field} value={draft.quantity} onChange={(event) => update(item.orderItemId, { quantity: Number(event.target.value) })}>
                          {Array.from({ length: item.returnable }, (_, i) => i + 1).map((quantity) => <option key={quantity} value={quantity}>{quantity}</option>)}
                        </select>
                        <small className="mt-1 block font-normal text-text-secondary">Up to {item.returnable}</small>
                      </label>
                      <label className={label}>Reason for return
                        <select className={field} value={draft.reason} onChange={(event) => update(item.orderItemId, { reason: event.target.value as ReturnReason })} required>
                          <option value="">Choose a reason…</option>
                          {data.reasons.map((reason) => <option key={reason.value} value={reason.value}>{reason.label}</option>)}
                        </select>
                      </label>
                    </div>
                    {draft.reason === "OTHER" ? <label className={label}>Your reason<input className={field} value={draft.reasonOther} onChange={(event) => update(item.orderItemId, { reasonOther: event.target.value })} maxLength={300} required /></label> : null}
                    <label className={label}>Describe the problem (optional)
                      <textarea className={`${field} min-h-[84px] resize-y`} value={draft.description} onChange={(event) => update(item.orderItemId, { description: event.target.value })} maxLength={2000} placeholder="e.g. The fan makes a rattling noise at startup." />
                    </label>
                    <div className={label}>
                      <span>Product photos (optional, up to {MAX_PHOTOS})</span>
                      <div className="mt-1.5 flex flex-wrap gap-2.5">
                        {draft.photos.map((photo, index) => (
                          <div key={photo.url} className="relative h-[84px] w-[84px] overflow-hidden rounded-md border border-border-default">
                            {/* eslint-disable-next-line @next/next/no-img-element -- local preview (object URL) */}
                            <img src={photo.url} alt={`Photo ${index + 1} of ${item.title}`} className="h-full w-full object-cover" />
                            <button type="button" onClick={() => removePhoto(item.orderItemId, index)} aria-label={`Remove photo ${index + 1}`} className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-graphite-900/75 text-white"><X size={14} /></button>
                          </div>
                        ))}
                        {draft.photos.length < MAX_PHOTOS ? (
                          <label className="flex h-[84px] w-[84px] cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed border-border-strong text-[11px] font-normal text-text-secondary hover:border-orange-500">
                            <ImagePlus size={20} />{draft.photos.length ? "Add more" : "Add photos"}
                            <input type="file" accept={PHOTO_TYPES.join(",")} multiple hidden onChange={(event) => { addPhotos(item.orderItemId, event.target.files); event.target.value = ""; }} />
                          </label>
                        ) : null}
                      </div>
                      <small className="mt-1.5 block font-normal text-text-secondary">JPG, PNG or WEBP, up to 10 MB each. Photos help us process your return faster.</small>
                    </div>
                  </div>
                );
              })}
              <div className="mt-2 flex justify-end gap-2.5"><button type="button" className={secondary} onClick={() => setStep(0)}>Back</button><button type="button" className={primary} onClick={next}>Continue</button></div>
            </section>
          ) : null}

          {step === 2 ? (
            <section className={panel}>
              <h2 className="mb-3 text-[17px] font-bold">Where should we collect from?</h2>
              {[{ id: null, title: "Delivery address for this order", address: data.deliveryAddress }, ...data.savedAddresses.map((saved) => ({ id: saved.id as number | null, title: saved.label || "Saved address", address: saved }))].map((option) => (
                <label key={option.id ?? "delivery"} className={`mb-2.5 flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 text-[13.5px] ${addressId === option.id ? "border-orange-500 ring-1 ring-orange-500" : "border-border-default"}`}>
                  <input type="radio" name="collect" className="mt-1 accent-orange-500" checked={addressId === option.id} onChange={() => setAddressId(option.id)} />
                  <span><b>{option.title}</b><br />{formatAddress(option.address)}</span>
                </label>
              ))}
              <p className="text-[13px] text-text-secondary">Collections are available from UK addresses in your address book. To use another address, add it under Jobsite Addresses first.</p>
              <div className="mt-4 flex justify-end gap-2.5"><button type="button" className={secondary} onClick={() => setStep(1)}>Back</button><button type="button" className={primary} onClick={next}>Continue</button></div>
            </section>
          ) : null}

          {step === 3 ? (
            <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
              <section className={panel}>
                <h2 className="mb-2 text-[17px] font-bold">Review your return</h2>
                {chosen.map((item) => {
                  const draft = draftOf(item.orderItemId);
                  return (
                    <div key={item.orderItemId} className="flex items-start gap-3.5 border-t border-border-default py-4 first-of-type:border-t-0">
                      <span className="min-w-0 flex-1">
                        <strong className="text-[14px]">{item.title}</strong>
                        <span className={facts}>
                          <span>Quantity <b className="text-text-primary">{draft.quantity}</b></span>
                          <span>Reason <b className="text-text-primary">{draft.reason === "OTHER" ? draft.reasonOther : reasonLabel(draft.reason)}</b></span>
                          <span>Photos <b className="text-text-primary">{draft.photos.length}</b></span>
                        </span>
                        {draft.description ? <span className="mt-1 block text-[12.5px] text-text-secondary">{draft.description}</span> : null}
                      </span>
                      <span className="whitespace-nowrap font-bold tabular-nums">{money(item.unitRefund * draft.quantity)}</span>
                    </div>
                  );
                })}
              </section>
              <aside className={panel}>
                <h2 className="mb-2 text-[17px] font-bold">Summary</h2>
                <div className="flex justify-between gap-4 py-2 text-[14px]"><span>Estimated refund</span><b className="tabular-nums">{money(estimated)}</b></div>
                <div className="flex justify-between gap-4 border-t border-border-default py-2 text-[14px]"><span>Refund method</span><span>Original payment method</span></div>
                <div className="flex justify-between gap-4 border-t border-border-default py-2 text-[14px]"><span>Collect from</span><span className="text-right">{address ? formatAddress(address) : ""}</span></div>
                <p className="mt-2 text-[13px] text-text-secondary">This is an estimate. The final refund is confirmed after we receive and inspect the items. If every item in the order is returned, the delivery charge is refunded too.</p>
                <div className="mt-4 flex justify-end gap-2.5">
                  <button type="button" className={secondary} onClick={() => setStep(2)} disabled={submitting}>Back</button>
                  <button type="button" className={primary} onClick={() => void submit()} disabled={submitting}>{submitting ? "Submitting…" : "Submit return request"}</button>
                </div>
              </aside>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
