"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { listPaymentMethods } from "@/lib/payments";
import { cn } from "@/lib/utils";

export type PaymentMethodId = "stripe" | "paypal";

const OPTIONS: { id: PaymentMethodId; provider: string; title: string; detail: string; badge: string; icon: string }[] = [
  { id: "stripe", provider: "STRIPE", title: "Credit or Debit Card", detail: "You'll enter your card details on Stripe's secure payment page.", badge: "VISA · Mastercard · AMEX", icon: "credit_card" },
  { id: "paypal", provider: "PAYPAL", title: "PayPal", detail: "You'll be sent to PayPal to approve the payment, then brought straight back here.", badge: "PayPal balance · bank · card", icon: "account_balance_wallet" },
];

interface StepPaymentProps {
  onContinue: (method: PaymentMethodId) => void;
  onBack: () => void;
}

export function StepPayment({ onContinue, onBack }: StepPaymentProps) {
  const [enabled, setEnabled] = useState<string[] | null>(null);
  const [method, setMethod] = useState<PaymentMethodId | null>(null);

  useEffect(() => {
    listPaymentMethods()
      .then((methods) => setEnabled(methods.filter((m) => m.enabled).map((m) => m.provider)))
      .catch(() => setEnabled([]));
  }, []);

  const available = OPTIONS.filter((option) => enabled?.includes(option.provider));
  const selected = method && available.some((option) => option.id === method) ? method : (available[0]?.id ?? null);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-headline-lg-mobile font-headline-lg-mobile font-bold text-graphite-900 sm:text-headline-lg sm:font-headline-lg">
          Choose a Payment Method
        </h1>
        <span className="hidden items-center gap-1 text-label-sm font-label-sm font-semibold text-success-500 sm:flex">
          <span aria-hidden className="material-symbols-outlined text-[16px]">lock</span>
          Secure Payment
        </span>
      </div>
      <p className="-mt-4 flex items-center gap-1.5 rounded-lg bg-orange-50 p-3 text-label-md font-label-md text-orange-700">
        <span aria-hidden className="material-symbols-outlined text-[18px]">shield</span>
        Payments are handled by our payment partners. Buildivo never sees or stores your card number or CVV.
      </p>

      {enabled === null ? (
        <p role="status" className="text-body-sm font-body-sm text-text-secondary">Loading payment options…</p>
      ) : available.length === 0 ? (
        <p role="alert" className="rounded-lg bg-error-100 p-4 text-body-sm font-body-sm text-error-500">
          No payment methods are available right now. Please try again shortly or contact the trade desk.
        </p>
      ) : (
        <RadioGroup value={selected ?? undefined} onValueChange={(v) => setMethod(v as PaymentMethodId)} className="flex flex-col gap-4">
          {available.map((option) => (
            <div key={option.id} className={cn("rounded-xl border bg-surface-white p-5", selected === option.id ? "border-orange-500" : "border-border-default")}>
              <label htmlFor={`pm-${option.id}`} className="flex cursor-pointer items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-body-md font-body-md font-bold text-graphite-900">
                  <RadioGroupItem value={option.id} id={`pm-${option.id}`} />
                  <span aria-hidden className="material-symbols-outlined text-[20px]">{option.icon}</span>
                  {option.title}
                </span>
                <span className="hidden text-label-sm font-label-sm text-text-disabled sm:flex">{option.badge}</span>
              </label>
              {selected === option.id && <p className="mt-3 text-body-sm font-body-sm text-text-secondary">{option.detail}</p>}
            </div>
          ))}
        </RadioGroup>
      )}

      <div className="flex items-center justify-between">
        <Button type="button" variant="ghost" onClick={onBack}>
          <span aria-hidden className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Delivery Details
        </Button>
        <Button className="bg-orange-500 font-label-lg text-label-lg font-bold hover:bg-orange-600" disabled={!selected} onClick={() => selected && onContinue(selected)}>
          Continue to Review Order
          <span aria-hidden className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </Button>
      </div>
    </div>
  );
}
