"use client";

import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";

interface StepFailedProps {
  total: number;
  /** Why the payment didn't complete, e.g. "You cancelled the payment." */
  reason: string;
  /** True when an order already exists (it stays open, unpaid, so payment can be retried on it). */
  orderPlaced: boolean;
  onRetry: () => void;
  onChangeMethod: () => void;
}

export function StepFailed({ total, reason, orderPlaced, onRetry, onChangeMethod }: StepFailedProps) {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 rounded-xl border border-error-500/30 bg-error-100 p-6">
        <p className="mb-1 inline-flex items-center gap-1 rounded-full bg-error-500 px-2 py-0.5 text-label-sm font-label-sm font-semibold text-text-inverse">
          Payment Action Required
        </p>
        <h1 className="mb-2 text-headline-md font-headline-md font-bold text-graphite-900">Your payment wasn&apos;t completed</h1>
        <p className="text-body-md font-body-md text-text-secondary">
          {reason}{" "}
          {orderPlaced
            ? "Your order has been saved but not paid — you can try again below, or find it under Orders in your account."
            : "Your order has not been placed and you have not been charged."}
        </p>
      </div>

      <h2 className="mb-3 text-body-lg font-body-lg font-bold text-graphite-900">Choose Resolution Pathway</h2>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-start justify-between gap-3 rounded-xl border border-border-default bg-surface-white p-5 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
              <span className="material-symbols-outlined text-[20px]">refresh</span>
            </span>
            <div>
              <p className="text-body-sm font-body-sm font-bold text-graphite-900">Try Again</p>
              <p className="text-label-sm font-label-sm text-text-secondary">Return to the payment page with the same method.</p>
            </div>
          </div>
          <Button className="bg-orange-500 font-label-lg text-label-lg font-bold hover:bg-orange-600" onClick={onRetry}>
            <span aria-hidden className="material-symbols-outlined text-[18px]">credit_card</span>
            Retry Payment ({formatPrice(total)})
          </Button>
        </div>

        <div className="flex flex-col items-start justify-between gap-3 rounded-xl border border-border-default bg-surface-white p-5 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-graphite-100 text-graphite-700">
              <span className="material-symbols-outlined text-[20px]">sync_alt</span>
            </span>
            <div>
              <p className="text-body-sm font-body-sm font-bold text-graphite-900">Use Another Payment Method</p>
              <p className="text-label-sm font-label-sm text-text-secondary">Switch between card and PayPal.</p>
            </div>
          </div>
          <Button variant="secondary" className="bg-graphite-900 text-text-inverse hover:bg-graphite-800" onClick={onChangeMethod}>
            <span aria-hidden className="material-symbols-outlined text-[18px]">sync_alt</span>
            Change Payment
          </Button>
        </div>
      </div>

      <p className="mt-6 flex items-center justify-between rounded-xl border border-border-default bg-surface-white p-4 text-body-sm font-body-sm text-text-secondary">
        <span className="flex items-center gap-2">
          <span aria-hidden className="material-symbols-outlined text-[18px]">support_agent</span>
          Need immediate dispatch help? Call Priority Trade Desk: <strong className="text-text-primary">0800 456 7890</strong>
        </span>
      </p>
    </div>
  );
}
