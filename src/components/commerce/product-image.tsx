import { cn } from "@/lib/utils";

export const CATEGORY_ICON: Record<string, string> = {
  "power-tools": "bolt",
  "combi-drills-hammer": "bolt",
  "drill-drivers-non-hammer": "bolt",
  "impact-drivers": "bolt",
  "sds-rotary-hammers": "bolt",
  "angle-grinders": "bolt",
  "hand-tools": "construction",
  "hardware-fixings": "hardware",
  "electrical-lighting": "electrical_services",
  "plumbing-heating": "plumbing",
  "garden-outdoor": "yard",
  "building-materials": "foundation",
  "painting-decorating": "format_paint",
  "safety-ppe": "shield_person",
  storage: "inventory_2",
};

interface ProductImageProps {
  src?: string;
  categorySlug: string;
  className?: string;
  iconClassName?: string;
}

/**
 * The Stitch design source ships no real product photography. Rather than
 * substitute a misleading stock photo, unset images render a clearly
 * labelled placeholder boundary; the icon is decorative (product identity is
 * always conveyed by adjacent visible text), so it stays out of the a11y tree.
 */
export function ProductImage({ src, categorySlug, className, iconClassName }: ProductImageProps) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element -- mock data never provides a real src today
    return <img src={src} alt="" aria-hidden className={className} />;
  }
  const icon = CATEGORY_ICON[categorySlug] ?? "inventory_2";
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-1 bg-surface-container-low text-graphite-200",
        className,
      )}
      aria-hidden
    >
      <span className={cn("material-symbols-outlined text-[32px]", iconClassName)}>{icon}</span>
      <span className="text-label-sm font-label-sm uppercase tracking-wide text-text-disabled">Sample image</span>
    </div>
  );
}
