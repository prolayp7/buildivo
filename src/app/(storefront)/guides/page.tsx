import type { Metadata } from "next";
import Link from "next/link";
import { fetchBlogPosts } from "@/lib/api";

export const metadata: Metadata = {
  title: "DIY Guides",
  description: "Step-by-step DIY project guides with materials lists from the Buildivo team.",
  alternates: { canonical: "/guides" },
};

const minutes = (value: number) => (value >= 60 ? `${Math.floor(value / 60)} h${value % 60 ? ` ${value % 60} min` : ""}` : `${value} min`);

export default async function GuidesPage({ searchParams }: { searchParams: Promise<{ page?: string; search?: string }> }) {
  const params = await searchParams;
  const page = Math.max(1, Math.floor(Number(params.page) || 1));
  const search = typeof params.search === "string" ? params.search.trim().slice(0, 120) : "";
  const result = await fetchBlogPosts({ guides: true, page, perPage: 12, search }).catch(() => null);
  const pageHref = (nextPage: number) => `/guides?${new URLSearchParams({ ...(search ? { search } : {}), page: String(nextPage) })}`;

  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 py-10 sm:px-8">
      <h1 className="text-3xl font-bold">DIY Guides</h1>
      <p className="mt-2 text-text-secondary">Step-by-step project guides with a full list of what you&apos;ll need.</p>
      <form action="/guides" method="get" role="search" className="mt-6 flex max-w-xl gap-2">
        <label htmlFor="guide-search" className="sr-only">Search DIY guides</label>
        <input id="guide-search" name="search" type="search" maxLength={120} defaultValue={search} placeholder="Search guide title or content" className="h-11 min-w-0 flex-1 rounded-md border border-border-default bg-white px-3" />
        <button type="submit" className="h-11 rounded-md bg-graphite-900 px-4 font-semibold text-white hover:bg-graphite-800">Search</button>
      </form>
      {!result ? <p role="status" className="mt-8">Guides are temporarily unavailable. Please try again shortly.</p> : result.items.length === 0 ? (
        <p className="mt-8">{search ? "No guides match that search." : "No guides have been published yet."} Browse the <Link href="/blog" className="text-orange-700 underline">blog</Link>.</p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {result.items.map((post) => (
            <article key={post.slug} className="flex flex-col rounded-xl border border-border-default bg-white p-6">
              <ul className="flex flex-wrap gap-2 text-xs font-semibold text-orange-700">
                {post.difficulty && <li className="rounded-full bg-orange-50 px-2.5 py-1">{post.difficulty}</li>}
                {post.estimatedTimeMinutes ? <li className="rounded-full bg-orange-50 px-2.5 py-1">{minutes(post.estimatedTimeMinutes)}</li> : null}
                {post.steps?.length ? <li className="rounded-full bg-orange-50 px-2.5 py-1">{post.steps.length} steps</li> : null}
              </ul>
              <h2 className="mt-3 text-xl font-bold"><Link href={`/blog/${post.slug}`} className="hover:text-orange-700 focus-visible:outline-orange-600">{post.title}</Link></h2>
              {post.excerpt && <p className="mt-2 text-text-secondary">{post.excerpt}</p>}
            </article>
          ))}
        </div>
      )}
      {result && result.meta.totalPages > 1 && (
        <nav aria-label="Guide pages" className="mt-8 flex gap-6 text-orange-700">
          {page > 1 && <Link href={pageHref(page - 1)} className="underline">Previous page</Link>}
          {page < result.meta.totalPages && <Link href={pageHref(page + 1)} className="underline">Next page</Link>}
        </nav>
      )}
    </div>
  );
}
