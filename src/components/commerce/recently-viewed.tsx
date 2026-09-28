"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/commerce/product-card";
import { fetchProductsByIds } from "@/lib/storefront-client";
import type { Product } from "@/types";

const STORAGE_KEY = "buildivo.recentlyViewed";
const MAX_ITEMS = 8;

function readIds(): number[] {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value ? (JSON.parse(value) as number[]).filter(Number.isInteger) : [];
  } catch {
    return [];
  }
}

export function RecentlyViewed({ product }: { product: Product }) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const previousIds = readIds().filter((id) => id !== product.id);
    const nextIds = [product.id, ...previousIds].slice(0, MAX_ITEMS);
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextIds)); } catch {}
    fetchProductsByIds(previousIds.slice(0, 4))
      .then((items) => setProducts(items.filter((item) => item.id !== product.id)))
      .catch(() => setProducts([]));
  }, [product]);

  if (!products.length) return null;
  return (
    <section className="mt-8 rounded-2xl border border-border-default bg-white p-6" aria-labelledby="recently-viewed-title">
      <h2 id="recently-viewed-title" className="mb-4 text-headline-sm font-headline-sm font-bold text-graphite-900">Recently viewed</h2>
      <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4">
        {products.map((item) => <ProductCard key={item.id} product={item} mobileCategory />)}
      </div>
    </section>
  );
}
