import type { Metadata } from "next";
import Link from "next/link";
import { fetchProducts } from "@/lib/api";
import { ProductCard } from "@/components/commerce/product-card";

export const metadata: Metadata = { title: "Search" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim() : "";
  const page = Math.max(1, Math.floor(Number(params.page) || 1));
  const result = query ? await fetchProducts({ q: query, page, perPage: 24 }).catch(() => null) : null;
  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-10 sm:px-8">
      <h1 className="text-3xl font-bold">Search the catalog</h1>
      <form action="/search" role="search" className="my-6 flex max-w-xl gap-2">
        <label htmlFor="catalog-query" className="sr-only">Search products</label>
        <input id="catalog-query" name="q" type="search" required defaultValue={query} placeholder="Product name, category, or SKU" className="min-w-0 flex-1 rounded-lg border border-border-default bg-white px-4 py-3 focus-visible:outline-orange-600" />
        <button type="submit" className="rounded-lg bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600 focus-visible:outline-orange-600">Search</button>
      </form>
      {!query ? <p>Enter a product name or SKU to find what you need.</p> : !result ? <p role="status">The catalog is temporarily unavailable. Please try again shortly.</p> : <>
        <p className="mb-6 text-text-secondary">{result.meta.total.toLocaleString()} results for “{query}”</p>
        {result.items.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{result.items.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <p>No matching products. Try a different term or <Link href="/" className="text-orange-700 underline">browse the storefront</Link>.</p>}
        <nav aria-label="Search results pages" className="mt-8 flex gap-6 text-orange-700">
          {page > 1 && <Link href={`/search?q=${encodeURIComponent(query)}&page=${page - 1}`} className="underline">Previous page</Link>}
          {page < result.meta.totalPages && <Link href={`/search?q=${encodeURIComponent(query)}&page=${page + 1}`} className="underline">Next page</Link>}
        </nav>
      </>}
    </div>
  );
}
