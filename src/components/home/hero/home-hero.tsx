"use client";

import { formatPrice } from "@/lib/format";
import { useFreeDeliveryThreshold } from "@/lib/use-free-delivery";
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
  { icon: "local_shipping", title: "Tracked Delivery", caption: "", href: "/help", color: "text-orange-600" },
  { icon: "credit_card", title: "Apply for Trade Net 30", caption: "Instant credit decision", href: "/trade", color: "text-graphite-600" },
  { icon: "near_me", title: "Track Your Order", caption: "Live status updates", href: "/track-order", color: "text-success-500" },
];

export function HomeHero({ slides: heroSlides, floatingBadge }: { slides: HeroSlide[]; floatingBadge: ApiTrustBadge | null }) {
  const carousel = useHeroCarousel(heroSlides.length);
  const freeOver = useFreeDeliveryThreshold();
  const slide = heroSlides[carousel.index];
  const textVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: carousel.prefersReducedMotion ? 0 : 0.25, ease: [0.23, 1, 0.32, 1] as const } },
  };

  return (
      <section className="relative isolate w-full overflow-hidden bg-surface-white shadow-sm">
        <div aria-hidden="true" className={styles.backdrop} />
        <div className="relative mx-auto max-w-[1600px] px-4 pb-5 pt-0 sm:py-10 sm:px-margin-desktop lg:py-20">
          <div className="grid grid-cols-1 items-center gap-4 sm:gap-gutter-desktop lg:grid-cols-12" {...carousel.rootProps}>
            <div className="order-2 z-10 flex flex-col items-start sm:order-none lg:col-span-7">
              <div className="mb-3 sm:mb-space-md inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1 text-label-md font-label-md uppercase tracking-wider text-orange-700">
                <span aria-hidden className="h-2 w-2 rounded-full bg-orange-500" />
                {slide.eyebrow}
              </div>
              <h1 className="mb-3 sm:mb-space-lg font-display-lg-mobile text-display-lg-mobile leading-[1.08] tracking-tight text-graphite-900 sm:font-display-lg sm:text-display-lg">
                <TextAnimate key={`${slide.id}-heading`} as="span" by="text" startOnView={false} variants={textVariants} segmentClassName="!whitespace-normal" className="inline">
                  {slide.heading}
                </TextAnimate>{" "}
                <AuroraText colors={["#ea580c", "#ff7900", "#b45309"]}>{slide.highlight}</AuroraText>{" "}
                <TextAnimate key={`${slide.id}-ending`} as="span" by="text" startOnView={false} variants={textVariants} segmentClassName="!whitespace-normal" className="inline">
                  {slide.ending}
                </TextAnimate>
              </h1>
              <TextAnimate key={`${slide.id}-description`} as="p" by="text" startOnView={false} variants={textVariants} segmentClassName="!whitespace-normal" className="mb-4 sm:mb-space-xl max-w-xl text-sm leading-[1.5] sm:text-body-lg font-body-lg text-text-secondary">
                {slide.description}
              </TextAnimate>
              <div className="mb-4 sm:mb-space-xl grid w-full grid-cols-2 items-stretch gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:gap-space-md">
                <ShimmerButton
                  asChild
                  background="var(--color-orange-500)"
                  borderRadius="0.75rem"
                  className="min-h-11 min-w-0 whitespace-normal text-center sm:whitespace-nowrap gap-1.5 border-0 px-2 py-2.5 sm:gap-2 sm:px-8 sm:py-3.5 font-label-lg text-xs sm:text-label-lg font-bold text-text-inverse shadow-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-600"
                >
                  <Link href={`/c/${slide.categorySlug}`}>
                    {slide.ctaLabel}
                    <span aria-hidden className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </Link>
                </ShimmerButton>
                <Link
                  href="/bundles"
                  className="flex min-h-11 min-w-0 items-center justify-center gap-1.5 rounded-xl bg-surface-warm px-2 py-2.5 text-center sm:gap-2 sm:px-7 sm:py-3.5 font-label-lg text-xs sm:text-label-lg font-bold text-graphite-900 shadow-sm transition-all hover:bg-surface-dim"
                >
                  <span aria-hidden className="material-symbols-outlined text-[20px] text-graphite-600">tune</span>
                  Explore Project Kits
                </Link>
              </div>
              <div className="hidden w-full gap-2 sm:grid sm:grid-cols-3">
                {heroCtas.map((rawItem) => {
                  const item = rawItem.title === "Tracked Delivery" ? { ...rawItem, caption: freeOver !== null ? `Free over ${formatPrice(freeOver)}` : "Choose at checkout" } : rawItem;
                  return (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="group flex items-center gap-2.5 rounded-xl bg-surface-warm/60 px-3 py-2 sm:p-3 transition-colors hover:bg-orange-50"
                  >
                    <span aria-hidden className={`material-symbols-outlined shrink-0 text-[20px] ${item.color}`}>
                      {item.icon}
                    </span>
                    <p className="min-w-0 flex-1 leading-tight">
                      <span className="block text-label-md font-label-md font-bold text-graphite-900">{item.title}</span>
                      <span className="block text-label-sm font-label-sm text-text-secondary">{item.caption}</span>
                    </p>
                    <span aria-hidden className="material-symbols-outlined shrink-0 text-[18px] text-text-disabled transition-transform group-hover:translate-x-0.5 group-hover:text-orange-600">
                      arrow_forward
                    </span>
                  </Link>
                );
                })}
              </div>
            </div>
            <HeroPanel carousel={carousel} slides={heroSlides} floatingBadge={floatingBadge} />
          </div>
        </div>
      </section>
  );
}
