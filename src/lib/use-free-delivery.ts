"use client";

import { useEffect, useState } from "react";
import { fetchFreeDeliveryThreshold } from "./storefront-client";

// One request per page load, shared by every component that mentions the free-delivery offer.
let pending: Promise<number | null> | null = null;
const load = () => (pending ??= fetchFreeDeliveryThreshold().then((result) => result.threshold).catch(() => { pending = null; return null; }));

/** The order value that qualifies for free delivery (from admin shipping methods), or null when there is no offer / still loading. */
export function useFreeDeliveryThreshold(): number | null {
  const [threshold, setThreshold] = useState<number | null>(null);
  useEffect(() => {
    let cancelled = false;
    void load().then((value) => { if (!cancelled) setThreshold(value); });
    return () => { cancelled = true; };
  }, []);
  return threshold;
}
