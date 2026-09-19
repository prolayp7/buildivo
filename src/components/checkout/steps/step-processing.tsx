"use client";

import { formatPrice } from "@/lib/format";

interface StepProcessingProps {
  total: number;
  /** "starting" while the order and payment are being created, "confirming" when returning from the provider. */
  stage: "starting" | "confirming";
  providerLabel: string;
}

export function StepProcessing({ total, stage, providerLabel }: StepProcessingProps) {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-xl border border-border-default bg-surface-white p-6 text-center sm:p-8" role="status" aria-live="polite">
        <span aria-hidden className="material-symbols-outlined mb-3 animate-pulse text-[44px] text-orange-500">lock</span>
        <h1 className="mb-2 text-headline-md font-headline-md font-bold text-graphite-900">
          {stage === "confirming" ? "Confirming your payment…" : `Taking you to ${providerLabel}…`}
        </h1>
        <p className="text-body-md font-body-md text-text-secondary">
          {stage === "confirming"
            ? "Please wait while we confirm your payment. Don't close or refresh this page."
            : `Your order is being created and you'll be redirected to pay ${formatPrice(total)} securely. Don't close this page.`}
        </p>
      </div>
    </div>
  );
}
