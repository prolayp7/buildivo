"use client";

import { useEffect, useRef } from "react";
import { heroSlides } from "./hero-slides";
import { HeroSlideMedia } from "./hero-slide-media";
import { HeroCarouselControls } from "./hero-carousel-controls";
import { FloatingCollectionCard } from "./floating-collection-card";
import type { useHeroCarousel } from "./use-hero-carousel";

// Static perspective geometry for the angled panel assembly. Tuned against the
// approved reference image, not a literal reading of any named angle. Adjust
// these two values to retune the tilt; everything else derives from them.
const HERO_PERSPECTIVE = "1200px";
const HERO_ROTATE_Y = "-17.6deg";
const HERO_ROTATE_X = "1.6deg";
const EDGE_DEPTH = "48px";

export function HeroPanel({ carousel }: { carousel: ReturnType<typeof useHeroCarousel> }) {
  const slides = heroSlides;
  const stageRef = useRef<HTMLDivElement>(null);

  // Pause autoplay while the hero is scrolled out of view.
  useEffect(() => {
    const node = stageRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => carousel.setOffscreen(!entry.isIntersecting), {
      threshold: 0.2,
    });
    observer.observe(node);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- setOffscreen is stable across renders
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      carousel.goPrev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      carousel.goNext();
    }
  }

  const multiSlide = slides.length >= 2;
  const activeSlide = slides[carousel.index];

  return (
    <div className="relative lg:col-span-5">
      <div
        ref={stageRef}
        style={{ perspective: HERO_PERSPECTIVE } as React.CSSProperties}
        {...(multiSlide
          ? {
              role: "region",
              "aria-roledescription": "carousel",
              "aria-label": "Featured product spotlight",
              onKeyDown: handleKeyDown,
            }
          : {})}
      >
        <div
          style={
            {
              transform: `rotateY(${HERO_ROTATE_Y}) rotateX(${HERO_ROTATE_X})`,
              transformStyle: "preserve-3d",
            } as React.CSSProperties
          }
        >
          <div className="relative" style={{ transformStyle: "preserve-3d" } as React.CSSProperties}>
            <div className="relative aspect-[5/4] w-full overflow-hidden rounded-2xl shadow-[0_30px_60px_-20px_rgba(8,13,18,0.45),0_12px_24px_-10px_rgba(8,13,18,0.3)]">
              {multiSlide ? (
                <HeroSlideMedia
                  slide={activeSlide}
                  direction={carousel.direction}
                  duration={carousel.transitionDuration}
                  priority
                  active
                  onExitComplete={carousel.onTransitionSettled}
                />
              ) : (
                <div className="absolute inset-0">
                  <HeroSlideMedia
                    slide={activeSlide}
                    direction={1}
                    duration={0}
                    priority
                    active
                    onExitComplete={() => {}}
                  />
                </div>
              )}
              {multiSlide && (
                <HeroCarouselControls
                  slides={slides}
                  activeIndex={carousel.index}
                  isPlaying={carousel.isPlaying}
                  isManuallyPaused={carousel.isManuallyPaused}
                  onSelect={carousel.goTo}
                  onTogglePlay={carousel.togglePlay}
                />
              )}
            </div>
            {/* Thin dark side face simulating the panel's physical depth, folded
                perpendicular to the front face so it reads as a true 3D edge
                under the shared rotateY rather than a flat rectangle. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-0 rounded-l-2xl bg-gradient-to-r from-graphite-700 via-graphite-800 to-graphite-900 shadow-[inset_0_0_10px_rgba(0,0,0,0.6)]"
              style={
                {
                  width: EDGE_DEPTH,
                  transformOrigin: "left center",
                  transform: "rotateY(90deg)",
                } as React.CSSProperties
              }
            />
          </div>
          <div style={{ transform: "translateZ(28px)" } as React.CSSProperties}>
            <FloatingCollectionCard />
          </div>
        </div>
      </div>
    </div>
  );
}
