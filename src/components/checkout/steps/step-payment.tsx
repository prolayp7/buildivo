"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

export type PaymentMethodId = "card" | "trade-net30" | "wallet" | "bacs";

const cardSchema = z.object({
  cardName: z.string().min(2, "Enter the name on the card"),
  cardNumber: z.string().regex(/^[\d\s]{16,19}$/, "Enter a valid 16-digit card number"),
  expiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Use MM/YY format"),
  cvc: z.string().regex(/^\d{3,4}$/, "Enter the 3 or 4 digit security code"),
});
export type CardFields = z.infer<typeof cardSchema>;

interface StepPaymentProps {
  onContinue: (method: PaymentMethodId) => void;
  onBack: () => void;
}

export function StepPayment({ onContinue, onBack }: StepPaymentProps) {
  const [method, setMethod] = useState<PaymentMethodId>("card");
  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors, isSubmitted },
  } = useForm<CardFields>({ resolver: zodResolver(cardSchema) });

  useEffect(() => {
    if (!isSubmitted) return;
    const first = (Object.keys(errors) as (keyof CardFields)[])[0];
    if (first) setFocus(first);
  }, [errors, isSubmitted, setFocus]);

  function handleContinue() {
    if (method === "card") {
      handleSubmit(() => onContinue("card"))();
      return;
    }
    onContinue(method);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-headline-lg-mobile font-headline-lg-mobile font-bold text-graphite-900 sm:text-headline-lg sm:font-headline-lg">
          Choose a Payment Method
        </h1>
        <span className="hidden items-center gap-1 text-label-sm font-label-sm font-semibold text-success-500 sm:flex">
          <span aria-hidden className="material-symbols-outlined text-[16px]">lock</span>
          Tier-4 Encrypted Gateway
        </span>
      </div>
      <p className="-mt-4 flex items-center gap-1.5 rounded-lg bg-orange-50 p-3 text-label-md font-label-md text-orange-700">
        <span aria-hidden className="material-symbols-outlined text-[18px]">shield</span>
        All transactions are encrypted with 256-bit SSL. Buildivo does not store full credit card numbers or CVV credentials.
      </p>

      <RadioGroup value={method} onValueChange={(v) => setMethod(v as PaymentMethodId)} className="flex flex-col gap-4">
        <div className={cn("rounded-xl border p-5", method === "card" ? "border-orange-500" : "border-border-default", "bg-surface-white")}>
          <label htmlFor="pm-card" className="flex cursor-pointer items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-body-md font-body-md font-bold text-graphite-900">
              <RadioGroupItem value="card" id="pm-card" />
              Credit or Debit Card
            </span>
            <span className="hidden gap-1 text-label-sm font-label-sm text-text-disabled sm:flex">VISA · Mastercard · AMEX · Maestro</span>
          </label>

          {method === "card" && (
            <form className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
              <div className="sm:col-span-2">
                <Label htmlFor="cardName" className="mb-1">Cardholder Name</Label>
                <Input id="cardName" autoComplete="cc-name" aria-invalid={Boolean(errors.cardName)} {...register("cardName")} />
                {errors.cardName && <p role="alert" className="mt-1 text-label-sm font-label-sm text-error-500">{errors.cardName.message}</p>}
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="cardNumber" className="mb-1">Card Number</Label>
                <Input id="cardNumber" inputMode="numeric" autoComplete="cc-number" placeholder="4532 1234 1234 8842" aria-invalid={Boolean(errors.cardNumber)} {...register("cardNumber")} />
                {errors.cardNumber && <p role="alert" className="mt-1 text-label-sm font-label-sm text-error-500">{errors.cardNumber.message}</p>}
              </div>
              <div>
                <Label htmlFor="expiry" className="mb-1">Expiry Date</Label>
                <Input id="expiry" autoComplete="cc-exp" placeholder="MM/YY" aria-invalid={Boolean(errors.expiry)} {...register("expiry")} />
                {errors.expiry && <p role="alert" className="mt-1 text-label-sm font-label-sm text-error-500">{errors.expiry.message}</p>}
              </div>
              <div>
                <Label htmlFor="cvc" className="mb-1">Security CVV / CVC</Label>
                <Input id="cvc" inputMode="numeric" autoComplete="cc-csc" aria-invalid={Boolean(errors.cvc)} {...register("cvc")} />
                {errors.cvc && <p role="alert" className="mt-1 text-label-sm font-label-sm text-error-500">{errors.cvc.message}</p>}
              </div>
              <p className="text-label-sm font-label-sm text-text-secondary sm:col-span-2">This is a prototype — no real card details are transmitted or stored.</p>
            </form>
          )}
        </div>

        <div className={cn("rounded-xl border p-5", method === "trade-net30" ? "border-orange-500 bg-graphite-900 text-text-inverse" : "border-border-default bg-graphite-900 text-text-inverse")}>
          <label htmlFor="pm-trade" className="flex cursor-pointer items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-body-md font-body-md font-bold">
              <RadioGroupItem value="trade-net30" id="pm-trade" />
              Trade Account — Pay on Net 30
            </span>
            <span className="rounded-full bg-orange-500 px-2 py-0.5 text-label-sm font-label-sm font-bold">Pre-Approved</span>
          </label>
          {method === "trade-net30" && (
            <div className="mt-4 flex flex-col gap-3">
              <div className="flex items-center justify-between text-label-sm font-label-sm">
                <span>Apex Mechanical &amp; Electrical Ltd</span>
                <span className="text-text-inverse-muted">ACC: #BLD-88219-UK</span>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between text-label-sm font-label-sm text-text-inverse-muted">
                  <span>Credit Allocation</span>
                  <span>£12,500.00 Authorized Limit</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-graphite-700">
                  <div className="h-full w-[97%] bg-success-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div>
                  <p className="text-label-sm font-label-sm text-text-inverse-muted">Available Credit</p>
                  <p className="text-body-sm font-body-sm font-bold">£12,500.00</p>
                </div>
                <div>
                  <p className="text-label-sm font-label-sm text-text-inverse-muted">This Order</p>
                  <p className="text-body-sm font-body-sm font-bold text-orange-500">Ex. VAT</p>
                </div>
                <div>
                  <p className="text-label-sm font-label-sm text-text-inverse-muted">Invoice Terms</p>
                  <p className="text-body-sm font-body-sm font-bold">Net 30</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="po-number" className="mb-1 text-text-inverse-muted">Purchase Order (PO) Number</Label>
                  <Input id="po-number" defaultValue="PO-2025-084-B" className="bg-graphite-800 text-text-inverse" />
                </div>
                <div>
                  <Label htmlFor="job-ref" className="mb-1 text-text-inverse-muted">Job Reference / Cost Centre</Label>
                  <Input id="job-ref" defaultValue="BATTERSEA-PHASE-3" className="bg-graphite-800 text-text-inverse" />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={cn("rounded-xl border p-5", method === "wallet" ? "border-orange-500" : "border-border-default", "bg-surface-white")}>
          <label htmlFor="pm-wallet" className="flex cursor-pointer items-center gap-2 text-body-md font-body-md font-bold text-graphite-900">
            <RadioGroupItem value="wallet" id="pm-wallet" />
            Instant Express Digital Wallets
          </label>
          {method === "wallet" && (
            <div className="mt-4 grid grid-cols-3 gap-3">
              {["Apple Pay", "Google Pay", "PayPal"].map((wallet) => (
                <button
                  key={wallet}
                  type="button"
                  onClick={() => toast.info(`${wallet} isn't wired up in this prototype — continue to select it as your method.`)}
                  className="rounded-lg border border-border-default bg-graphite-900 py-3 text-label-md font-label-md font-bold text-text-inverse"
                >
                  {wallet}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={cn("rounded-xl border p-5", method === "bacs" ? "border-orange-500" : "border-border-default", "bg-surface-white")}>
          <label htmlFor="pm-bacs" className="flex cursor-pointer items-center gap-2 text-body-md font-body-md font-bold text-graphite-900">
            <RadioGroupItem value="bacs" id="pm-bacs" />
            Direct BACS / Bank Wire Transfer
          </label>
          {method === "bacs" && (
            <p className="mt-3 text-body-sm font-body-sm text-text-secondary">
              For enterprise and contractor tenders. A pro-forma VAT invoice will be instantly transmitted to accounts; goods dispatched upon verified funds settlement.
            </p>
          )}
        </div>
      </RadioGroup>

      <div className="flex items-center justify-between">
        <Button type="button" variant="ghost" onClick={onBack}>
          <span aria-hidden className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Delivery Details
        </Button>
        <Button className="bg-orange-500 font-label-lg text-label-lg font-bold hover:bg-orange-600" onClick={handleContinue}>
          Continue to Review Order
          <span aria-hidden className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </Button>
      </div>
    </div>
  );
}
