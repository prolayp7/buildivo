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
    throw new ApiError(Array.isArray(body?.message) ? body.message[0] : body?.message ?? `Request failed (${res.status})`, res.status);
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
export function validateCoupon(code: string): Promise<{ code: string; discountType: string; discountAmount: number; freeShipping: boolean }> {
  return request("cart/coupon/validate", { method: "POST", body: JSON.stringify({ code }) });
}

/* ----------------------------- Shipping ---------------------------------- */

export interface ShippingQuote {
  id: number;
  title: string;
  carrier: string;
  price: number;
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
export function placeOrder(input: CheckoutInput): Promise<OrderResult> {
  return request<OrderResult>("orders", { method: "POST", body: JSON.stringify(input) });
}

/* ------------------------------ Quotes (RFQ) ------------------------------ */

export function submitQuoteRequest(input: { contactName: string; email: string; companyName?: string; phone?: string; message?: string; items: { productVariantId: number; quantity: number }[] }): Promise<{ uuid: string }> {
  return request("quotes", { method: "POST", body: JSON.stringify(input) });
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
  products: { id: number; title: string; slug: string; image: string | null; category: string; brand: string | null; vatRatePercent: string | null; price: string | null; salePrice: string | null }[];
  specifications: { key: string; values: (string | null)[] }[];
}
export function fetchCompareProducts(ids: number[]): Promise<CompareResult> {
  return request<CompareResult>(`products/compare?ids=${ids.join(",")}`);
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
