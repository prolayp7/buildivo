"use client";

import { createIdempotencyKey, request } from "./storefront-client";

export type PaymentProvider = "STRIPE" | "PAYPAL";

// Where the checkout page restores an order from after the provider redirects back.
export const CHECKOUT_RETURN_KEY = "buildivo.checkoutReturn";

export interface PaymentMethodInfo {
  provider: string;
  enabled: boolean;
}
export function listPaymentMethods(): Promise<PaymentMethodInfo[]> {
  return request("payments/methods");
}

export interface PaymentAttempt {
  attemptId: string;
  orderUuid: string;
  provider: PaymentProvider;
  status: string;
  amount: string;
  currency: string;
  redirectUrl: string | null;
  error: { code: string; message: string; retryable: boolean } | null;
  expiresAt: string | null;
}

/** A fresh idempotency key per call: a customer retrying after a declined or
 * cancelled payment should get a new provider session, not the old (possibly
 * expired) one back. */
export function createPaymentAttempt(input: { orderUuid: string; email: string; provider: PaymentProvider }): Promise<PaymentAttempt> {
  return request("payments/attempts", { method: "POST", body: JSON.stringify(input), headers: { "Idempotency-Key": createIdempotencyKey() } });
}

export function capturePaymentAttempt(attemptId: string, email: string): Promise<PaymentAttempt> {
  return request(`payments/attempts/${encodeURIComponent(attemptId)}/capture`, { method: "POST", body: JSON.stringify({ email }) });
}
