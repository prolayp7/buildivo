/**
 * Server-only client for the Buildivo API. BUILDIVO_API_URL is deliberately
 * not NEXT_PUBLIC_*, so it never reaches the browser - never import this file
 * from a "use client" component. Adapted from ukcshop's src/lib/api.ts:
 * server-side fetching for public, read-only catalog/content endpoints. The
 * actual shape adapters live in lib/adapters.ts, shared with the client-safe
 * fetchers in lib/storefront-client.ts.
 */
import type { Category, Product } from "@/types";
import { type ApiHeroSlide, type HeroSlide, toHeroSlide } from "@/components/home/hero/hero-slides";
import { ECOSYSTEM_MATCHER_DEFAULTS, type EcosystemMatcherContent } from "@/components/home/ecosystem-matcher-content";
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

interface ApiHomepageSection {
  type: string;
  config: Record<string, string>;
}

// Which homepage sections (src/app/(storefront)/page.tsx) are turned on and
// their per-section content, set from buildivo-admin's Homepage page.
// Layout/order stay fixed in code.
async function fetchHomepageSections(): Promise<ApiHomepageSection[]> {
  const res = await apiGet<{ data: ApiHomepageSection[] }>("homepage-sections");
  return res.data;
}

export async function fetchVisibleHomepageSections(): Promise<Set<string>> {
  const sections = await fetchHomepageSections();
  return new Set(sections.map((section) => section.type));
}

export interface TradeCtaContent {
  badgeLabel: string;
  heading: string;
  description: string;
  stat1Value: string;
  stat1Label: string;
  stat1Caption: string;
  stat2Icon: string;
  stat2Label: string;
  stat2Caption: string;
  stat3Icon: string;
  stat3Label: string;
  stat3Caption: string;
  ctaLabel: string;
  ctaHref: string;
  microcopy: string;
  previewBrand: string;
  previewStatus: string;
  previewHolderName: string;
  previewCreditLimit: string;
  previewTerms: string;
  previewCardMask: string;
  previewExpiry: string;
}

// Matches the copy this section used to have hardcoded, so the page still
// renders sensibly if the admin-managed config is ever empty.
const TRADE_CTA_DEFAULTS: TradeCtaContent = {
  badgeLabel: "Official Trade Contractor Scheme",
  heading: "Unlock Net Pricing & 30-Day Credit Lines",
  description: "Power your jobs with instant approvals, volume tiered rates on daily consumables, and guaranteed delivery direct to active jobsites before 9:00 AM.",
  stat1Value: "Up to 15%", stat1Label: "Trade Discount", stat1Caption: "Tiered rebates applied to invoicing",
  stat2Icon: "support_agent", stat2Label: "Dedicated Manager", stat2Caption: "Direct phone desk for instant tender quotes",
  stat3Icon: "location_on", stat3Label: "Instant Jobsite Drops", stat3Caption: "What3words geofenced drop-offs",
  ctaLabel: "Apply for Trade Account", ctaHref: "/trade",
  microcopy: "Instant 2-minute soft-check application (Companies House verified)",
  previewBrand: "BUILDIVO PRO", previewStatus: "Active", previewHolderName: "Apex Mechanical & Electrical Ltd",
  previewCreditLimit: "£25,000.00", previewTerms: "Net 30 Days", previewCardMask: "•••• 9842", previewExpiry: "12/28",
};

export async function fetchTradeCtaContent(): Promise<TradeCtaContent> {
  const sections = await fetchHomepageSections();
  const section = sections.find((item) => item.type === "TRADE_CTA");
  return { ...TRADE_CTA_DEFAULTS, ...section?.config };
}

export interface CalculatorsContent {
  eyebrow: string;
  heading: string;
  description: string;
  calc1Icon: string;
  calc1Label: string;
  calc1Caption: string;
  calc2Icon: string;
  calc2Label: string;
  calc2Caption: string;
  calc3Icon: string;
  calc3Label: string;
  calc3Caption: string;
}

const CALCULATORS_DEFAULTS: CalculatorsContent = {
  eyebrow: "Jobsite Estimation Suite",
  heading: "Interactive Material Calculators",
  description: "Prevent site waste and calculate exact quantities for tile, paint coverage, concrete pours, and laminate flooring with automatic 10% wastage allowance.",
  calc1Icon: "architecture", calc1Label: "Concrete & Mortar Volume", calc1Caption: "Calculates cubic meters, ballast & cement bags for footings and slabs.",
  calc2Icon: "format_paint", calc2Label: "Paint Coverage & Primer", calc2Caption: "Coat multipliers for masonry, emulsion, gloss, and exterior cladding.",
  calc3Icon: "view_agenda", calc3Label: "Flooring & Underlay Packs", calc3Caption: "Pack box rounding with expansion gap perimeter formulas.",
};

export async function fetchCalculatorsContent(): Promise<CalculatorsContent> {
  const sections = await fetchHomepageSections();
  const section = sections.find((item) => item.type === "CALCULATORS");
  return { ...CALCULATORS_DEFAULTS, ...section?.config };
}

export interface ProjectKitsContent {
  badgeLabel: string;
  heading: string;
  description: string;
  footnote: string;
  kit1Name: string; kit1Description: string; kit1SpecLabel: string; kit1SpecValue: string; kit1Est: string; kit1ItemCount: string;
  kit2Name: string; kit2Description: string; kit2SpecLabel: string; kit2SpecValue: string; kit2Est: string; kit2ItemCount: string;
  kit3Name: string; kit3Description: string; kit3SpecLabel: string; kit3SpecValue: string; kit3Est: string; kit3ItemCount: string;
  kit4Name: string; kit4Description: string; kit4SpecLabel: string; kit4SpecValue: string; kit4Est: string; kit4ItemCount: string;
}

const PROJECT_KITS_DEFAULTS: ProjectKitsContent = {
  badgeLabel: "Turnkey Project Packs",
  heading: "Shop by Complete Job",
  description: "Standardized bills of materials curated with vetted tradespeople. Eliminate missed fixings, incorrect gauge wiring, and return trips.",
  footnote: "All bundles include 5% bulk rebate",
  kit1Name: "Decking & Outdoor Framing", kit1Description: "C24 treated joists, deck boards, weed membrane, joist tape & coach screws.", kit1SpecLabel: "Estimated Area", kit1SpecValue: "25 - 35 m²", kit1Est: "£1,420.00", kit1ItemCount: "24",
  kit2Name: "Complete Bathroom Refit", kit2Description: "Tanking kit, 15mm/22mm copper, JG Speedfit manifolds, tile backer boards.", kit2SpecLabel: "Typical Room Size", kit2SpecValue: "Standard 3-piece", kit2Est: "£2,180.00", kit2ItemCount: "48",
  kit3Name: "Jobsite Electrical Rough-In", kit3Description: "100m drums 2.5mm² T&E, 1.5mm² lighting, dry lining boxes, RCBOs.", kit3SpecLabel: "Scope", kit3SpecValue: "4-Zone Extension", kit3Est: "£895.00", kit3ItemCount: "32",
  kit4Name: "Workshop Storage Build", kit4Description: "Birch plywood sheets, heavy duty steel angle brackets, heavy-duty castors.", kit4SpecLabel: "Bench Spec", kit4SpecValue: "2.4m Heavy Workbench", kit4Est: "£640.00", kit4ItemCount: "18",
};

export async function fetchProjectKitsContent(): Promise<ProjectKitsContent> {
  const sections = await fetchHomepageSections();
  const section = sections.find((item) => item.type === "PROJECT_KITS");
  return { ...PROJECT_KITS_DEFAULTS, ...section?.config };
}

export async function fetchEcosystemMatcherContent(): Promise<EcosystemMatcherContent> {
  const sections = await fetchHomepageSections();
  const section = sections.find((item) => item.type === "ECOSYSTEM_MATCHER");
  return { ...ECOSYSTEM_MATCHER_DEFAULTS, ...section?.config };
}

export interface ApiTrustBadge {
  id: number;
  label: string;
  caption: string | null;
  icon: string | null;
}

interface ApiHomeHero {
  slides: ApiHeroSlide[];
  badges: ApiTrustBadge[];
  floatingBadge: ApiTrustBadge | null;
}

// Admin-managed homepage hero carousel (buildivo-admin's Merchandising > Hero
// page) - a linked product's title/price/sku are already resolved by the API.
// Slides, the trust-strip badges and the floating "Click & Collect" badge
// all live on the same /home payload, so one fetch (cached by Next) covers
// all three homepage callers.
async function fetchHomeHero(): Promise<ApiHomeHero> {
  const res = await apiGet<{ data: { hero: ApiHomeHero } }>("home");
  return res.data.hero;
}

export async function fetchHeroSlides(): Promise<HeroSlide[]> {
  const hero = await fetchHomeHero();
  return hero.slides.map((slide) => toHeroSlide(slide, API_ORIGIN));
}

export async function fetchTrustBadges(): Promise<ApiTrustBadge[]> {
  const hero = await fetchHomeHero();
  return hero.badges;
}

export async function fetchFloatingBadge(): Promise<ApiTrustBadge | null> {
  const hero = await fetchHomeHero();
  return hero.floatingBadge;
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

export interface GeneralSettings {
  logo?: string | null;
  companyAddress?: string;
  vatNumber?: string;
  supportEmail?: string;
  supportPhone1?: string;
  copyright?: string;
}
export async function fetchGeneralSettings(): Promise<GeneralSettings> {
  try {
    const res = await apiGet<{ data: GeneralSettings }>("settings/general", 300);
    return { ...res.data, logo: res.data.logo?.startsWith("/uploads/") ? `${API_ORIGIN}${res.data.logo}` : res.data.logo };
  } catch {
    return {};
  }
}
