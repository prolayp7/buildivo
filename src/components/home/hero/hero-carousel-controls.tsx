"use client";

import type { HeroSlide } from "./hero-slides";

interface HeroCarouselControlsProps {
  slides: HeroSlide[];
  activeIndex: number;
  isPlaying: boolean;
  isManuallyPaused: boolean;
  onSelect: (index: number) => void;
  onTogglePlay: () => void;
}

export function HeroCarouselControls({
  slides,
  activeIndex,
  isPlaying,
  isManuallyPaused,
  onSelect,
  onTogglePlay,
}: HeroCarouselControlsProps) {
  return (
    <>
      <div className="absolute right-3 top-3 z-10 flex items-center gap-2 rounded-full border border-white/10 bg-graphite-900/60 px-2 py-1.5 backdrop-blur-sm">
        <div className="flex items-center gap-1.5" role="tablist" aria-label="Choose a slide">
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              role="tab"
              aria-selected={i === activeIndex}
              aria-label={`Show slide ${i + 1} of ${slides.length}: ${slide.title}`}
              onClick={() => onSelect(i)}
              className="flex h-6 w-6 items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
            >
              <span
                aria-hidden
                className={
                  i === activeIndex
                    ? "h-1.5 w-4 rounded-full bg-orange-500 transition-all"
                    : "h-1.5 w-1.5 rounded-full bg-white/40 transition-all"
                }
              />
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onTogglePlay}
          aria-pressed={isManuallyPaused}
          aria-label={isPlaying || !isManuallyPaused ? "Pause automatic slideshow" : "Resume automatic slideshow"}
          className="flex h-6 w-6 items-center justify-center text-text-inverse focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
        >
          <span aria-hidden className="material-symbols-outlined text-[16px]">
            {isManuallyPaused ? "play_arrow" : "pause"}
          </span>
        </button>
      </div>
    </>
  );
}
