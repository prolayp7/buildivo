"use client";

/**
 * Client-side transport for the storefront API's interactive surface (cart,
 * shipping quotes, coupons, checkout) - everything that needs a real browser
 * session (guest token), unlike the read-only catalog fetchers in
 * src/lib/api.ts which run server-side. Adapted from ukcshop's
 * storefront-client.ts, trimmed to guest-only: this design's Account page is
 * explicitly out of scope ("anonymous storefront journey" only), so there is
 * no bearer-token/login flow here, only the guest cart token.
 */

const GUEST_TOKEN_KEY = "buildivo.guestToken";

function lsGet(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}
function lsSet(key: string, value: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    // ignore quota/availability errors
  }
}

export function readGuestToken(): string | null {
  return lsGet(GUEST_TOKEN_KEY);
}
function writeGuestToken(value: string | null) {
  lsSet(GUEST_TOKEN_KEY, value);
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function apiUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_BUILDIVO_API_URL ?? "http://localhost:3000/api/v1";
  return `${base.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

/** Core request helper: attaches the guest cart token and captures a
 * freshly-minted one from cart-shaped responses. */
export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  const guestToken = readGuestToken();
  if (guestToken) headers.set("X-Guest-Token", guestToken);

  const res = await fetch(apiUrl(path), { ...init, headers });
  if (res.status === 204) return undefined as T;
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errors = body?.error?.details?.errors;
    const message = (Array.isArray(errors) ? errors[0] : undefined) ?? body?.error?.message ?? `Request failed (${res.status})`;
    throw new ApiError(message, res.status);
  }
  const data = (body?.data ?? body) as T;
  if (data && typeof data === "object" && "guestToken" in (data as object)) {
    const token = (data as { guestToken?: string | null }).guestToken;
    if (token) writeGuestToken(token);
  }
  return data;
}

/* -------------------------------- Cart ---------------------------------- */

export interface CartLineApi {
  productVariantId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  lineSubtotal: number;
  onSale: boolean;
  savedForLater: boolean;
  variant: { id: number; title: string; price: string; salePrice: string | null; stockQty: number; product: { id: number; title: string; slug: string } };
}
export interface CartData {
  guestToken: string | null;
  items: CartLineApi[];
  savedForLater: CartLineApi[];
  subtotal: number;
  totalWeightKg: number;
}

export function fetchCart(): Promise<CartData> {
  return request<CartData>("cart");
}
export function addCartItem(productVariantId: number, quantity = 1): Promise<CartData> {
  return request<CartData>("cart/items", { method: "POST", body: JSON.stringify({ productVariantId, quantity }) });
}
export function updateCartItem(productVariantId: number, patch: { quantity?: number; savedForLater?: boolean }): Promise<CartData> {
  return request<CartData>(`cart/items/${productVariantId}`, { method: "PATCH", body: JSON.stringify(patch) });
}
export function removeCartItem(productVariantId: number): Promise<CartData> {
  return request<CartData>(`cart/items/${productVariantId}`, { method: "DELETE" });
}
export function addBundleToCart(slug: string): Promise<CartData> {
  return request<CartData>(`bundles/${encodeURIComponent(slug)}/add-to-cart`, { method: "POST" });
}
export function validateCoupon(code: string): Promise<{ code: string; discountType: string; discountAmount: number; freeShipping: boolean }> {
  return request("cart/coupon/validate", { method: "POST", body: JSON.stringify({ code }) });
}

/* ----------------------------- Shipping ---------------------------------- */

export interface ShippingQuote {
  id: number;
  title: string;
  carrier: string;
  /** Delivery charge, VAT-inclusive; 0 once the order qualifies for free delivery. */
  rate: number;
  estimatedDaysMin: number | null;
  estimatedDaysMax: number | null;
}
export function fetchShippingQuotes(): Promise<ShippingQuote[]> {
  return request<ShippingQuote[]>("shipping-methods");
}

/* ------------------------------ Checkout ---------------------------------- */

export interface CheckoutAddress {
  fullName: string;
  companyName?: string;
  line1: string;
  line2?: string;
  city: string;
  county?: string;
  postcode: string;
  country?: string;
  phone?: string;
}
export interface CheckoutInput {
  email: string;
  phone?: string;
  shippingAddress: CheckoutAddress;
  shippingMethodId: number;
  couponCode?: string;
  customerNote?: string;
}
export interface OrderResult {
  uuid: string;
  orderNumber: string;
  status: string;
  subtotal: string;
  shippingCharge: string;
  vatTotal: string;
  total: string;
  items: { titleSnapshot: string; variantTitleSnapshot: string; quantity: number; subtotal: string }[];
  shippingAddress?: string;
  shippingCity?: string;
  shippingPostcode?: string;
}
export interface PlacedOrder extends OrderResult {
  email: string;
}
/** Goes through the site's own /api/checkout route so a signed-in customer's session
 * cookie is attached (the order then shows up in their account). The idempotency key
 * makes a double click or retry return the same order instead of a second one. */
export async function placeOrder(input: CheckoutInput, idempotencyKey?: string): Promise<PlacedOrder> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const guestToken = readGuestToken();
  if (guestToken) headers["X-Guest-Token"] = guestToken;
  if (idempotencyKey) headers["Idempotency-Key"] = idempotencyKey;
  const res = await fetch("/api/checkout", { method: "POST", headers, body: JSON.stringify(input) });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errors = body?.error?.details?.errors;
    throw new ApiError((Array.isArray(errors) ? errors[0] : undefined) ?? body?.error?.message ?? body?.message ?? `Request failed (${res.status})`, res.status);
  }
  return (body.data ?? body) as PlacedOrder;
}

/* ---------------------------- Order tracking ------------------------------ */

export interface TrackedOrder {
  orderNumber: string;
  status: string;
  placedAt: string;
  shippingMethod: { title: string; carrier: string } | null;
  trackingCarrier: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  items: { titleSnapshot: string; variantTitleSnapshot: string; quantity: number }[];
  history: { toStatus: string; createdAt: string }[];
  shipments: { carrier: string; trackingNumber: string | null; trackingUrl: string | null; estimatedDeliveryAt: string | null; deliveredAt: string | null; events: { status: string; description: string | null; location: string | null; occurredAt: string }[] }[];
}
/** Public lookup: needs the order number and the email address on the order - no sign-in. */
export function trackOrder(orderNumber: string, email: string): Promise<TrackedOrder> {
  return request<TrackedOrder>("orders/track", { method: "POST", body: JSON.stringify({ orderNumber, email }) });
}

/* ------------------------------ Quotes (RFQ) ------------------------------ */

export interface QuoteRequestInput { contactName: string; email: string; companyName?: string; phone?: string; message?: string; items: { productVariantId: number; quantity: number }[] }
/** Goes through the site's own route so a signed-in customer's session is attached and the
 * request appears under Account > Quote requests (a direct browser call would be a guest quote). */
export async function submitQuoteRequest(input: QuoteRequestInput): Promise<{ uuid: string }> {
  const res = await fetch("/api/customer-session/quotes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errors = body?.error?.details?.errors;
    throw new ApiError((Array.isArray(errors) ? errors[0] : undefined) ?? body?.error?.message ?? body?.message ?? `Request failed (${res.status})`, res.status);
  }
  return (body.data ?? body) as { uuid: string };
}

/* ---------------------------- Product Q&A --------------------------------- */

export function askProductQuestion(slug: string, input: { name: string; question: string }): Promise<{ id: number }> {
  return request(`products/${encodeURIComponent(slug)}/questions`, { method: "POST", body: JSON.stringify(input) });
}

/* ------------------------- Wishlist / compare data ------------------------- */
// Client-safe reads for pages that resolve real products from browser-only
// state (the wishlist/compare id lists live in localStorage via the cart
// store) - can't go through lib/api.ts, which is server-only.

import { toProduct, type ApiProductBase, type ProductListMeta } from "./adapters";
import type { Product } from "@/types";

function apiOrigin(): string {
  return new URL(apiUrl("")).origin;
}

export async function fetchProductsByIds(ids: number[]): Promise<Product[]> {
  if (!ids.length) return [];
  const res = await request<ApiProductBase[]>(`products?ids=${ids.join(",")}`);
  const origin = apiOrigin();
  const byId = new Map(res.map((p) => [p.id, toProduct(p, origin)]));
  return ids.map((id) => byId.get(id)).filter((p): p is Product => Boolean(p));
}

// Category listing's filter/pagination fetcher - request() unwraps to just
// `data`, discarding `meta` (facets, pagination), which a filtered/paginated
// listing needs, so this fetches directly rather than going through it.
export async function fetchProductsPage(queryString: string, signal?: AbortSignal): Promise<{ items: Product[]; meta: ProductListMeta }> {
  const res = await fetch(apiUrl(`products?${queryString}`), { signal });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  const body = (await res.json()) as { data: ApiProductBase[]; meta: ProductListMeta };
  const origin = apiOrigin();
  return { items: body.data.map((p) => toProduct(p, origin)), meta: body.meta };
}

export interface CompareResult {
  products: {
    id: number; title: string; slug: string; image: string | null; brand: string | null;
    category: { title: string; slug: string; parent: { title: string; slug: string } | null };
    vatRatePercent: string | null; price: string | null; salePrice: string | null;
    inStock: boolean; stockQty: number; defaultVariantId: number | null;
    reviewSummary: { average: number; count: number };
  }[];
  specifications: { key: string; values: (string | null)[] }[];
}
export function fetchCompareProducts(ids: number[]): Promise<CompareResult> {
  return request<CompareResult>(`products/compare?ids=${ids.join(",")}`);
}

// Real order co-occurrence ("customers who bought this also bought"), not a
// fabricated cross-sell list.
export async function fetchFrequentlyBoughtTogether(slug: string, limit = 3): Promise<Product[]> {
  const res = await request<ApiProductBase[]>(`products/${encodeURIComponent(slug)}/frequently-bought-together?limit=${limit}`);
  return res.map((p) => toProduct(p, apiOrigin()));
}

/* ------------------------- Header search suggestions ------------------------- */

export async function fetchProductSuggestions(q: string, signal?: AbortSignal): Promise<Product[]> {
  const res = await request<ApiProductBase[]>(`products?q=${encodeURIComponent(q)}&perPage=5`, { signal });
  return res.map((p) => toProduct(p, apiOrigin()));
}

export interface ApiBrandRef {
  title: string;
  slug: string;
}
// Brand names are static reference data, small enough to fetch once and
// filter client-side per keystroke rather than round-tripping per keystroke.
let brandsCache: Promise<ApiBrandRef[]> | null = null;
export function fetchBrandsClient(): Promise<ApiBrandRef[]> {
  if (!brandsCache) {
    brandsCache = request<ApiBrandRef[]>("brands").catch((error) => { brandsCache = null; throw error; });
  }
  return brandsCache;
}
