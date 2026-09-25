/**
 * Pure API-shape -> app-shape conversion, shared by both the server-only
 * fetchers in lib/api.ts and the client-safe fetchers in
 * lib/storefront-client.ts (wishlist/compare need to resolve real products
 * from browser-only state, so they can't go through the server-only file).
 * No "use client" needed - nothing here touches the network or the DOM.
 */
import type { Category, Product, ProductVariant, QuantityTier, Review } from "@/types";

// Admin-uploaded media is served statically from the API origin at
// /uploads/<file>, not under /api/v1 - resolve those to absolute URLs the
// browser can fetch. Anything else (bundled placeholders under this repo's
// own public/images) is already correct as-is.
export function resolveMediaUrl(apiOrigin: string, path: string | null | undefined): string | null {
  if (!path) return null;
  if (!path.startsWith("/uploads/")) return path;
  return `${apiOrigin}${path}`;
}

export interface ApiCategoryRef {
  id: number;
  title: string;
  slug: string;
}
export interface ApiCategory extends ApiCategoryRef {
  parentId: number | null;
  description: string | null;
  productCount: number;
  icon: string | null;
  thumbnailImage: string | null;
  coverImage: string | null;
  faqs?: { question: string; answer: string }[];
  parent?: ApiCategoryRef | null;
  children: ApiCategory[];
}

export interface ApiBrand {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  logo: string | null;
  logoAlt: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  productCount?: number;
  priceFrom?: number | null;
}

export interface ApiPriceTier {
  id: number;
  minQty: number;
  unitPrice: string;
}
export interface ApiVariantAttribute {
  attribute: { title: string };
  attributeValue: { value: string };
}
export interface ApiVariant {
  id: number;
  title: string;
  price: string;
  salePrice: string | null;
  stockQty: number;
  isDefault: boolean;
  attributes?: ApiVariantAttribute[];
  priceTiers?: ApiPriceTier[];
  images?: { url: string; altText: string | null }[];
}

export interface ApiProductBase {
  id: number;
  slug: string;
  title: string;
  sku: string | null;
  shortDescription: string | null;
  description?: string | null;
  mpn?: string | null;
  gtin?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  isIndexable?: boolean;
  outOfStockLabel?: string | null;
  inStockDeliveryTime?: string | null;
  outOfStockDeliveryTime?: string | null;
  category: ApiCategoryRef & { parent: ApiCategoryRef | null };
  brand: ApiCategoryRef | null;
  taxRate?: { ratePercent: string } | null;
  price: string | null;
  salePrice: string | null;
  inStock: boolean;
  stockQty?: number;
  defaultVariantId?: number | null;
  image?: string | null;
  images?: { url: string; altText: string | null }[];
  videos?: { url: string; altText: string | null }[];
  toolPlatform?: string | null;
  isFeatured?: boolean;
  specsSummary?: Record<string, unknown> | null;
  reviewSummary?: { average: number; count: number };
  variants?: ApiVariant[];
  faqs?: { id: number; question: string; answer: string }[];
}

export interface ApiFacets {
  specifications: { title: string; values: { value: string; count: number }[] }[];
  categories: { id: number; title: string; slug: string; count: number }[];
  brands: { id: number; title: string; slug: string; count: number }[];
  priceMin: number | null;
  priceMax: number | null;
}
export interface ProductListMeta {
  /** True when no product matched every search word, so results match only some of them. */
  loose?: boolean;
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  facets: ApiFacets;
}

export interface ApiReview {
  id: number;
  rating: number;
  title: string | null;
  comment: string | null;
  reviewerName: string;
  createdAt: string;
}

export function toCategory(api: ApiCategory): Category {
  return {
    slug: api.slug,
    name: api.title,
    icon: api.icon ?? "category",
    productCount: api.productCount,
    parentSlug: api.parentId != null ? api.parent?.slug : undefined,
  };
}

// Admin-curated top nav bar (slug "main") - each item links to either a
// category or a special page (href), set from buildivo-admin's Menus page.
export interface ApiMenuItem {
  label: string;
  href: string | null;
  icon: string | null;
  category: { slug: string; icon: string | null } | null;
}
export interface MainMenuItem {
  label: string;
  href: string;
  icon: string;
}
export function toMainMenuItem(api: ApiMenuItem): MainMenuItem | null {
  if (!api.category && !api.href) return null;
  return {
    label: api.label,
    href: api.category ? `/c/${api.category.slug}` : api.href!,
    icon: api.icon ?? api.category?.icon ?? "category",
  };
}

// Admin-curated footer link columns (slug "footer") - each top-level item is
// a column heading (no link of its own); its children are the column's links.
export interface ApiFooterMenuItem extends ApiMenuItem {
  children: ApiMenuItem[];
}
export interface FooterColumn {
  title: string;
  links: { label: string; href: string }[];
}
export function toFooterColumns(items: ApiFooterMenuItem[]): FooterColumn[] {
  return items.map((column) => ({
    title: column.label,
    links: column.children.map(toMainMenuItem).filter((link): link is MainMenuItem => link !== null),
  }));
}

function variantLabel(variant: ApiVariant): string {
  if (!variant.attributes?.length) return variant.title;
  return variant.attributes.map((a) => `${a.attribute.title}: ${a.attributeValue.value}`).join(" · ");
}

// Quantity-break rows for one variant: the base price first, then each tier, all ex. VAT.
function toQuantityTiers(variant: ApiVariant, vatRate: number): QuantityTier[] | undefined {
  if (!variant.priceTiers?.length) return undefined;
  const base = Number(variant.salePrice ?? variant.price);
  return [
    { minQty: 1, unitPriceExVat: base / (1 + vatRate), savePct: 0 },
    ...variant.priceTiers.map((tier) => ({ minQty: tier.minQty, unitPriceExVat: Number(tier.unitPrice) / (1 + vatRate), savePct: Math.round((1 - Number(tier.unitPrice) / base) * 100) })),
  ];
}

function toVariant(variant: ApiVariant, vatRate: number): ProductVariant {
  return {
    id: variant.id,
    label: variantLabel(variant),
    skuSuffix: `-${variant.id}`,
    priceIncVat: Number(variant.salePrice ?? variant.price),
    compareAtIncVat: variant.salePrice ? Number(variant.price) : undefined,
    stockQty: variant.stockQty,
    quantityTiers: toQuantityTiers(variant, vatRate),
  };
}

export function productImage(api: ApiProductBase): string | null {
  return api.images?.[0]?.url ?? api.image ?? null;
}

export function toProduct(api: ApiProductBase, apiOrigin: string): Product {
  const price = api.price !== null ? Number(api.price) : 0;
  const sale = api.salePrice !== null ? Number(api.salePrice) : null;
  const vatRate = api.taxRate ? Number(api.taxRate.ratePercent) / 100 : 0.2;
  const stockQty = api.variants ? api.variants.reduce((sum, v) => sum + v.stockQty, 0) : api.stockQty ?? (api.inStock ? Infinity : 0);
  const images = (api.images ?? []).map((image) => resolveMediaUrl(apiOrigin, image.url) ?? image.url);
  const videos = (api.videos ?? []).map((video) => resolveMediaUrl(apiOrigin, video.url) ?? video.url);
  const defaultVariant = api.variants?.find((v) => v.isDefault) ?? api.variants?.[0];

  return {
    id: api.id,
    slug: api.slug,
    defaultVariantId: defaultVariant?.id ?? api.defaultVariantId ?? undefined,
    sku: api.sku ?? "",
    brand: api.brand?.title ?? "Unbranded",
    name: api.title,
    categorySlug: api.category.slug,
    categoryLabel: api.category.title,
    image: resolveMediaUrl(apiOrigin, productImage(api)) ?? images[0] ?? "",
    images: images.length ? images : [""],
    videos,
    toolPlatform: api.toolPlatform ?? undefined,
    priceIncVat: sale ?? price,
    compareAtIncVat: sale !== null ? price : undefined,
    vatRate,
    rating: api.reviewSummary?.average ?? 0,
    reviewCount: api.reviewSummary?.count ?? 0,
    stock: stockQty === 0 ? "out-of-stock" : stockQty <= 5 ? "low-stock" : "in-stock",
    stockCount: Number.isFinite(stockQty) ? stockQty : undefined,
    deliveryEta: api.inStock ? api.inStockDeliveryTime ?? "1-3 working days" : api.outOfStockDeliveryTime ?? api.outOfStockLabel ?? "Contact us",
    badges: api.isFeatured ? ["Bestseller"] : undefined,
    specs: api.specsSummary && typeof api.specsSummary === "object" ? Object.entries(api.specsSummary).map(([label, value]) => ({ label, value: String(value) })) : [],
    highlights: [],
    variants: api.variants?.map((variant) => toVariant(variant, vatRate)),
    quantityTiers: defaultVariant?.priceTiers?.length
      ? [
          { minQty: 1, unitPriceExVat: (sale ?? price) / (1 + vatRate), savePct: 0 },
          ...defaultVariant.priceTiers.map((tier) => ({
            minQty: tier.minQty,
            unitPriceExVat: Number(tier.unitPrice) / (1 + vatRate),
            savePct: Math.round((1 - Number(tier.unitPrice) / (sale ?? price)) * 100),
          })),
        ]
      : undefined,
    description: api.description ?? api.shortDescription ?? "",
    mpn: api.mpn ?? undefined,
    gtin: api.gtin ?? undefined,
    seo: { title: api.metaTitle ?? undefined, description: api.metaDescription ?? api.shortDescription ?? undefined, indexable: api.isIndexable !== false },
    whatsInTheBox: (api.faqs ?? []).find((faq) => /included|box/i.test(faq.question))?.answer.split("\n") ?? [],
  };
}

export function toReview(api: ApiReview): Review {
  return {
    id: api.id,
    author: api.reviewerName || "Verified buyer",
    verified: true,
    rating: api.rating,
    title: api.title ?? "",
    body: api.comment ?? "",
    date: api.createdAt,
    helpfulCount: 0,
  };
}
