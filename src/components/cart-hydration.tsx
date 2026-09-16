"use client";

import { useEffect } from "react";
import { hydrateCart } from "@/lib/cart-store";

/** Loads the real guest cart from the API after mount, once a browser (and
 * therefore a guest token / localStorage) is available. */
export function CartHydration() {
  useEffect(() => {
    hydrateCart();
  }, []);
  return null;
}
