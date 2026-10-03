"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export type CalculatorLink = {
  slug: string;
  icon: string;
  label: string;
  caption: string;
};

export function CalculatorLinksCarousel({ calculators }: { calculators: CalculatorLink[] }) {
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
    if (paused || reducedMotion || calculators.length < 2) return;
    const timer = window.setInterval(() => {
      const node = row.current;
      if (!node || document.hidden || !window.matchMedia("(max-width: 1023px)").matches) return;
      const bounds = node.getBoundingClientRect();
      if (bounds.bottom <= 0 || bounds.top >= window.innerHeight) return;
      const cards = Array.from(node.children) as HTMLElement[];
      const firstLeft = cards[0]?.offsetLeft ?? 0;
      const positions = cards.map((card) => card.offsetLeft - firstLeft);
      const next = positions.find((position) => position > node.scrollLeft + 8);
      const atEnd = node.scrollLeft + node.clientWidth >= node.scrollWidth - 8;
      node.scrollTo({ left: atEnd ? 0 : next ?? 0, behavior: "smooth" });
    }, 4000);
    return () => window.clearInterval(timer);
  }, [calculators.length, paused, reducedMotion]);

  return (
    <div
      ref={row}
      role="region"
      aria-label="Calculators, swipe to explore"
      onPointerDown={() => setPaused(true)}
      onPointerUp={() => setPaused(false)}
      onPointerCancel={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false);
      }}
      className="relative flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth motion-reduce:scroll-auto pb-2 focus-visible:outline-2 focus-visible:outline-orange-500 lg:grid lg:grid-rows-3 lg:gap-4 lg:overflow-visible lg:pb-0"
    >
      {calculators.map((calculator) => (
        <Link
          key={calculator.slug}
          href="/calculators"
          className="flex w-[85%] min-w-[85%] snap-start items-center justify-between gap-4 rounded-2xl bg-surface-white px-5 py-7 shadow-[0_1px_2px_rgb(0_0_0/0.05)] transition-colors hover:bg-orange-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-500 lg:min-h-32 lg:w-auto lg:min-w-0"
        >
          <div className="flex min-w-0 items-center gap-4">
            <span aria-hidden className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-container-low text-graphite-900">
              <span className="material-symbols-outlined text-[20px]">{calculator.icon}</span>
            </span>
            <div>
              <p className="text-[18px] leading-6 font-bold text-graphite-900">{calculator.label}</p>
              <p className="text-[14px] leading-5 text-text-secondary">{calculator.caption}</p>
            </div>
          </div>
          <span aria-hidden className="material-symbols-outlined shrink-0 text-[20px] text-graphite-400">arrow_forward</span>
        </Link>
      ))}
    </div>
  );
}