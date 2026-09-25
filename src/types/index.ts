export type StockStatus = "in-stock" | "low-stock" | "out-of-stock" | "backorder";

export interface QuantityTier {
  minQty: number;
  unitPriceExVat: number;
  savePct: number;
}

export interface ProductVariant {
  id: number;
  label: string;
  skuSuffix: string;
  priceIncVat: number;
  compareAtIncVat?: number;
  stockQty?: number;
  quantityTiers?: QuantityTier[];
}

export interface Product {
  id: number;
  slug: string;
  /** Variant to use when the caller hasn't picked one explicitly (cards, quick-add) - cart lines are always keyed by variant. */
  defaultVariantId?: number;
  sku: string;
  brand: string;
  name: string;
  categorySlug: string;
  categoryLabel: string;
  image: string;
  images: string[];
  videos?: string[];
  /** Battery/tool ecosystem this product belongs to, e.g. "DeWalt 18V XR" - undefined if it isn't part of one. */
  toolPlatform?: string;
  priceIncVat: number;
  compareAtIncVat?: number;
  vatRate: number;
  tradePriceIncVat?: number;
  rating: number;
  reviewCount: number;
  stock: StockStatus;
  stockCount?: number;
  deliveryEta: string;
  badges?: string[];
  specs: { label: string; value: string }[];
  highlights: { icon: string; label: string; value: string; caption: string }[];
  variants?: ProductVariant[];
  quantityTiers?: QuantityTier[];
  description: string;
  whatsInTheBox: string[];
  mpn?: string;
  gtin?: string;
  /** Search-engine metadata from the admin; `indexable: false` means the page must not be indexed. */
  seo?: { title?: string; description?: string; indexable: boolean };
}

export interface Category {
  slug: string;
  name: string;
  icon: string;
  productCount: number;
  parentSlug?: string;
}

export interface CartLine {
  productId: number;
  variantId: number;
  qty: number;
  savedForLater?: boolean;
}

export interface Address {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  postcode: string;
  phone: string;
}


export interface Review {
  id: number;
  author: string;
  verified: boolean;
  rating: number;
  title: string;
  body: string;
  date: string;
  helpfulCount: number;
}
