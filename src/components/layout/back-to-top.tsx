"use client";

import { useEffect, useState } from "react";

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => setVisible(window.scrollY > 400);
    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    return () => window.removeEventListener("scroll", updateVisibility);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      aria-label="Back to top"
      title="Back to top"
      onClick={() => {
        window.scrollTo({
          top: 0,
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
        });
      }}
      className="fixed right-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-30 hidden sm:flex size-12 items-center justify-center rounded-xl bg-graphite-800 text-white shadow-lg transition-colors hover:bg-orange-600 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-600 sm:right-6"
    >
      <span aria-hidden="true" className="material-symbols-outlined text-[24px]">arrow_upward</span>
    </button>
  );
}
