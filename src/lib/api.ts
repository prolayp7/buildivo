/**
 * Server-only client for the Buildivo API. BUILDIVO_API_URL is deliberately
 * not NEXT_PUBLIC_*, so it never reaches the browser - never import this file
 * from a "use client" component. Adapted from ukcshop's src/lib/api.ts:
 * server-side fetching for public, read-only catalog/content endpoints. The
 * actual shape adapters live in lib/adapters.ts, shared with the client-safe
 * fetchers in lib/storefront-client.ts.
 */
import type { Category, Product } from "@/types";
import {
  resolveMediaUrl,
  toCategory,
  toFooterColumns,
  toMainMenuItem,
  toProduct,
  toReview,
  type ApiBrand,
  type ApiCategory,
  type ApiFooterMenuItem,
  type ApiMenuItem,
  type ApiProductBase,
  type ApiReview,
  type FooterColumn,
  type MainMenuItem,
  type ProductListMeta,
} from "./adapters";

const API_BASE = process.env.BUILDIVO_API_URL ?? "http://localhost:3000/api/v1";
const API_ORIGIN = new URL(API_BASE).origin;

function apiUrl(path: string): string {
  return `${API_BASE.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

async function apiGet<T>(path: string, revalidateSeconds = 20): Promise<T> {
  const res = await fetch(apiUrl(path), { next: { revalidate: revalidateSeconds } });
  if (!res.ok) throw new Error(`Buildivo API request failed: GET ${path} -> ${res.status}`);
  return res.json() as Promise<T>;
}

async function apiGetOrNull<T>(path: string, revalidateSeconds = 20): Promise<T | null> {
  const res = await fetch(apiUrl(path), { next: { revalidate: revalidateSeconds } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Buildivo API request failed: GET ${path} -> ${res.status}`);
  const json = (await res.json()) as { data: T };
  return json.data;
}

function resolveCategoryImages(category: ApiCategory): ApiCategory {
  return {
    ...category,
    coverImage: category.coverImage?.startsWith("/uploads/") ? `${API_ORIGIN}${category.coverImage}` : category.coverImage,
    thumbnailImage: category.thumbnailImage?.startsWith("/uploads/") ? `${API_ORIGIN}${category.thumbnailImage}` : category.thumbnailImage,
    children: (category.children ?? []).map(resolveCategoryImages),
  };
}

// Left to Next's own fetch cache for dedup/revalidation - a manual
// module-level cache here would (and previously did) freeze results for the
// life of the server process, never picking up admin changes at all.
function fetchCategoryTreeRaw(): Promise<ApiCategory[]> {
  return apiGet<{ data: ApiCategory[] }>("categories").then((r) => r.data.map(resolveCategoryImages));
}

export async function fetchDepartments(): Promise<Category[]> {
  const tree = await fetchCategoryTreeRaw();
  return tree.map(toCategory);
}

export async function fetchCategoryTree(): Promise<Category[]> {
  const tree = await fetchCategoryTreeRaw();
  return tree.flatMap((department) => [toCategory(department), ...department.children.map((child) => toCategory({ ...child, parent: department }))]);
}

export async function fetchMainMenu(): Promise<MainMenuItem[]> {
  const menu = await apiGet<{ data: { items: ApiMenuItem[] } }>("menus/main");
  return menu.data.items.map(toMainMenuItem).filter((item): item is MainMenuItem => item !== null);
}

export async function fetchFooterMenu(): Promise<FooterColumn[]> {
  const menu = await apiGetOrNull<{ items: ApiFooterMenuItem[] }>("menus/footer");
  return menu ? toFooterColumns(menu.items) : [];
}

// Which homepage sections (src/app/(storefront)/page.tsx) are turned on,
// set from buildivo-admin's Homepage page. Layout/order stay fixed in code.
export async function fetchVisibleHomepageSections(): Promise<Set<string>> {
  const sections = await apiGet<{ data: { type: string }[] }>("homepage-sections");
  return new Set(sections.data.map((section) => section.type));
}

export async function fetchCategoryBySlug(slug: string): Promise<Category | null> {
  const found = (await fetchCategoryTree()).find((c) => c.slug === slug);
  if (found) return found;
  const api = await apiGetOrNull<ApiCategory>(`categories/${encodeURIComponent(slug)}`);
  return api ? toCategory(resolveCategoryImages(api)) : null;
}

function resolveBrandLogo(brand: ApiBrand): ApiBrand {
  return { ...brand, logo: resolveMediaUrl(API_ORIGIN, brand.logo) };
}

export function fetchBrands(): Promise<ApiBrand[]> {
  return apiGet<{ data: ApiBrand[] }>("brands").then((r) => r.data.map(resolveBrandLogo));
}

export async function fetchBrandBySlug(slug: string): Promise<ApiBrand | null> {
  const brand = await apiGetOrNull<ApiBrand>(`brands/${encodeURIComponent(slug)}`);
  return brand ? resolveBrandLogo(brand) : null;
}

export interface ProductListParams {
  q?: string;
  category?: string;
  brand?: string;
  specs?: string;
  priceMin?: number;
  priceMax?: number;
  sort?: "newest" | "price_asc" | "price_desc" | "name_asc" | "name_desc" | "discount_desc";
  onSale?: boolean;
  inStock?: boolean;
  page?: number;
  perPage?: number;
  ids?: number[];
}

export async function fetchProducts(params: ProductListParams = {}): Promise<{ items: Product[]; meta: ProductListMeta }> {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue;
    query.set(key, Array.isArray(value) ? value.join(",") : String(value));
  }
  const qs = query.toString();
  const res = await apiGet<{ data: ApiProductBase[]; meta: ProductListMeta }>(`products${qs ? `?${qs}` : ""}`);
  return { items: res.data.map((p) => toProduct(p, API_ORIGIN)), meta: res.meta };
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const api = await apiGetOrNull<ApiProductBase>(`products/${encodeURIComponent(slug)}`);
  return api ? toProduct(api, API_ORIGIN) : null;
}

export async function fetchRelatedProducts(slug: string, limit = 4): Promise<Product[]> {
  const res = await apiGet<{ data: ApiProductBase[] }>(`products/${encodeURIComponent(slug)}/frequently-bought-together?limit=${limit}`).catch(() => ({ data: [] as ApiProductBase[] }));
  return res.data.map((p) => toProduct(p, API_ORIGIN));
}

export async function fetchFeaturedProducts(limit = 4): Promise<Product[]> {
  const res = await apiGet<{ data: ApiProductBase[] }>(`products/recommended?limit=${limit}`);
  return res.data.map((p) => toProduct(p, API_ORIGIN));
}

export async function fetchReviews(productId: number, page = 1, perPage = 20): Promise<ApiReview[]> {
  const res = await apiGet<{ data: ApiReview[] }>(`reviews?productId=${productId}&page=${page}&perPage=${perPage}`, 30).catch(() => ({ data: [] as ApiReview[] }));
  return res.data;
}

export { toReview };
