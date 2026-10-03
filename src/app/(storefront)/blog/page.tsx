import type { Metadata } from "next";
import Link from "next/link";
import { API_ORIGIN, fetchBlogCategories, fetchBlogPosts, type BlogPost } from "@/lib/api";

export const metadata: Metadata = {
  title: "Blog & Trade Knowledge Hub",
  description: "Buying guides, technical advice and project know-how for tradespeople and DIY customers.",
  alternates: { canonical: "/blog" },
};

type BlogSort = "latest" | "oldest";

const date = (value: string | null) => (value ? new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "");

function postImage(post: BlogPost) {
  if (post.socialShareImage) {
    return post.socialShareImage.startsWith("/uploads/") ? `${API_ORIGIN}${post.socialShareImage}` : post.socialShareImage;
  }
  const topic = `${post.title} ${Array.isArray(post.tags) ? post.tags.join(" ") : ""} ${post.blogCategory?.title ?? ""}`.toLowerCase();
  if (/electric|wiring|lighting/.test(topic)) return "/images/projects/electrical.jpg";
  if (/deck|outdoor|timber|framing/.test(topic)) return "/images/projects/decking.jpg";
  if (/bath|plumb|heating/.test(topic)) return "/images/projects/bathroom.jpg";
  return "/images/projects/workshop.jpg";
}

function readTime(post: BlogPost) {
  if (post.estimatedTimeMinutes) return `${post.estimatedTimeMinutes} min read`;
  const wordCount = (post.content ?? "").replace(/<[^>]*>/g, " ").trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(wordCount / 200))} min read`;
}

function initials(name: string | undefined) {
  return name?.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "B";
}

function ArticleImage({ post, featured = false }: { post: BlogPost; featured?: boolean }) {
  const isCmsImage = Boolean(post.socialShareImage);
  const src = postImage(post);
  return (
    <div className={`relative w-full overflow-hidden bg-surface-container-low ${featured ? "min-h-56 lg:min-h-[340px]" : "aspect-[16/9]"}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- CMS images can come from arbitrary approved media hosts. */}
      <img src={src} alt={isCmsImage ? post.socialShareImageAlt || post.title : ""} loading={featured ? "eager" : "lazy"} decoding="async" className="absolute inset-0 h-full w-full object-cover" />
    </div>
  );
}

function ArticleCard({ post }: { post: BlogPost }) {
  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-border-default bg-white">
      <Link href={`/blog/${post.slug}`} aria-label={`Read ${post.title}`} className="block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500">
        <ArticleImage post={post} />
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <p className="mb-2 text-[11px] font-semibold uppercase text-orange-700">{post.blogCategory?.title || "Buildivo Guides"}</p>
        <h2 className="line-clamp-2 text-[18px] leading-6 font-bold text-graphite-900">
          <Link href={`/blog/${post.slug}`} className="hover:text-orange-700 focus-visible:outline-orange-600">{post.title}</Link>
        </h2>
        {post.excerpt && <p className="mt-2 line-clamp-3 text-sm leading-5 text-text-secondary">{post.excerpt}</p>}
        <div className="mt-auto flex items-center justify-between gap-3 pt-5 text-[11px] text-text-secondary">
          <span>{date(post.publishedAt)}</span>
          <Link href={`/blog/${post.slug}`} className="shrink-0 font-semibold text-orange-700 hover:underline">Read article <span aria-hidden>→</span></Link>
        </div>
      </div>
    </article>
  );
}

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ category?: string; page?: string; search?: string; sort?: string }> }) {
  const params = await searchParams;
  const category = typeof params.category === "string" ? params.category : undefined;
  const search = typeof params.search === "string" ? params.search.trim().slice(0, 120) : "";
  const sort: BlogSort = params.sort === "oldest" ? "oldest" : "latest";
  const page = Math.max(1, Math.floor(Number(params.page) || 1));
  const [result, categories] = await Promise.all([
    fetchBlogPosts({ page, perPage: 12, category, search }).catch(() => null),
    fetchBlogCategories(),
  ]);
  const posts = result ? [...result.items].sort((a, b) => {
    const difference = new Date(a.publishedAt ?? 0).getTime() - new Date(b.publishedAt ?? 0).getTime();
    return sort === "oldest" ? difference : -difference;
  }) : [];
  const featuredPost = posts[0];
  const articlePosts = posts.slice(1);

  const categoryHref = (slug?: string) => {
    const query = new URLSearchParams();
    if (slug) query.set("category", slug);
    if (search) query.set("search", search);
    if (sort !== "latest") query.set("sort", sort);
    return `/blog${query.size ? `?${query}` : ""}`;
  };
  const pageHref = (nextPage: number) => {
    const query = new URLSearchParams();
    if (category) query.set("category", category);
    if (search) query.set("search", search);
    if (sort !== "latest") query.set("sort", sort);
    query.set("page", String(nextPage));
    return `/blog?${query}`;
  };

  return (
    <main className="min-h-screen bg-surface-container-low">
      <div className="mx-auto w-full max-w-[1600px] px-4 pt-4 pb-5 sm:px-margin-desktop sm:pt-3 sm:pb-8">
        <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-2 text-[11px] text-text-secondary">
          <Link href="/" className="hover:text-orange-700">Home</Link>
          <span aria-hidden>/</span>
          <Link href="/guides" className="hover:text-orange-700">DIY &amp; Guides</Link>
          <span aria-hidden>/</span>
          <span aria-current="page" className="font-semibold text-graphite-900">Blog &amp; Trade Knowledge Hub</span>
        </nav>

        {featuredPost && (
          <article className="mb-8 grid overflow-hidden rounded-xl border border-border-default bg-white lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)]">
            <div className="order-2 flex min-w-0 flex-col p-5 sm:p-7 lg:order-1 lg:p-9">
              <div className="mb-4 flex flex-wrap items-center gap-2 text-[11px]">
                <span className="rounded-full bg-orange-100 px-2.5 py-1 font-bold uppercase text-orange-700">Featured trade insight</span>
                {featuredPost.blogCategory && <Link href={categoryHref(featuredPost.blogCategory.slug)} className="rounded-full bg-surface-container-low px-2.5 py-1 font-semibold text-graphite-700 hover:text-orange-700">{featuredPost.blogCategory.title}</Link>}
                <span className="text-text-secondary">{readTime(featuredPost)}</span>
              </div>
              <h1 className="max-w-3xl text-[28px] leading-[1.12] font-bold text-graphite-900 sm:text-[34px] sm:leading-[1.12]">{featuredPost.title}</h1>
              {featuredPost.excerpt && <p className="mt-4 max-w-2xl text-sm leading-6 text-text-secondary">{featuredPost.excerpt}</p>}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-border-default pt-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span aria-hidden className="flex size-9 shrink-0 items-center justify-center rounded-full bg-graphite-900 text-[11px] font-bold text-white">{initials(featuredPost.author?.name)}</span>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-graphite-900">{featuredPost.author?.name || "Buildivo Editorial Team"}</p>
                    <p className="truncate text-[10px] text-text-secondary">{[featuredPost.author?.role, date(featuredPost.publishedAt)].filter(Boolean).join(" · ")}</p>
                  </div>
                </div>
                <Link href={`/blog/${featuredPost.slug}`} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 text-xs font-bold text-white hover:bg-orange-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600">
                  Read full article <span aria-hidden>→</span>
                </Link>
              </div>
            </div>
            <Link href={`/blog/${featuredPost.slug}`} aria-label={`Read ${featuredPost.title}`} className="order-1 block focus-visible:outline-2 focus-visible:outline-orange-500 lg:order-2">
              <ArticleImage post={featuredPost} featured />
            </Link>
          </article>
        )}

        <section aria-label="Search and filter articles" className="mb-8 rounded-xl border border-border-default bg-white p-4 sm:p-5">
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
            <form action="/blog" method="get" className="flex min-w-0 gap-2">
              {category && <input type="hidden" name="category" value={category} />}
              {sort !== "latest" && <input type="hidden" name="sort" value={sort} />}
              <label htmlFor="blog-search" className="sr-only">Search articles</label>
              <input id="blog-search" name="search" type="search" defaultValue={search} placeholder="Search articles, guides and trade regulations..." className="h-10 min-w-0 flex-1 rounded-lg border border-border-default bg-white px-3 text-sm outline-none placeholder:text-text-disabled focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20" />
              <button type="submit" className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-graphite-900 px-3 text-xs font-bold text-white hover:bg-graphite-700 sm:px-4">Find articles</button>
            </form>
            <form action="/blog" method="get" className="flex items-center justify-end gap-2">
              {category && <input type="hidden" name="category" value={category} />}
              {search && <input type="hidden" name="search" value={search} />}
              <label htmlFor="blog-sort" className="shrink-0 text-[11px] font-semibold text-text-secondary">Sort by:</label>
              <select id="blog-sort" name="sort" defaultValue={sort} className="h-10 min-w-0 rounded-lg border border-border-default bg-white px-3 text-xs text-graphite-900 outline-none focus:border-orange-500">
                <option value="latest">Latest published</option>
                <option value="oldest">Oldest published</option>
              </select>
              <button type="submit" aria-label="Apply sort" title="Apply sort" className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border-default bg-white text-graphite-700 hover:border-orange-500 hover:text-orange-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500">
                <span aria-hidden className="material-symbols-outlined text-[18px]">sort</span>
              </button>
            </form>
          </div>
          {categories.length > 0 && (
            <nav aria-label="Blog categories" className="mt-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <Link href={categoryHref()} aria-current={!category ? "page" : undefined} className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold ${!category ? "bg-orange-500 text-white" : "bg-surface-container-low text-graphite-700 hover:bg-orange-100"}`}>All articles</Link>
              {categories.map((item) => (
                <Link key={item.slug} href={categoryHref(item.slug)} aria-current={category === item.slug ? "page" : undefined} className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold ${category === item.slug ? "bg-orange-500 text-white" : "bg-surface-container-low text-graphite-700 hover:bg-orange-100"}`}>{item.title}</Link>
              ))}
            </nav>
          )}
        </section>

        {!result ? (
          <p role="status" className="rounded-xl border border-border-default bg-white p-6 text-sm text-text-secondary">The blog is temporarily unavailable. Please try again shortly.</p>
        ) : posts.length === 0 ? (
          <p className="rounded-xl border border-border-default bg-white p-6 text-sm text-text-secondary">No articles match your search. Try another term or choose a different topic.</p>
        ) : (
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-8">
            <section aria-labelledby="latest-articles-heading">
              <div className="mb-4 flex items-end justify-between gap-3">
                <div>
                  <h2 id="latest-articles-heading" className="text-xl font-bold text-graphite-900">Latest articles</h2>
                  <p className="mt-1 text-xs text-text-secondary">{result.meta.total} {result.meta.total === 1 ? "article" : "articles"} for trade and DIY projects</p>
                </div>
              </div>
              {articlePosts.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {articlePosts.map((post) => <ArticleCard key={post.slug} post={post} />)}
                </div>
              ) : (
                <p className="rounded-xl border border-border-default bg-white p-5 text-sm text-text-secondary">More articles will appear here as they are published.</p>
              )}
              {result.meta.totalPages > 1 && (
                <nav aria-label="Blog pages" className="mt-6 flex items-center justify-between rounded-xl border border-border-default bg-white p-4 text-sm">
                  {page > 1 ? <Link href={pageHref(page - 1)} className="font-semibold text-orange-700 hover:underline">← Previous</Link> : <span />}
                  <span className="text-xs text-text-secondary">Page {page} of {result.meta.totalPages}</span>
                  {page < result.meta.totalPages ? <Link href={pageHref(page + 1)} className="font-semibold text-orange-700 hover:underline">Next →</Link> : <span />}
                </nav>
              )}
            </section>

            <aside className="flex flex-col gap-4 lg:sticky lg:top-24">
              <section className="rounded-xl bg-graphite-900 p-5 text-white">
                <p className="mb-2 text-[10px] font-bold uppercase text-orange-400">Trade resources</p>
                <h2 className="text-lg leading-6 font-bold">Trade Masterclasses &amp; Equipment Guides</h2>
                <p className="mt-2 text-xs leading-5 text-graphite-200">Practical references for choosing equipment, planning work and building trade skills.</p>
                <nav aria-label="Trade resources" className="mt-4 flex flex-col gap-2">
                  {[
                    { label: "DIY project guides", href: "/guides" },
                    { label: "Material calculators", href: "/calculators" },
                    { label: "Power tools", href: "/c/power-tools" },
                  ].map((resource) => (
                    <Link key={resource.href} href={resource.href} className="flex min-h-9 items-center justify-between gap-2 rounded-lg bg-white/5 px-3 text-xs font-semibold text-white hover:bg-white/10">
                      {resource.label}<span aria-hidden className="text-orange-400">›</span>
                    </Link>
                  ))}
                </nav>
              </section>

              <section className="rounded-xl border border-border-default bg-white p-5">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h2 className="text-base font-bold text-graphite-900">Recently published</h2>
                  <span className="text-[10px] text-text-secondary">Articles</span>
                </div>
                <ol className="flex flex-col divide-y divide-border-default">
                  {posts.slice(0, 4).map((post, index) => (
                    <li key={post.slug} className="py-3 first:pt-0 last:pb-0">
                      <Link href={`/blog/${post.slug}`} className="group flex gap-3">
                        <span className="pt-0.5 text-lg leading-5 font-bold text-orange-600">{String(index + 1).padStart(2, "0")}</span>
                        <span className="min-w-0">
                          <span className="line-clamp-2 block text-xs leading-4 font-semibold text-graphite-900 group-hover:text-orange-700">{post.title}</span>
                          <span className="mt-1 block text-[10px] text-text-secondary">{date(post.publishedAt)}{post.blogCategory ? ` · ${post.blogCategory.title}` : ""}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ol>
              </section>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}