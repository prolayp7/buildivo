"use client";

import { useEffect, useRef, useState } from "react";
import { formatPrice } from "@/lib/format";

interface StepProcessingProps {
  total: number;
  onSuccess: () => void;
  onDeclined: () => void;
}

const STAGES = [
  { label: "Stage 1: Card Issuer & Banking Gateway", status: "Handshake Valid" },
  { label: "Stage 2: Authorizing Payment", status: "Awaiting 3DS OTP" },
  { label: "Stage 3: Allocating Depot Inventory & VAT Invoice", status: "Queued" },
  { label: "Stage 4: Finalizing Order Confirmation", status: "Pending 3DS" },
];

export function StepProcessing({ total, onSuccess, onDeclined }: StepProcessingProps) {
  const [otp, setOtp] = useState<string[]>(["4", "8", "2", "9", "1", "0"]);
  const [submitting, setSubmitting] = useState(false);
  const [seconds, setSeconds] = useState(160);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const id = window.setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => window.clearInterval(id);
  }, []);

  function handleDigit(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    setOtp((prev) => prev.map((d, i) => (i === index ? digit : d)));
    if (digit && index < 5) inputsRef.current[index + 1]?.focus();
  }

  function handleSubmit() {
    setSubmitting(true);
    window.setTimeout(() => {
      setSubmitting(false);
      onSuccess();
    }, 1400);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-xl border border-border-default bg-surface-white p-6 sm:p-8">
        <div className="mb-6 flex items-center justify-between text-label-sm font-label-sm">
          <span className="flex items-center gap-1.5 font-semibold uppercase tracking-wide text-orange-600">
            <span aria-hidden className="h-2 w-2 rounded-full bg-orange-500" />
            Encrypted 3DS Handshake
          </span>
          <span className="flex items-center gap-1 text-success-500">
            <span aria-hidden className="material-symbols-outlined text-[16px]">lock</span>
            Verified by Visa / Mastercard ID Check
          </span>
        </div>

        <div className="mb-6 flex flex-col items-center text-center">
          <span aria-hidden className="mb-3 flex h-16 w-16 items-center justify-center rounded-full border-4 border-orange-500 text-orange-600">
            <span className="material-symbols-outlined text-[28px]">phonelink_lock</span>
          </span>
          <p className="text-label-sm font-label-sm uppercase tracking-wide text-text-disabled">Industrial Trade Gateway</p>
          <h1 className="text-headline-md font-headline-md font-bold text-graphite-900">Securely processing your order</h1>
          <p className="mt-1 text-body-sm font-body-sm text-text-secondary">Contacting merchant clearing system and verifying tokenized credentials.</p>
        </div>

        <p className="mb-6 flex items-start gap-2 rounded-lg bg-orange-50 p-3 text-body-sm font-body-sm text-orange-700">
          <span aria-hidden className="material-symbols-outlined text-[18px]">warning</span>
          Please do not close, refresh, or navigate away from this window while your order is held for this session.
        </p>

        <ul className="mb-6 flex flex-col gap-2">
          {STAGES.map((stage, i) => (
            <li
              key={stage.label}
              className={`flex items-center justify-between rounded-lg border p-3 text-label-md font-label-md ${
                i === 1 ? "border-orange-500 bg-orange-50" : "border-border-default"
              }`}
            >
              <span className="flex items-center gap-2">
                {i === 0 ? (
                  <span aria-hidden className="material-symbols-outlined text-[16px] text-success-500">check_circle</span>
                ) : (
                  <span aria-hidden className={`h-2 w-2 rounded-full ${i === 1 ? "bg-orange-500" : "bg-text-disabled"}`} />
                )}
                {stage.label}
              </span>
              <span className={i === 0 ? "text-success-500" : i === 1 ? "text-orange-600" : "text-text-disabled"}>{stage.status}</span>
            </li>
          ))}
        </ul>

        <div className="mb-6 rounded-xl border border-graphite-700 bg-graphite-900 p-5 text-text-inverse">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-headline-sm text-headline-sm font-bold">BARCLAYS</span>
            <span className="text-label-sm font-label-sm">Visa Secure Challenge</span>
          </div>
          <p className="mb-4 text-body-sm font-body-sm text-text-inverse-muted">
            We have sent a 6-digit one-time confirmation passcode to your registered mobile phone ending in ••••456.
          </p>
          <div className="mb-2 flex items-center justify-between text-label-sm font-label-sm text-text-inverse-muted">
            <span>One-Time Passcode (OTP)</span>
            <span>
              Code expires in <span className="text-orange-500">{String(Math.floor(seconds / 60)).padStart(2, "0")}:{String(seconds % 60).padStart(2, "0")}</span>
            </span>
          </div>
          <div className="mb-4 flex justify-center gap-2">
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputsRef.current[i] = el;
                }}
                value={digit}
                onChange={(e) => handleDigit(i, e.target.value)}
                inputMode="numeric"
                maxLength={1}
                aria-label={`OTP digit ${i + 1}`}
                className="h-12 w-10 rounded-lg border border-graphite-600 bg-surface-white text-center text-body-lg font-body-lg font-bold text-text-primary focus:border-orange-500 focus:outline-none"
              />
            ))}
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || otp.some((d) => !d)}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-surface-white py-3 font-label-lg text-label-lg font-bold text-graphite-900 disabled:opacity-60"
          >
            <span aria-hidden className="material-symbols-outlined text-[18px]">fingerprint</span>
            {submitting ? "Authorizing…" : `Submit & Authorize Payment (${formatPrice(total)})`}
          </button>
          <div className="mt-3 flex items-center justify-between text-label-sm font-label-sm">
            <button type="button" className="underline">Resend SMS Code</button>
            <button type="button" onClick={onDeclined} className="flex items-center gap-1 text-error-500">
              <span aria-hidden className="material-symbols-outlined text-[14px]">cancel</span>
              Simulate decline (demo)
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-label-sm font-label-sm text-text-secondary">
          <span>PCI-DSS Tier-1 Compliant</span>
          <span>No Unencrypted Card Storage</span>
          <span>ISO 27001 Certified Vault</span>
        </div>
      </div>
    </div>
  );
}
