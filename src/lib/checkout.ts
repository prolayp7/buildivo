import type { DeliveryMethodId } from "@/types";

export const DELIVERY_METHODS: { id: DeliveryMethodId; label: string; price: number; eta: string; icon: string }[] = [
  { id: "standard", label: "Standard Next-Day Tracked Courier", price: 0, eta: "Tomorrow, 08:00 – 18:00 · 1-hour delivery window SMS", icon: "local_shipping" },
  { id: "express", label: "Express Priority Morning Guaranteed", price: 9.95, eta: "Guaranteed delivery before 10:30am", icon: "bolt" },
  { id: "saturday", label: "Saturday Guaranteed Commercial", price: 14.5, eta: "Saturday 08:00 – 13:00 for weekend trades", icon: "event_available" },
  { id: "click-collect", label: "Click & Collect at Trade Depot", price: 0, eta: "Ready in 30 minutes · Central London Depot", icon: "storefront" },
];

export const FREE_DELIVERY_THRESHOLD = 75;

export const COUPONS: Record<string, { label: string; discountPct: number }> = {
  BUILD10: { label: "BUILD10 Applied", discountPct: 10 },
};

export function vatAmount(subtotal: number, vatRate = 0.2) {
  return subtotal - subtotal / (1 + vatRate);
}

export const DEFAULT_CHECKOUT_COUPON = "BUILD10";

export function applyCoupon(subtotal: number, code: string | null) {
  const coupon = code ? COUPONS[code] : undefined;
  const discount = coupon ? (subtotal * coupon.discountPct) / 100 : 0;
  return Math.max(0, subtotal - discount);
}
