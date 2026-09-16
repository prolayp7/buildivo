"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

const DWELL_MS = 5000;
const TRANSITION_MS = 800;

type PauseReason = "hover" | "focus" | "manual" | "hidden" | "offscreen";

export function useHeroCarousel(slideCount: number) {
  const prefersReducedMotion = useReducedMotion();
  const enabled = slideCount >= 2;

  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [manuallyPaused, setManuallyPaused] = useState(false);
  const [pauseReasons, setPauseReasons] = useState<Set<PauseReason>>(new Set());
  const isTransitioning = useRef(false);
  const timerRef = useRef<number | null>(null);

  const addPause = useCallback((reason: PauseReason) => {
    setPauseReasons((prev) => (prev.has(reason) ? prev : new Set(prev).add(reason)));
  }, []);

  const removePause = useCallback((reason: PauseReason) => {
    setPauseReasons((prev) => {
      if (!prev.has(reason)) return prev;
      const next = new Set(prev);
      next.delete(reason);
      return next;
    });
  }, []);

  const goTo = useCallback(
    (nextIndex: number, dir: 1 | -1) => {
      if (!enabled || isTransitioning.current) return;
      isTransitioning.current = true;
      setDirection(dir);
      setIndex(((nextIndex % slideCount) + slideCount) % slideCount);
    },
    [enabled, slideCount],
  );

  const goNext = useCallback(() => goTo(index + 1, 1), [goTo, index]);
  const goPrev = useCallback(() => goTo(index - 1, -1), [goTo, index]);

  /** Call when the exiting slide's exit animation finishes, so rapid input can't overlap transitions. */
  const onTransitionSettled = useCallback(() => {
    isTransitioning.current = false;
  }, []);

  const togglePlay = useCallback(() => {
    setManuallyPaused((prev) => {
      const next = !prev;
      if (next) addPause("manual");
      else removePause("manual");
      return next;
    });
  }, [addPause, removePause]);

  // Tab visibility
  useEffect(() => {
    function handleVisibility() {
      if (document.hidden) addPause("hidden");
      else removePause("hidden");
    }
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [addPause, removePause]);

  const isPlaying = enabled && !prefersReducedMotion && pauseReasons.size === 0;

  // The one managed autoplay timer. Resets on every index change (manual or automatic) and on any
  // pause-state change, and is always torn down on cleanup.
  useEffect(() => {
    if (!isPlaying) return;
    timerRef.current = window.setTimeout(() => {
      goTo(index + 1, 1);
    }, DWELL_MS + TRANSITION_MS);
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, [isPlaying, index, goTo]);

  const rootProps = {
    onPointerEnter: () => addPause("hover"),
    onPointerLeave: () => removePause("hover"),
    onFocusCapture: () => addPause("focus"),
    onBlurCapture: (e: React.FocusEvent) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node | null)) removePause("focus");
    },
  };

  return {
    index,
    direction,
    isPlaying,
    isManuallyPaused: manuallyPaused,
    prefersReducedMotion: Boolean(prefersReducedMotion),
    transitionDuration: prefersReducedMotion ? 0.25 : TRANSITION_MS / 1000,
    goNext,
    goPrev,
    goTo: (i: number) => goTo(i, i > index ? 1 : -1),
    togglePlay,
    onTransitionSettled,
    rootProps,
    setOffscreen: (offscreen: boolean) => (offscreen ? addPause("offscreen") : removePause("offscreen")),
  };
}
