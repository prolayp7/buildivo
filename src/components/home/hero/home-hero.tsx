"use client";

import Link from "next/link";
import { AuroraText } from "@/components/ui/aurora-text";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { TextAnimate } from "@/components/ui/text-animate";
import { HeroPanel } from "./hero-panel";
import type { HeroSlide } from "./hero-slides";
import { useHeroCarousel } from "./use-hero-carousel";
import styles from "./home-hero.module.css";
import type { ApiTrustBadge } from "@/lib/api";

const heroCtas = [
  { icon: "local_shipping", title: "Next-Day Delivery", caption: "Free over £75", href: "/help", color: "text-orange-600" },
  { icon: "credit_card", title: "Apply for Trade Net 30", caption: "Instant credit decision", href: "/trade", color: "text-graphite-600" },
  { icon: "near_me", title: "Track Your Order", caption: "Live status updates", href: "/track-order", color: "text-success-500" },
];

export function HomeHero({ slides: heroSlides, floatingBadge }: { slides: HeroSlide[]; floatingBadge: ApiTrustBadge | null }) {
  const carousel = useHeroCarousel(heroSlides.length);
  const slide = heroSlides[carousel.index];
  const textVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: carousel.prefersReducedMotion ? 0 : 0.25, ease: [0.23, 1, 0.32, 1] as const } },
  };

  return (
      <section className="relative isolate w-full overflow-hidden bg-surface-white shadow-sm">
        <div aria-hidden="true" className={styles.backdrop} />
        <div className="relative mx-auto max-w-[1600px] px-4 py-10 sm:px-margin-desktop lg:py-20">
          <div className="grid grid-cols-1 items-center gap-gutter-desktop lg:grid-cols-12" {...carousel.rootProps}>
            <div className="z-10 flex flex-col items-start lg:col-span-7">
              <div className="mb-space-md inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1 text-label-md font-label-md uppercase tracking-wider text-orange-700">
                <span aria-hidden className="h-2 w-2 rounded-full bg-orange-500" />
                {slide.eyebrow}
              </div>
              <h1 className="mb-space-lg font-display-lg-mobile text-display-lg-mobile leading-[1.08] tracking-tight text-graphite-900 sm:font-display-lg sm:text-display-lg">
                <TextAnimate key={`${slide.id}-heading`} as="span" by="text" startOnView={false} variants={textVariants} segmentClassName="!whitespace-normal" className="inline">
                  {slide.heading}
                </TextAnimate>{" "}
                <AuroraText colors={["#ea580c", "#ff7900", "#b45309"]}>{slide.highlight}</AuroraText>{" "}
                <TextAnimate key={`${slide.id}-ending`} as="span" by="text" startOnView={false} variants={textVariants} segmentClassName="!whitespace-normal" className="inline">
                  {slide.ending}
                </TextAnimate>
              </h1>
              <TextAnimate key={`${slide.id}-description`} as="p" by="text" startOnView={false} variants={textVariants} segmentClassName="!whitespace-normal" className="mb-space-xl max-w-xl text-body-lg font-body-lg text-text-secondary">
                {slide.description}
              </TextAnimate>
              <div className="mb-space-xl flex w-full flex-wrap items-center gap-space-md sm:w-auto">
                <ShimmerButton
                  asChild
                  background="var(--color-orange-500)"
                  borderRadius="0.75rem"
                  className="gap-2 border-0 px-8 py-3.5 font-label-lg text-label-lg font-bold text-text-inverse shadow-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-600"
                >
                  <Link href={`/c/${slide.categorySlug}`}>
                    {slide.ctaLabel}
                    <span aria-hidden className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </Link>
                </ShimmerButton>
                <Link
                  href="/guides"
                  className="flex items-center justify-center gap-2 rounded-xl bg-surface-warm px-7 py-3.5 font-label-lg text-label-lg font-bold text-graphite-900 shadow-sm transition-all hover:bg-surface-dim"
                >
                  <span aria-hidden className="material-symbols-outlined text-[20px] text-graphite-600">tune</span>
                  Explore Project Kits
                </Link>
              </div>
              <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-3">
                {heroCtas.map((item) => (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="group flex items-center gap-2.5 rounded-xl bg-surface-warm/60 p-3 transition-colors hover:bg-orange-50"
                  >
                    <span aria-hidden className={`material-symbols-outlined shrink-0 text-[20px] ${item.color}`}>
                      {item.icon}
                    </span>
                    <p className="min-w-0 flex-1 leading-tight">
                      <span className="block text-label-md font-label-md font-bold text-graphite-900">{item.title}</span>
                      <span className="block truncate text-label-sm font-label-sm text-text-secondary">{item.caption}</span>
                    </p>
                    <span aria-hidden className="material-symbols-outlined shrink-0 text-[18px] text-text-disabled transition-transform group-hover:translate-x-0.5 group-hover:text-orange-600">
                      arrow_forward
                    </span>
                  </Link>
                ))}
              </div>
            </div>
            <HeroPanel carousel={carousel} slides={heroSlides} floatingBadge={floatingBadge} />
          </div>
        </div>
      </section>
  );
}
