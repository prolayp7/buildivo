import type { ShippingQuote } from "@/lib/storefront-client";

// Delivery methods, their prices and coupon codes all come from the API (admin > Shipping / Coupons);
// nothing about them is defined here. This threshold only drives the cart's "free delivery" progress hint.
export const FREE_DELIVERY_THRESHOLD = 75;

/** The VAT already contained in a VAT-inclusive amount (prices are never VAT-exclusive on this site). */
export function vatAmount(amountIncVat: number, vatRate = 0.2) {
  return amountIncVat - amountIncVat / (1 + vatRate);
}

/** Human wording for a shipping method's delivery window. */
export function deliveryEstimate(quote: Pick<ShippingQuote, "estimatedDaysMin" | "estimatedDaysMax">) {
  const { estimatedDaysMin: min, estimatedDaysMax: max } = quote;
  if (min === null && max === null) return "Delivery time confirmed at dispatch";
  const from = min ?? max!;
  const to = max ?? min!;
  if (from === 1 && to === 1) return "Next working day";
  return from === to ? `${from} working days` : `${from}-${to} working days`;
}
