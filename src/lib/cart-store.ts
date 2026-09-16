"use client";

import { create } from "zustand";
import type { CartLine } from "@/types";
import { addCartItem, fetchCart, readGuestToken, removeCartItem, updateCartItem, type CartData, type CartLineApi } from "./storefront-client";

// Default UK standard VAT rate, used only to estimate an inc-VAT display
// price for cart lines - the cart API returns ex-VAT unitPrice without a
// per-line tax rate (that requires the full product record). The real,
// authoritative VAT breakdown comes back from the order response at
// checkout; this is a pre-checkout estimate only, same assumption already
// used as the default in lib/checkout.ts.
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

interface CartState {
  raw: CartData | null;
  loaded: boolean;
  lines: CartLine[];
  wishlist: number[];
  compare: number[];
  lastOrder: LastOrder | null;
  load: () => Promise<void>;
  addItem: (variantId: number, qty?: number) => Promise<void>;
  removeItem: (productId: number, variantId: number) => Promise<void>;
  setQty: (productId: number, qty: number, variantId: number) => Promise<void>;
  toggleSaveForLater: (productId: number, variantId: number) => Promise<void>;
  clear: () => Promise<void>;
  commitOrder: (order: LastOrder) => void;
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
  wishlist: readIds(WISHLIST_KEY),
  compare: readIds(COMPARE_KEY),
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

  commitOrder: (order) => set({ lastOrder: order, raw: null, lines: [] }),

  toggleWishlist: (productId) =>
    set((state) => {
      const wishlist = state.wishlist.includes(productId) ? state.wishlist.filter((id) => id !== productId) : [...state.wishlist, productId];
      writeIds(WISHLIST_KEY, wishlist);
      return { wishlist };
    }),
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

/** Call once on mount (see cart-hydration.tsx) - avoids every consumer
 * triggering its own fetch and racing the guest-token read. */
export function hydrateCart() {
  void useCartStore.getState().load();
}

function findRawLine(raw: CartData | null, line: CartLine): CartLineApi | undefined {
  return raw ? [...raw.items, ...raw.savedForLater].find((item) => item.productVariantId === line.variantId) : undefined;
}

export function lineProduct(line: CartLine): CartLineProduct | undefined {
  const raw = useCartStore.getState().raw;
  const item = findRawLine(raw, line);
  if (!item) return undefined;
  const priceExVat = Number(item.variant.salePrice ?? item.variant.price);
  return {
    id: item.productId,
    slug: item.variant.product.slug,
    name: item.variant.product.title,
    image: "",
    categorySlug: "",
    priceIncVat: Math.round(priceExVat * (1 + DEFAULT_VAT_RATE) * 100) / 100,
    compareAtIncVat: item.variant.salePrice ? Math.round(Number(item.variant.price) * (1 + DEFAULT_VAT_RATE) * 100) / 100 : undefined,
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
  // item.unitPrice is the API's ex-VAT, tier/bundle-aware price - the
  // authoritative one to use, rather than re-deriving from variant.price.
  return item ? Math.round(item.unitPrice * (1 + DEFAULT_VAT_RATE) * 100) / 100 : 0;
}

export function useCartTotals() {
  const lines = useCartStore((s) => s.lines);
  const raw = useCartStore((s) => s.raw);
  const activeLines = lines.filter((l) => !l.savedForLater);
  const savedLines = lines.filter((l) => l.savedForLater);
  const subtotal = raw ? Math.round(raw.subtotal * (1 + DEFAULT_VAT_RATE) * 100) / 100 : 0;
  const count = activeLines.reduce((sum, l) => sum + l.qty, 0);
  return { subtotal, count, activeLines, savedLines, multiBuySavings: lineMultiBuySavingsTotal(raw) };
}

/** Wholesale/bulk-pricing savings already applied server-side (price tiers) -
 * the gap between what each line would cost at the regular/sale unit price
 * and what it actually costs at its tier-adjusted unitPrice. */
function lineMultiBuySavingsTotal(raw: CartData | null): number {
  if (!raw) return 0;
  return raw.items.reduce((sum, item) => {
    const regular = Number(item.variant.salePrice ?? item.variant.price);
    const saving = (regular - item.unitPrice) * item.quantity;
    return sum + Math.max(0, saving) * (1 + DEFAULT_VAT_RATE);
  }, 0);
}

export function lineMultiBuySaving(line: CartLine): number {
  const raw = useCartStore.getState().raw;
  const item = findRawLine(raw, line);
  if (!item) return 0;
  const regular = Number(item.variant.salePrice ?? item.variant.price);
  return Math.max(0, (regular - item.unitPrice) * item.quantity) * (1 + DEFAULT_VAT_RATE);
}

export { readGuestToken };
