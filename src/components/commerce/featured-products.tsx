"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProductCard } from "./product-card";
import { Product } from "@/types";
import { fetchFeaturedProducts } from "@/lib/api";

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const getFeaturedProducts = async () => {
      const featuredProducts = await fetchFeaturedProducts(4);
      setProducts(featuredProducts);
    };
    getFeaturedProducts();
  }, []);

  return (
    <section id="featured-products" className="mx-auto w-full max-w-[1600px] scroll-mt-40 px-4 py-5 sm:py-10 sm:px-margin-desktop">
        <div className="mb-3 flex items-center justify-between gap-2 sm:mb-space-lg">
          <h2 className="text-[18px] leading-6 font-headline-lg-mobile font-bold text-graphite-900 sm:text-headline-lg sm:font-headline-lg">Featured Pro Tools</h2>
          <Link href="/c/power-tools" className="shrink-0 whitespace-nowrap text-[10px] sm:text-label-lg font-label-lg font-semibold text-orange-600 hover:underline">
            Shop all Power Tools
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} featured />
          ))}
        </div>
    </section>
  );
}