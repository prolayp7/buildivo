"use client";

import { useEffect, useRef, useState } from "react";
import type { ApiTrustBadge } from "@/lib/api";

export function TrustStrip({ badges }: { badges: ApiTrustBadge[] }) {
  const row = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(preference.matches);
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (paused || reducedMotion || badges.length < 2) return;
    const timer = window.setInterval(() => {
      const node = row.current;
      if (!node || document.hidden || !window.matchMedia("(max-width: 639px)").matches) return;
      const bounds = node.getBoundingClientRect();
      if (bounds.bottom <= 0 || bounds.top >= window.innerHeight) return;
      const cards = Array.from(node.children) as HTMLElement[];
      const positions = cards.map((card) => card.offsetLeft - cards[0].offsetLeft);
      const next = positions.find((position) => position > node.scrollLeft + 8);
      const atEnd = node.scrollLeft + node.clientWidth >= node.scrollWidth - 8;
      node.scrollTo({ left: atEnd ? 0 : next ?? 0, behavior: "smooth" });
    }, 4000);
    return () => window.clearInterval(timer);
  }, [paused, reducedMotion, badges.length]);

  return (
    <section aria-label="Shopping benefits" className="bg-surface-warm">
      <div className="relative mx-auto max-w-[1600px] px-4 py-4 sm:px-margin-desktop sm:py-6">
        <div
          ref={row}
          tabIndex={0}
          aria-label="Shopping benefits, swipe to explore"
          onPointerDown={() => setPaused(true)}
          onFocus={() => setPaused(true)}
          className="relative flex snap-x snap-mandatory gap-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden overscroll-x-contain scroll-smooth motion-reduce:scroll-auto pb-1 touch-auto focus-visible:outline-2 focus-visible:outline-orange-500 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible lg:grid-cols-4"
        >
          {badges.map((badge) => (
            <div key={badge.id} className="flex min-h-16 w-[88%] shrink-0 snap-start items-center gap-2 rounded-lg bg-white p-3 shadow-[0_1px_2px_rgb(0_0_0/0.05)] sm:w-auto">
              <span aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                <span className="material-symbols-outlined text-[22px]">{badge.icon ?? "verified"}</span>
              </span>
              <div className="min-w-0">
                <p className="text-[12px] leading-4 font-semibold text-graphite-900">{badge.label}</p>
                <p className="text-label-sm font-label-sm text-text-secondary">{badge.caption}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
