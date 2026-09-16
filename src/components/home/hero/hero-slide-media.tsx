"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { CATEGORY_ICON } from "@/components/commerce/product-image";
import { cn } from "@/lib/utils";
import type { HeroSlide } from "./hero-slides";
import { HeroInfoOverlay } from "./hero-info-overlay";

const slideVariants: Variants = {
  enter: (direction: number) => ({ opacity: 0, x: direction > 0 ? 28 : -28, rotateY: direction > 0 ? 8 : -8 }),
  center: { opacity: 1, x: 0, rotateY: 0 },
  exit: (direction: number) => ({ opacity: 0, x: direction > 0 ? -28 : 28, rotateY: direction > 0 ? -8 : 8 }),
};

interface HeroSlideMediaProps {
  slide: HeroSlide;
  direction: number;
  duration: number;
  priority?: boolean;
  active: boolean;
  onExitComplete: () => void;
}

function SlideBody({ slide, priority }: { slide: HeroSlide; priority?: boolean }) {
  const icon = CATEGORY_ICON[slide.categorySlug] ?? "inventory_2";
  return (
    <>
      {slide.image ? (
        <Image
          src={slide.image}
          alt={slide.imageAlt}
          fill
          style={{ objectPosition: slide.imagePosition ?? "center" }}
          priority={priority}
          sizes="(min-width: 1024px) 45vw, 100vw"
          className={cn(slide.imageFit === "contain" ? "object-contain" : "object-cover", "object-center")}
        />
      ) : (
        <div
          role="img"
          aria-label={slide.imageAlt}
          className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-graphite-700 to-graphite-900 text-orange-500"
        >
          <span aria-hidden className="material-symbols-outlined text-[72px]">
            {icon}
          </span>
          <span aria-hidden className="text-label-sm font-label-sm uppercase tracking-wide text-text-inverse-muted">
            Sample hero image
          </span>
        </div>
      )}
      <HeroInfoOverlay slide={slide} />
    </>
  );
}

/**
 * The clipping viewport: only this element (and its AnimatePresence children)
 * clips transitioning slides. Everything outside stays overflow-visible so
 * the panel's shadow and the floating card are never cut off.
 */
export function HeroSlideMedia({ slide, direction, duration, priority, active, onExitComplete }: HeroSlideMediaProps) {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-2xl" style={{ perspective: 900 }}>
      <AnimatePresence initial={false} custom={direction} onExitComplete={onExitComplete}>
        <motion.div
          key={slide.id}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration, ease: [0.4, 0, 0.2, 1] }}
          style={{ willChange: "transform, opacity" }}
          className="absolute inset-0"
          aria-hidden={!active}
        >
          {slide.href ? (
            <Link
              href={slide.href}
              tabIndex={active ? 0 : -1}
              className="absolute inset-0 block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
              aria-label={`${slide.title} — ${slide.price}`}
            >
              <SlideBody slide={slide} priority={priority} />
            </Link>
          ) : (
            <div className="absolute inset-0">
              <SlideBody slide={slide} priority={priority} />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
