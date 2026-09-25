"use client";

import { create } from "zustand";
import type { CartLine } from "@/types";
import { addBundleToCart, addCartItem, fetchCart, readGuestToken, removeCartItem, updateCartItem, validateCoupon, type CartData, type CartLineApi } from "./storefront-client";

// Every price the API returns (catalogue, cart line, subtotal, shipping) is VAT-INCLUSIVE, so the
// storefront never adds VAT on top. The cart response has no per-line tax rate, so this default UK rate
// is only used to work out how much VAT is *inside* a price for display; the authoritative breakdown
// comes back from the order response at checkout.
const DEFAULT_VAT_RATE = 0.2;

export interface CartLineProduct {
  id: number;
  slug: string;
  name: string;
  image: string;
  categorySlug: string;
  priceIncVat: number;
  compareAtIncVat?: number;
  vatRate: number;
  stockQty: number;
  stockCount: number;
  stock: "in-stock" | "low-stock" | "out-of-stock";
  deliveryEta: string;
  // Not returned by the cart endpoint (only the line's own variant is
  // included, not the full product/brand/SKU/badges) - left undefined
  // rather than adding a second fetch per cart line just to backfill
  // cosmetic fields the cart page renders conditionally.
  brand?: string;
  sku?: string;
  badges?: string[];
  tradePriceIncVat?: number;
  variants?: { id: number; label: string }[];
}

export interface LastOrder {
  orderNumber: string;
  uuid: string;
  subtotal: number;
  vatTotal: number;
  shippingCharge: number;
  total: number;
  items: { title: string; variantTitle: string; quantity: number; subtotal: number }[];
}

/** A coupon the API has validated against the current cart. */
export interface AppliedCoupon {
  code: string;
  discountAmount: number;
  freeShipping: boolean;
}

interface CartState {
  raw: CartData | null;
  coupon: AppliedCoupon | null;
  /** Why a previously applied coupon stopped applying (e.g. the cart fell below its minimum). */
  couponNotice: string;
  loaded: boolean;
  lines: CartLine[];
  wishlist: number[];
  compare: number[];
  lastOrder: LastOrder | null;
  load: () => Promise<void>;
  addItem: (variantId: number, qty?: number) => Promise<void>;
  addBundle: (slug: string) => Promise<void>;
  removeItem: (productId: number, variantId: number) => Promise<void>;
  setQty: (productId: number, qty: number, variantId: number) => Promise<void>;
  toggleSaveForLater: (productId: number, variantId: number) => Promise<void>;
  clear: () => Promise<void>;
  commitOrder: (order: LastOrder) => void;
  applyCoupon: (code: string) => Promise<{ ok: boolean; message: string }>;
  removeCoupon: () => void;
  revalidateCoupon: () => Promise<void>;
  toggleWishlist: (productId: number) => void;
  toggleCompare: (productId: number) => void;
}

function toCartLine(item: CartLineApi): CartLine {
  return { productId: item.productId, variantId: item.productVariantId, qty: item.quantity, savedForLater: item.savedForLater };
}
function toCartLines(cart: CartData): CartLine[] {
  return [...cart.items, ...cart.savedForLater].map(toCartLine);
}

// Wishlist/compare have no per-line pricing to keep in sync with a live
// cart, just an id list - a plain localStorage mirror is enough, without
// pulling in the full zustand persist middleware (which would also try to
// persist the API-backed `raw`/`lines`, which shouldn't be cached locally).
const WISHLIST_KEY = "buildivo.wishlist";
const COUPON_KEY = "buildivo.coupon";

function readCouponCode(): string | null {
  try { return window.localStorage.getItem(COUPON_KEY); } catch { return null; }
}
function writeCouponCode(code: string | null) {
  try { if (code) window.localStorage.setItem(COUPON_KEY, code); else window.localStorage.removeItem(COUPON_KEY); } catch { /* storage unavailable */ }
}
const COMPARE_KEY = "buildivo.compare";
function readIds(key: string): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as number[]) : [];
  } catch {
    return [];
  }
}
function writeIds(key: string, ids: number[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(ids));
  } catch {
    // ignore quota/availability errors
  }
}

export const useCartStore = create<CartState>()((set, get) => ({
  raw: null,
  loaded: false,
  lines: [],
  coupon: null,
  couponNotice: "",
  // Keep the server and browser initial snapshots identical for hydration.
  wishlist: [],
  compare: [],
  lastOrder: null,

  load: async () => {
    if (typeof window === "undefined") return;
    try {
      const cart = await fetchCart();
      set({ raw: cart, lines: toCartLines(cart), loaded: true });
    } catch {
      set({ loaded: true });
    }
  },

  addItem: async (variantId, qty = 1) => {
    const cart = await addCartItem(variantId, qty);
    set({ raw: cart, lines: toCartLines(cart) });
  },
  addBundle: async (slug) => {
    const cart = await addBundleToCart(slug);
    set({ raw: cart, lines: toCartLines(cart) });
  },
  removeItem: async (_productId, variantId) => {
    const cart = await removeCartItem(variantId);
    set({ raw: cart, lines: toCartLines(cart) });
  },
  setQty: async (_productId, qty, variantId) => {
    if (qty <= 0) return get().removeItem(_productId, variantId);
    const cart = await updateCartItem(variantId, { quantity: qty });
    set({ raw: cart, lines: toCartLines(cart) });
  },
  toggleSaveForLater: async (_productId, variantId) => {
    const current = get().raw;
    const line = current ? [...current.items, ...current.savedForLater].find((item) => item.productVariantId === variantId) : undefined;
    const cart = await updateCartItem(variantId, { savedForLater: !line?.savedForLater });
    set({ raw: cart, lines: toCartLines(cart) });
  },
  clear: async () => {
    const current = get().raw;
    if (!current) return;
    for (const item of current.items) await removeCartItem(item.productVariantId);
    const cart = await fetchCart();
    set({ raw: cart, lines: toCartLines(cart) });
  },

  commitOrder: (order) => {
    writeCouponCode(null);
    set({ lastOrder: order, raw: null, lines: [], coupon: null, couponNotice: "" });
  },

  // Coupons are checked by the API against the real cart (dates, minimum spend, usage limits) - nothing is hardcoded here.
  applyCoupon: async (code) => {
    try {
      const result = await validateCoupon(code.trim());
      writeCouponCode(result.code);
      set({ coupon: { code: result.code, discountAmount: result.discountAmount, freeShipping: result.freeShipping }, couponNotice: "" });
      return { ok: true, message: `Code ${result.code} applied.` };
    } catch (error) {
      return { ok: false, message: error instanceof Error ? error.message : "That code could not be applied." };
    }
  },
  removeCoupon: () => {
    writeCouponCode(null);
    set({ coupon: null, couponNotice: "" });
  },
  // Re-checks the applied (or remembered) code whenever the cart changes, so the discount always matches the basket.
  revalidateCoupon: async () => {
    const code = get().coupon?.code ?? readCouponCode();
    if (!code) return;
    try {
      const result = await validateCoupon(code);
      set({ coupon: { code: result.code, discountAmount: result.discountAmount, freeShipping: result.freeShipping } });
    } catch (error) {
      writeCouponCode(null);
      set({ coupon: null, couponNotice: `${code} was removed: ${error instanceof Error ? error.message : "it no longer applies"}` });
    }
  },

  toggleWishlist: (productId) => {
    const saved = !get().wishlist.includes(productId);
    set((state) => {
      const wishlist = saved ? [...state.wishlist, productId] : state.wishlist.filter((id) => id !== productId);
      writeIds(WISHLIST_KEY, wishlist);
      return { wishlist };
    });
    if (wishlistOnServer) void pushWishlist(productId, saved);
  },
  // Product comparison has no server-side persistence by design (the
  // /products/compare endpoint is stateless, keyed by whatever ids the
  // client sends) - kept as local-only state, same as the mock version.
  toggleCompare: (productId) =>
    set((state) => {
      const compare = state.compare.includes(productId) ? state.compare.filter((id) => id !== productId) : state.compare.length < 4 ? [...state.compare, productId] : state.compare;
      writeIds(COMPARE_KEY, compare);
      return { compare };
    }),
}));

// The wishlist lives in localStorage (works for guests); while a customer is signed in it is also
// mirrored to their account, so it follows them across devices.
let wishlistOnServer = false;

function pushWishlist(productId: number, saved: boolean) {
  return fetch("/api/customer-session/wishlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId, saved }) }).catch(() => undefined);
}

/** Merges the account wishlist with this browser's (union - nothing a shopper saved is lost) and starts
 * mirroring changes. Safe to call for guests: it does nothing. Call on load and right after sign-in. */
export async function syncWishlist() {
  try {
    const response = await fetch("/api/customer-session/wishlist", { cache: "no-store" });
    const body = response.ok ? await response.json() : null;
    wishlistOnServer = Boolean(body?.signedIn);
    if (!wishlistOnServer) return;
    const remote: number[] = body.productIds;
    const local = useCartStore.getState().wishlist;
    const merged = [...new Set([...remote, ...local])];
    writeIds(WISHLIST_KEY, merged);
    useCartStore.setState({ wishlist: merged });
    await Promise.all(local.filter((id) => !remote.includes(id)).map((id) => pushWishlist(id, true)));
  } catch {
    wishlistOnServer = false;
  }
}

/** Sign-out: keep the browser's list but stop writing to the account. */
export function stopWishlistSync() {
  wishlistOnServer = false;
}

/** Call once on mount (see cart-hydration.tsx) - avoids every consumer
 * triggering its own fetch and racing the guest-token read. */
let couponWatch = false;
let localListsHydrated = false;
export function hydrateCart() {
  if (typeof window === "undefined") return;
  // Called from CartHydration's effect, after React's initial render. Restore
  // local lists before account sync so saved guest items are included in the merge.
  if (!localListsHydrated) {
    localListsHydrated = true;
    useCartStore.setState({ wishlist: readIds(WISHLIST_KEY), compare: readIds(COMPARE_KEY) });
  }
  void useCartStore.getState().load().then(() => useCartStore.getState().revalidateCoupon());
  void syncWishlist();
  if (!couponWatch) {
    couponWatch = true;
    // The discount depends on the basket: re-check it whenever the subtotal changes.
    useCartStore.subscribe((state, previous) => {
      if (state.raw?.subtotal !== previous.raw?.subtotal && previous.raw && (state.coupon || readCouponCode())) void state.revalidateCoupon();
    });
  }
}

function findRawLine(raw: CartData | null, line: CartLine): CartLineApi | undefined {
  return raw ? [...raw.items, ...raw.savedForLater].find((item) => item.productVariantId === line.variantId) : undefined;
}

export function lineProduct(line: CartLine): CartLineProduct | undefined {
  const raw = useCartStore.getState().raw;
  const item = findRawLine(raw, line);
  if (!item) return undefined;
  const price = Number(item.variant.salePrice ?? item.variant.price);
  return {
    id: item.productId,
    slug: item.variant.product.slug,
    name: item.variant.product.title,
    image: "",
    categorySlug: "",
    priceIncVat: price,
    compareAtIncVat: item.variant.salePrice ? Number(item.variant.price) : undefined,
    vatRate: DEFAULT_VAT_RATE,
    stockQty: item.variant.stockQty,
    stockCount: item.variant.stockQty,
    stock: item.variant.stockQty === 0 ? "out-of-stock" : item.variant.stockQty <= 5 ? "low-stock" : "in-stock",
    deliveryEta: "1-3 working days",
  };
}

export function lineUnitPrice(line: CartLine): number {
  const raw = useCartStore.getState().raw;
  const item = findRawLine(raw, line);
  // item.unitPrice is the API's VAT-inclusive, tier/bundle-aware price - the
  // authoritative one to use, rather than re-deriving from variant.price.
  return item ? item.unitPrice : 0;
}

export function useCartTotals() {
  const lines = useCartStore((s) => s.lines);
  const raw = useCartStore((s) => s.raw);
  const activeLines = lines.filter((l) => !l.savedForLater);
  const savedLines = lines.filter((l) => l.savedForLater);
  const coupon = useCartStore((s) => s.coupon);
  const subtotal = raw ? raw.subtotal : 0;
  const count = activeLines.reduce((sum, l) => sum + l.qty, 0);
  // Free-shipping coupons carry no money-off amount; their effect is applied to the delivery charge instead.
  const discount = coupon && !coupon.freeShipping ? Math.min(coupon.discountAmount, subtotal) : 0;
  return { subtotal, discount, freeShippingCoupon: Boolean(coupon?.freeShipping), coupon, payable: Math.max(0, Math.round((subtotal - discount) * 100) / 100), count, activeLines, savedLines, multiBuySavings: lineMultiBuySavingsTotal(raw) };
}

/** Wholesale/bulk-pricing savings already applied server-side (price tiers) -
 * the gap between what each line would cost at the regular/sale unit price
 * and what it actually costs at its tier-adjusted unitPrice. */
function lineMultiBuySavingsTotal(raw: CartData | null): number {
  if (!raw) return 0;
  return raw.items.reduce((sum, item) => {
    const regular = Number(item.variant.salePrice ?? item.variant.price);
    const saving = (regular - item.unitPrice) * item.quantity;
    return sum + Math.max(0, saving);
  }, 0);
}

export function lineMultiBuySaving(line: CartLine): number {
  const raw = useCartStore.getState().raw;
  const item = findRawLine(raw, line);
  if (!item) return 0;
  const regular = Number(item.variant.salePrice ?? item.variant.price);
  return Math.max(0, (regular - item.unitPrice) * item.quantity);
}

export { readGuestToken };
