import Link from "next/link";
import { ProductCard } from "./product-card";
import type { Product } from "@/types";
import type { SectionHeader } from "@/lib/api";

// Rendered on the server: the page fetches the best sellers and passes them in.
export default function FeaturedProducts({ header, products }: { header: SectionHeader; products: Product[] }) {
  return (
    <section id="featured-products" className="mx-auto w-full max-w-[1600px] scroll-mt-40 px-4 py-5 sm:py-10 sm:px-margin-desktop">
        <div className="mb-3 flex items-center justify-between gap-2 sm:mb-space-lg">
          <h2 className="text-[18px] leading-6 font-headline-lg-mobile font-bold text-graphite-900 sm:text-headline-lg sm:font-headline-lg">{header.heading}</h2>
          <Link href={header.linkHref} className="shrink-0 whitespace-nowrap text-[10px] sm:text-label-lg font-label-lg font-semibold text-orange-600 hover:underline">
            {header.linkLabel}
          </Link>
        </div>
        <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto overscroll-x-contain pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:pb-0 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} featured className="w-[80%] shrink-0 snap-start sm:w-auto sm:shrink" />
          ))}
        </div>
    </section>
  );
}