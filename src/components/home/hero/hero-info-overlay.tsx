import type { HeroSlide } from "./hero-slides";

/**
 * Restrained glass effect: translucent dark base (already legible on its own,
 * satisfying the "readable without backdrop-filter" fallback requirement),
 * with backdrop-blur, a thin light border and a soft top highlight layered on
 * as a pure enhancement.
 */
export function HeroInfoOverlay({ slide }: { slide: HeroSlide }) {
  return (
    <div className="absolute bottom-4 left-4 right-4 overflow-hidden rounded-xl border border-white/10 bg-graphite-900/80 p-4 pb-8 text-text-inverse shadow-[0_12px_32px_rgba(8,13,18,0.35)] backdrop-blur-md">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent"
      />
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="rounded-full bg-orange-500 px-3 py-1 text-label-sm font-label-sm font-bold uppercase tracking-wide text-text-inverse">
          {slide.badge}
        </span>
        <span className="text-label-sm font-label-sm text-text-inverse-muted">{slide.reference}</span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-body-md font-body-md font-bold">{slide.title}</p>
          <p className="truncate text-label-sm font-label-sm text-text-inverse-muted">{slide.specification}</p>
        </div>
        <p className="shrink-0 text-headline-sm font-headline-sm font-bold text-orange-500">{slide.price}</p>
      </div>
    </div>
  );
}
