"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { CheckCircle2, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitQuoteRequest } from "@/lib/storefront-client";

export interface QuoteLine {
  variantId: number;
  label: string;
  quantity: number;
}

/** Request-a-Quote (RFQ) for large orders. Renders its own trigger button; the requested
 * quantities are editable in the dialog so a buyer can ask for a bigger number than the cart holds. */
export function QuoteRequestDialog({ lines, className, children }: { lines: QuoteLine[]; className?: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");

  function openDialog() {
    setQuantities(Object.fromEntries(lines.map((line) => [line.variantId, line.quantity])));
    setError("");
    setReference("");
    setOpen(true);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const text = (name: string) => String(form.get(name) ?? "").trim();
    setSubmitting(true);
    setError("");
    try {
      const result = await submitQuoteRequest({
        contactName: text("contactName"),
        email: text("email"),
        companyName: text("companyName") || undefined,
        phone: text("phone") || undefined,
        message: text("message") || undefined,
        items: lines.map((line) => ({ productVariantId: line.variantId, quantity: Math.max(1, Math.floor(quantities[line.variantId] ?? line.quantity)) })),
      });
      setReference(result.uuid.slice(0, 8).toUpperCase());
      toast.success("Quote request sent");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Your request could not be sent. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button type="button" onClick={openDialog} disabled={!lines.length} className={className}>{children}</button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] grid-cols-[minmax(0,1fr)] overflow-y-auto overflow-x-hidden sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Request a quote</DialogTitle>
            <DialogDescription>Ordering in volume? Tell us what you need and our trade team will reply with a price by email.</DialogDescription>
          </DialogHeader>
          {reference ? (
            <div role="status" className="flex flex-col items-center gap-2 py-6 text-center">
              <CheckCircle2 className="size-10 text-success-500" aria-hidden />
              <p className="text-body-md font-semibold text-graphite-900">Your request has been received</p>
              <p className="text-body-sm text-text-secondary">Reference <span className="font-mono font-semibold text-graphite-900">{reference}</span>. We&apos;ll email you a quote shortly. If you&apos;re signed in, you can follow it under Account &rsaquo; Quote requests.</p>
              <Button type="button" onClick={() => setOpen(false)} className="mt-2 bg-graphite-900 text-text-inverse hover:bg-graphite-800">Close</Button>
            </div>
          ) : (
            <form onSubmit={(event) => void submit(event)} className="space-y-4">
              <fieldset className="min-w-0 space-y-2">
                <legend className="text-label-md font-label-md font-semibold text-graphite-900">Items</legend>
                <ul className="max-h-40 space-y-2 overflow-y-auto rounded-lg border border-border-default p-2">
                  {lines.map((line) => (
                    <li key={line.variantId} className="flex items-center gap-3">
                      <span className="min-w-0 flex-1 truncate text-body-sm">{line.label}</span>
                      <Input type="number" min={1} step={1} required aria-label={`Quantity for ${line.label}`} value={quantities[line.variantId] ?? line.quantity} onChange={(event) => setQuantities((current) => ({ ...current, [line.variantId]: Number(event.target.value) }))} className="h-9 w-24 shrink-0" />
                    </li>
                  ))}
                </ul>
              </fieldset>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5"><Label htmlFor="rfq-name">Your name</Label><Input id="rfq-name" name="contactName" required autoComplete="name" /></div>
                <div className="space-y-1.5"><Label htmlFor="rfq-email">Email</Label><Input id="rfq-email" name="email" type="email" required autoComplete="email" /></div>
                <div className="space-y-1.5"><Label htmlFor="rfq-company">Company (optional)</Label><Input id="rfq-company" name="companyName" autoComplete="organization" /></div>
                <div className="space-y-1.5"><Label htmlFor="rfq-phone">Phone (optional)</Label><Input id="rfq-phone" name="phone" type="tel" autoComplete="tel" /></div>
              </div>
              <div className="space-y-1.5"><Label htmlFor="rfq-message">Message (optional)</Label><Textarea id="rfq-message" name="message" rows={3} placeholder="Delivery date, site address, anything we should know…" /></div>
              {error ? <p role="alert" className="text-body-sm text-error-500">{error}</p> : null}
              <Button type="submit" disabled={submitting} className="h-11 w-full bg-orange-500 font-semibold text-text-inverse hover:bg-orange-600">
                {submitting ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : null}Send quote request
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
