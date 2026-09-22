import { formatPrice } from "@/lib/format";

export interface HeroSlide {
  /** Stable identifier used as the animation key. */
  id: string;
  eyebrow: string;
  heading: string;
  highlight: string;
  ending: string;
  description: string;
  ctaLabel: string;
  /** Real image path. Omit to render the honest placeholder panel (no photography asset yet). */
  image?: string;
  /** Required descriptive alt text for the image (or for the placeholder's accessible name). */
  imageAlt: string;
  /** `contain` for isolated product cutouts, `cover` for full-bleed photography. Defaults to `cover`. */
  imageFit?: "cover" | "contain";
  imagePosition?: string;
  /** Category used to pick a placeholder icon when no real image is set yet. */
  categorySlug: string;
  badge: string;
  title: string;
  specification: string;
  reference: string;
  price: string;
  /** Optional destination — the slide becomes a link when set. */
  href?: string;
}

// Matches the shape StorefrontMerchandisingService.resolveHeroSlide() returns
// from GET /home - a linked product's title/price/sku are resolved live on
// the API side, never duplicated onto the slide row.
export interface ApiHeroSlide {
  id: number;
  eyebrow: string | null;
  heading: string;
  highlight: string | null;
  ending: string | null;
  description: string | null;
  overlayBadge: string | null;
  image: string | null;
  imageAlt: string | null;
  imageFit: string | null;
  imagePosition: string | null;
  ctaLabel: string | null;
  href: string | null;
  title: string | null;
  reference: string | null;
  specification: string | null;
  price: number | null;
}

export function toHeroSlide(api: ApiHeroSlide, apiOrigin: string): HeroSlide {
  const image = api.image ? (api.image.startsWith("/uploads/") ? `${apiOrigin}${api.image}` : api.image) : undefined;
  return {
    id: String(api.id),
    eyebrow: api.eyebrow ?? "",
    heading: api.heading,
    highlight: api.highlight ?? "",
    ending: api.ending ?? "",
    description: api.description ?? "",
    ctaLabel: api.ctaLabel ?? "Shop Now",
    image,
    imageAlt: api.imageAlt ?? api.heading,
    imageFit: api.imageFit === "contain" ? "contain" : "cover",
    imagePosition: api.imagePosition ?? undefined,
    categorySlug: "",
    badge: api.overlayBadge ?? "",
    title: api.title ?? "",
    specification: api.specification ?? "",
    reference: api.reference ? `Ref: ${api.reference}` : "",
    price: api.price != null ? `${formatPrice(api.price)} ex.VAT` : "",
    href: api.href ?? undefined,
  };
}
