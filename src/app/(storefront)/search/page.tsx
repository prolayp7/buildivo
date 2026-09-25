import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductCard } from "@/components/commerce/product-card";
import { ProductListing } from "@/components/commerce/product-listing";
import { fetchAssistantAdvice, fetchProducts, fetchToolPlatforms } from "@/lib/api";

export const metadata: Metadata = { title: "Search", robots: { index: false, follow: true } };

// Streams in after the normal results, so a slow or unavailable assistant never delays the page.
async function ProductAdvisor({ query }: { query: string }) {
  const advice = await fetchAssistantAdvice(query);
  if (!advice) return null;
  return (
    <section aria-label="Product advisor" className="mx-auto mb-2 w-full max-w-[1600px] px-4 sm:px-margin-desktop">
      <div className="rounded-xl border border-orange-200 bg-orange-50 p-5">
        <h2 className="flex items-center gap-2 text-lg font-bold text-graphite-900"><span aria-hidden className="material-symbols-outlined text-[20px] text-orange-600">auto_awesome</span>Product advisor</h2>
        <p className="mt-2 text-graphite-900">{advice.answer}</p>
        {advice.products.length > 0 && <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{advice.products.map((product) => <ProductCard key={product.id} product={product} />)}</div>}
      </div>
    </section>
  );
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim() : "";
  const [initialProducts, platforms] = query
    ? await Promise.all([fetchProducts({ q: query, page: 1, perPage: 12, sort: "newest" }).catch(() => null), fetchToolPlatforms()])
    : [null, []];

  return (
    <div>
      <div className="mx-auto w-full max-w-[1600px] px-4 pt-10 sm:px-margin-desktop">
        <h1 className="text-3xl font-bold">{query ? <>Results for “{query}”</> : "Search the catalog"}</h1>
        <form action="/search" role="search" className="my-6 flex max-w-xl gap-2">
          <label htmlFor="catalog-query" className="sr-only">Search products</label>
          <input id="catalog-query" name="q" type="search" required defaultValue={query} placeholder="Product name, category, SKU - or ask a question" className="min-w-0 flex-1 rounded-lg border border-border-default bg-white px-4 py-3 focus-visible:outline-orange-600" />
          <button type="submit" className="rounded-lg bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600 focus-visible:outline-orange-600">Search</button>
        </form>
      </div>
      {query && <Suspense fallback={null}><ProductAdvisor query={query} /></Suspense>}
      {!query ? <p className="mx-auto max-w-[1600px] px-4 pb-10 sm:px-margin-desktop">Enter a product name or SKU to find what you need.</p>
        : !initialProducts ? <p role="status" className="mx-auto max-w-[1600px] px-4 pb-10 sm:px-margin-desktop">The catalog is temporarily unavailable. Please try again shortly.</p>
        : <ProductListing key={query} initialProducts={initialProducts} searchQuery={query} categoryName="your search" platforms={platforms} emptyMessage={`No products match “${query}”. Try a different term or browse the departments.`} />}
    </div>
  );
}
