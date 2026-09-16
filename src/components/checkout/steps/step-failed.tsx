"use client";

import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";

interface StepFailedProps {
  total: number;
  onRetry: () => void;
  onChangeMethod: () => void;
  onTradeBypass: () => void;
}

export function StepFailed({ total, onRetry, onChangeMethod, onTradeBypass }: StepFailedProps) {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 rounded-xl border border-error-500/30 bg-error-100 p-6">
        <p className="mb-1 inline-flex items-center gap-1 rounded-full bg-error-500 px-2 py-0.5 text-label-sm font-label-sm font-semibold text-text-inverse">
          Payment Action Required
        </p>
        <h1 className="mb-2 text-headline-md font-headline-md font-bold text-graphite-900">We couldn&apos;t process your payment</h1>
        <p className="text-body-md font-body-md text-text-secondary">
          Don&apos;t worry — your order has <strong>not</strong> been placed, your card was not debited, and all items remain safely reserved in your queue.
        </p>
      </div>

      <div className="mb-6 rounded-xl border border-border-default bg-surface-white p-5">
        <p className="mb-2 text-label-sm font-label-sm font-semibold uppercase tracking-wide text-text-disabled">Card Issuer Terminal Report</p>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-body-md font-body-md font-bold text-graphite-900">Card Issuer Declined Transaction</p>
          <span className="rounded bg-error-100 px-2 py-0.5 text-label-sm font-label-sm font-semibold text-error-500">05_DO_NOT_HONOUR</span>
        </div>
        <p className="mb-4 text-body-sm font-body-sm text-text-secondary">
          Your bank declined the transaction of {formatPrice(total)}. For professional hardware and high-ticket trade supplies, this standard automated
          safeguard can trigger on 3D-Secure timeouts, daily spend velocity caps, or merchant category flags.
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
              <p className="text-body-sm font-body-sm font-bold text-graphite-900">Retry Same Card</p>
              <p className="text-label-sm font-label-sm text-text-secondary">Approve the prompt in your mobile banking app first, then re-send authorization.</p>
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
              <p className="text-label-sm font-label-sm text-text-secondary">Switch to Apple Pay, PayPal, Google Pay, or another card.</p>
            </div>
          </div>
          <Button variant="secondary" className="bg-graphite-900 text-text-inverse hover:bg-graphite-800" onClick={onChangeMethod}>
            <span aria-hidden className="material-symbols-outlined text-[18px]">sync_alt</span>
            Change Payment
          </Button>
        </div>

        <div className="flex flex-col items-start justify-between gap-3 rounded-xl border border-orange-500/40 bg-graphite-900 p-5 text-text-inverse sm:flex-row sm:items-center">
          <div>
            <p className="mb-1 text-label-sm font-label-sm font-semibold uppercase tracking-wide text-orange-500">Apex Mechanical Ltd Trade Facility</p>
            <p className="text-body-sm font-body-sm font-bold">Bypass card authorization &amp; switch to Trade Net 30</p>
            <p className="text-label-sm font-label-sm text-text-inverse-muted">£12,500.00 pre-approved credit remaining on account.</p>
          </div>
          <Button className="bg-orange-500 font-label-lg text-label-lg font-bold hover:bg-orange-600" onClick={onTradeBypass}>
            Charge to Trade Account
            <span aria-hidden className="material-symbols-outlined text-[18px]">arrow_forward</span>
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
