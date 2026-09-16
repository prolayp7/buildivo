"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/commerce/product-card";
import { LoaderCircle } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { fetchProductsByIds } from "@/lib/storefront-client";
import type { Product } from "@/types";

export default function WishlistPage() {
  const wishlist = useCartStore((s) => s.wishlist);
  const [saved, setSaved] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      setLoading(true);
      fetchProductsByIds(wishlist)
        .then((items) => { if (!cancelled) setSaved(items); })
        .finally(() => { if (!cancelled) setLoading(false); });
    }, 0);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [wishlist]);

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <LoaderCircle className="h-6 w-6 animate-spin text-graphite-300" />
      </div>
    );
  }

  if (saved.length === 0) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-24 text-center">
        <span aria-hidden className="material-symbols-outlined text-[56px] text-graphite-200">favorite</span>
        <h1 className="text-headline-md font-headline-md font-bold text-graphite-900">Nothing saved yet</h1>
        <p className="text-body-md font-body-md text-text-secondary">
          Tap the heart icon on any product to save it here for later.
        </p>
        <Button asChild className="bg-orange-500 hover:bg-orange-600">
          <Link href="/">Browse Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-margin-desktop">
      <h1 className="mb-6 text-headline-lg-mobile font-headline-lg-mobile font-bold text-graphite-900 sm:text-headline-lg sm:font-headline-lg">
        Saved Items ({saved.length})
      </h1>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {saved.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
