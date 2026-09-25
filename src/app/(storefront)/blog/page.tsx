import type { Metadata } from "next";
import Link from "next/link";
import { fetchBlogCategories, fetchBlogPosts } from "@/lib/api";

export const metadata: Metadata = {
  title: "Blog",
  description: "Buying guides, how-tos and news from the Buildivo team.",
  alternates: { canonical: "/blog" },
};

const date = (value: string | null) => (value ? new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "");

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ category?: string; page?: string }> }) {
  const params = await searchParams;
  const category = typeof params.category === "string" ? params.category : undefined;
  const page = Math.max(1, Math.floor(Number(params.page) || 1));
  const [result, categories] = await Promise.all([fetchBlogPosts({ page, perPage: 12, category }).catch(() => null), fetchBlogCategories()]);
  const href = (nextPage: number) => `/blog?${new URLSearchParams({ ...(category ? { category } : {}), page: String(nextPage) })}`;

  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 py-10 sm:px-8">
      <h1 className="text-3xl font-bold">Blog</h1>
      <p className="mt-2 text-text-secondary">Buying guides, how-tos and news from the Buildivo team.</p>
      {categories.length > 0 && (
        <nav aria-label="Blog categories" className="mt-6 flex flex-wrap gap-2">
          <Link href="/blog" aria-current={!category ? "page" : undefined} className={`rounded-full border px-4 py-1.5 text-sm ${!category ? "border-orange-500 bg-orange-500 text-white" : "border-border-default hover:border-orange-400"}`}>All</Link>
          {categories.map((item) => (
            <Link key={item.slug} href={`/blog?category=${encodeURIComponent(item.slug)}`} aria-current={category === item.slug ? "page" : undefined} className={`rounded-full border px-4 py-1.5 text-sm ${category === item.slug ? "border-orange-500 bg-orange-500 text-white" : "border-border-default hover:border-orange-400"}`}>{item.title}</Link>
          ))}
        </nav>
      )}
      {!result ? <p role="status" className="mt-8">The blog is temporarily unavailable. Please try again shortly.</p> : result.items.length === 0 ? <p className="mt-8">No posts yet.</p> : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {result.items.map((post) => (
            <article key={post.slug} className="flex flex-col rounded-xl border border-border-default bg-white p-6">
              {post.blogCategory && <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">{post.blogCategory.title}</p>}
              <h2 className="mt-2 text-xl font-bold"><Link href={`/blog/${post.slug}`} className="hover:text-orange-700 focus-visible:outline-orange-600">{post.title}</Link></h2>
              {post.excerpt && <p className="mt-2 text-text-secondary">{post.excerpt}</p>}
              <p className="mt-auto pt-4 text-sm text-text-secondary">{[post.author?.name, date(post.publishedAt)].filter(Boolean).join(" · ")}</p>
            </article>
          ))}
        </div>
      )}
      {result && result.meta.totalPages > 1 && (
        <nav aria-label="Blog pages" className="mt-8 flex gap-6 text-orange-700">
          {page > 1 && <Link href={href(page - 1)} className="underline">Previous page</Link>}
          {page < result.meta.totalPages && <Link href={href(page + 1)} className="underline">Next page</Link>}
        </nav>
      )}
    </div>
  );
}
