"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/commerce/product-card";
import { fetchProductRecommendations, fetchProductsByIds } from "@/lib/storefront-client";
import type { Product } from "@/types";

// Written by RecentlyViewed on every product page visit.
const STORAGE_KEY = "buildivo.recentlyViewed";

function readIds(): number[] {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value ? (JSON.parse(value) as number[]).filter(Number.isInteger) : [];
  } catch {
    return [];
  }
}

export function BrowsingHistory() {
  const [viewed, setViewed] = useState<Product[]>([]);
  const [inspired, setInspired] = useState<Product[]>([]);

  useEffect(() => {
    const ids = readIds().slice(0, 8);
    if (!ids.length) return;
    let active = true;
    fetchProductsByIds(ids)
      .then(async (items) => {
        if (!active || !items.length) return;
        setViewed(items);
        const seen = new Set(items.map((item) => item.id));
        const related = await fetchProductRecommendations(items[0].slug, 8).catch(() => []);
        if (active) setInspired(related.filter((item) => !seen.has(item.id)).slice(0, 4));
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  if (!viewed.length) return null;
  const rail = (id: string, title: string, items: Product[]) => (
    <section aria-labelledby={id}>
      <h2 id={id} className="mb-4 text-headline-sm font-headline-sm font-bold text-graphite-900">{title}</h2>
      <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4">
        {items.map((item) => <ProductCard key={item.id} product={item} mobileCategory />)}
      </div>
    </section>
  );

  return (
    <div className="mx-auto flex max-w-[1600px] flex-col gap-10 px-4 pb-12 pt-4 sm:px-margin-desktop">
      {inspired.length > 0 && rail("inspired-history-title", "Inspired by your browsing history", inspired)}
      {rail("browsing-history-title", "Your browsing history", viewed)}
    </div>
  );
}
