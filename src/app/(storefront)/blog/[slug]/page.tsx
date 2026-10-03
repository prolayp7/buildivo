import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RichContent } from "@/components/content/rich-content";
import { GuideActions } from "@/components/content/guide-actions";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-json-ld";
import { JsonLd } from "@/components/seo/json-ld";
import { API_ORIGIN, fetchBlogPost, fetchBlogPosts, type BlogPost } from "@/lib/api";
import { cleanHtml } from "@/lib/cms-content";
import { SITE_NAME, absoluteUrl } from "@/lib/site";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

const date = (value: string | null) => (value ? new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "");

function readTime(post: BlogPost) {
  if (post.estimatedTimeMinutes) return `${post.estimatedTimeMinutes} min read`;
  const words = (post.content ?? "").replace(/<[^>]*>/g, " ").trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 200))} min read`;
}

function initials(name: string | undefined) {
  return name?.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "B";
}

function imageSource(post: BlogPost) {
  if (post.socialShareImage) {
    return post.socialShareImage.startsWith("/uploads/") ? `${API_ORIGIN}${post.socialShareImage}` : post.socialShareImage;
  }
  const topic = `${post.title} ${Array.isArray(post.tags) ? post.tags.join(" ") : ""} ${post.blogCategory?.title ?? ""}`.toLowerCase();
  if (/electric|wiring|lighting/.test(topic)) return "/images/projects/electrical.jpg";
  if (/deck|outdoor|timber|framing/.test(topic)) return "/images/projects/decking.jpg";
  if (/bath|plumb|heating/.test(topic)) return "/images/projects/bathroom.jpg";
  return "/images/projects/workshop.jpg";
}

function ArticleImage({ post, className }: { post: BlogPost; className: string }) {
  const hasCmsImage = Boolean(post.socialShareImage);
  return (
    <div className={`relative overflow-hidden bg-surface-container-low ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- CMS images may use arbitrary media hosts. */}
      <img src={imageSource(post)} alt={hasCmsImage ? post.socialShareImageAlt || post.title : ""} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
    </div>
  );
}

function articleContent(html: string) {
  const headings: { id: string; title: string; level: number }[] = [];
  let index = 0;
  const withAnchors = html.replace(/<(h2|h3)>([\s\S]*?)<\/\1>/gi, (match, tag: string, body: string) => {
    const title = body.replace(/<br\s*\/?\s*>/gi, " ").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#(?:39|x27);/gi, "'").trim();
    if (!title) return match;
    const id = `article-section-${++index}`;
    headings.push({ id, title, level: Number(tag.slice(1)) });
    return `<${tag} id="${id}">${body}</${tag}>`;
  });
  return { html: withAnchors, headings };
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchBlogPost(slug);
  if (!post) return { title: "Post not found", robots: { index: false, follow: false } };
  const title = post.metaTitle || post.title;
  const description = post.metaDescription || post.excerpt || undefined;
  const image = post.socialShareImage ? (post.socialShareImage.startsWith("/uploads/") ? `${API_ORIGIN}${post.socialShareImage}` : post.socialShareImage) : undefined;
  const url = `/blog/${post.slug}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: "article", title, description, url, publishedTime: post.publishedAt ?? undefined, modifiedTime: post.updatedAt, authors: post.author ? [post.author.name] : undefined, images: image ? [{ url: image, alt: post.socialShareImageAlt || title }] : undefined },
    twitter: { card: post.twitterCard === "SUMMARY" ? "summary" : "summary_large_image", title, description, images: image ? [image] : undefined },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await fetchBlogPost(slug);
  if (!post) notFound();
  const steps = (Array.isArray(post.steps) ? post.steps : []).filter((step) => step.title?.trim());
  const materials = (Array.isArray(post.materials) ? post.materials : []).filter((item) => item.label?.trim());
  const tags = Array.isArray(post.tags) ? post.tags.filter((tag): tag is string => typeof tag === "string") : [];
  const sanitizedArticle = articleContent(cleanHtml(post.content ?? ""));
  const relatedResult = await fetchBlogPosts({ page: 1, perPage: 4, category: post.blogCategory?.slug }).catch(() => null);
  const relatedPosts = relatedResult?.items.filter((item) => item.slug !== post.slug).slice(0, 3) ?? [];
  const readingTime = readTime(post);
  const isGuide = steps.length > 0;
  const updatedDate = date(post.updatedAt);
  const publishedDate = date(post.publishedAt);

  return (
    <main className="min-h-screen bg-surface-container-low">
      <div className="mx-auto w-full max-w-[1600px] px-4 pt-4 pb-10 sm:px-margin-desktop sm:pt-3 sm:pb-14">
      <BreadcrumbJsonLd items={[{ name: "Home", url: "/" }, { name: "Blog", url: "/blog" }, { name: post.title, url: `/blog/${post.slug}` }]} />
      <JsonLd data={{
        "@context": "https://schema.org", "@type": "BlogPosting",
        headline: post.title, description: post.metaDescription || post.excerpt || undefined,
        image: post.socialShareImage ? absoluteUrl(post.socialShareImage) : undefined,
        articleSection: post.blogCategory?.title,
        keywords: tags.length ? tags.join(", ") : undefined,
        datePublished: post.publishedAt ?? undefined, dateModified: post.updatedAt,
        author: post.author ? { "@type": "Person", name: post.author.name } : { "@type": "Organization", name: SITE_NAME },
        publisher: { "@type": "Organization", name: SITE_NAME },
        mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
      }} />
      {steps.length > 0 && (
        <JsonLd data={{
          "@context": "https://schema.org", "@type": "HowTo",
          name: post.title, description: post.metaDescription || post.excerpt || undefined,
          totalTime: post.estimatedTimeMinutes ? `PT${post.estimatedTimeMinutes}M` : undefined,
          supply: materials.map((item) => ({ "@type": "HowToSupply", name: item.label, ...(item.productSlug ? { url: absoluteUrl(`/p/${item.productSlug}`) } : {}) })),
          step: steps.map((step, index) => ({ "@type": "HowToStep", position: index + 1, name: step.title, text: step.description || step.title, ...(step.imageUrl ? { image: step.imageUrl } : {}) })),
        }} />
      )}
        <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-2 text-[11px] text-text-secondary">
          <Link href="/" className="hover:text-orange-700">Home</Link>
          <span aria-hidden>/</span>
          <Link href="/guides" className="hover:text-orange-700">DIY &amp; Guides</Link>
          <span aria-hidden>/</span>
          <Link href="/blog" className="hover:text-orange-700">Blog &amp; Trade Knowledge Hub</Link>
          <span aria-hidden className="hidden sm:inline">/</span>
          <span aria-current="page" className="hidden max-w-[360px] truncate font-semibold text-graphite-900 sm:inline">{post.title}</span>
        </nav>

        <header className="mb-7 border-b border-border-default pb-6 sm:mb-8 sm:pb-7">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase">
            {post.blogCategory && <Link href={`/blog?category=${encodeURIComponent(post.blogCategory.slug)}`} className="text-orange-700 hover:underline">{post.blogCategory.title}</Link>}
            <span className="rounded-full bg-orange-100 px-2.5 py-1 text-orange-700">Featured trade insight</span>
            {tags[0] && <span className="rounded-full bg-white px-2.5 py-1 text-graphite-700">{tags[0]}</span>}
            <span className="text-text-secondary">{readingTime}</span>
          </div>
          <h1 className="max-w-[1100px] text-[30px] leading-[1.12] font-bold text-graphite-900 sm:text-[38px] lg:text-[44px]">{post.title}</h1>
          {post.excerpt && <p className="mt-3 max-w-[900px] text-sm leading-6 text-text-secondary sm:text-base">{post.excerpt}</p>}
          {(post.difficulty || post.estimatedTimeMinutes) && (
            <ul aria-label="Guide summary" className="mt-4 flex flex-wrap gap-2 text-xs">
              {post.difficulty && <li className="rounded-full bg-white px-3 py-1.5 font-semibold text-graphite-700">Difficulty: {post.difficulty}</li>}
              {post.estimatedTimeMinutes ? <li className="rounded-full bg-white px-3 py-1.5 font-semibold text-graphite-700">Time: {post.estimatedTimeMinutes >= 60 ? `${Math.floor(post.estimatedTimeMinutes / 60)} h ${post.estimatedTimeMinutes % 60 ? `${post.estimatedTimeMinutes % 60} min` : ""}` : `${post.estimatedTimeMinutes} min`}</li> : null}
            </ul>
          )}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border-default bg-white p-3 sm:px-4">
            <div className="flex min-w-0 items-center gap-3">
              <span aria-hidden className="flex size-9 shrink-0 items-center justify-center rounded-full bg-graphite-900 text-[11px] font-bold text-white">{initials(post.author?.name)}</span>
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-graphite-900">{post.author?.name || "Buildivo Editorial Team"}</p>
                <p className="truncate text-[10px] text-text-secondary">{post.author?.role || "Editorial team"}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-text-secondary">
              {publishedDate && <span>Published {publishedDate}</span>}
              {updatedDate && updatedDate !== publishedDate && <span>Updated {updatedDate}</span>}
              <span>{readingTime}</span>
              {post.author?.name && <span>Reviewed by {post.author.name}</span>}
            </div>
            <GuideActions title={post.title} kind={isGuide ? "guide" : "article"} />
          </div>
        </header>

        <div className={`grid items-start gap-5 lg:gap-6 ${sanitizedArticle.headings.length > 0 ? "lg:grid-cols-[210px_minmax(0,1fr)] xl:grid-cols-[210px_minmax(0,1fr)_280px]" : "lg:grid-cols-[minmax(0,1fr)_280px]"}`}>
          {sanitizedArticle.headings.length > 0 && (
            <nav aria-labelledby="article-toc-title" className="rounded-xl border border-border-default bg-white p-4 lg:sticky lg:top-24">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 id="article-toc-title" className="text-sm font-bold text-graphite-900">Table of contents</h2>
                <span className="text-[9px] uppercase text-text-secondary">{sanitizedArticle.headings.length} sections</span>
              </div>
              <ol className="flex flex-col gap-1.5">
                {sanitizedArticle.headings.map((heading, index) => (
                  <li key={heading.id} className={heading.level === 3 ? "pl-3" : ""}>
                    <a href={`#${heading.id}`} className="flex gap-2 rounded-md px-2 py-1.5 text-[11px] leading-4 text-text-secondary hover:bg-orange-50 hover:text-orange-700">
                      <span className="shrink-0 font-mono text-orange-600">{String(index + 1).padStart(2, "0")}</span>
                      <span>{heading.title}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}

          <article className={`min-w-0 ${sanitizedArticle.headings.length > 0 ? "lg:col-start-2" : ""}`}>
            <figure className="mb-6 overflow-hidden rounded-xl border border-border-default bg-white">
              <ArticleImage post={post} className="aspect-[16/9] w-full" />
              {post.socialShareImageAlt && <figcaption className="px-3 py-2 text-[10px] text-text-secondary">{post.socialShareImageAlt}</figcaption>}
            </figure>
            <div className="w-full min-w-0 overflow-x-auto rounded-xl border border-border-default bg-white p-4 sm:p-6 lg:p-8">
              <RichContent html={sanitizedArticle.html} />
              {materials.length > 0 && (
                <section aria-labelledby="guide-materials" className="mt-10 border-t border-border-default pt-6">
                  <h2 id="guide-materials" className="text-xl font-bold text-graphite-900">What you&apos;ll need</h2>
                  <ul className="mt-3 flex flex-col gap-2">
                    {materials.map((item, index) => (
                      <li key={index} className="flex flex-wrap items-baseline justify-between gap-2 rounded-lg bg-surface-container-low px-3 py-2 text-sm">
                        <span>{item.productSlug ? <Link href={`/p/${item.productSlug}`} className="font-medium text-orange-700 hover:underline">{item.label}</Link> : item.label}</span>
                        {item.quantity && <span className="text-text-secondary">{item.quantity}</span>}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              {steps.length > 0 && (
                <section aria-labelledby="guide-steps" className="mt-10 border-t border-border-default pt-6">
                  <h2 id="guide-steps" className="text-xl font-bold text-graphite-900">Step by step</h2>
                  <ol className="mt-5 flex flex-col gap-6">
                    {steps.map((step, index) => (
                      <li key={index} id={`guide-step-${index + 1}`} className="flex gap-4 scroll-mt-24">
                        <span aria-hidden className="flex size-8 shrink-0 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white">{index + 1}</span>
                        <div className="min-w-0">
                          <h3 className="text-lg font-bold text-graphite-900">{step.title}</h3>
                          {step.description && <p className="mt-1 whitespace-pre-line text-sm leading-6 text-text-primary">{step.description}</p>}
                          {step.imageUrl && /^https?:\/\//.test(step.imageUrl) && (
                            // eslint-disable-next-line @next/next/no-img-element -- admin-supplied URL on an arbitrary host
                            <img src={step.imageUrl} alt={step.title ?? ""} loading="lazy" className="mt-3 h-auto max-w-full rounded-lg" />
                          )}
                        </div>
                      </li>
                    ))}
                  </ol>
                </section>
              )}
              {tags.length > 0 && <ul aria-label="Tags" className="mt-8 flex flex-wrap gap-2 border-t border-border-default pt-5">{tags.map((tag) => <li key={tag} className="rounded-full bg-surface-container-low px-3 py-1.5 text-[11px] text-text-secondary">{tag}</li>)}</ul>}
              {post.author?.bio && <p className="mt-8 border-t border-border-default pt-5 text-sm leading-6 text-text-secondary"><strong className="text-text-primary">{post.author.name}</strong> {post.author.bio}</p>}
            </div>
          </article>

          <aside className={`flex min-w-0 flex-col gap-4 ${sanitizedArticle.headings.length > 0 ? "lg:col-start-2 xl:col-start-3 xl:row-start-1" : "lg:col-start-2 lg:row-start-1"}`}>
            <section aria-labelledby="tested-equipment" className="rounded-xl border border-border-default bg-white p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 id="tested-equipment" className="text-sm font-bold text-graphite-900">Tested equipment</h2>
                <span className="text-[9px] uppercase text-text-secondary">{materials.length} items</span>
              </div>
              {materials.length > 0 ? (
                <ul className="flex flex-col divide-y divide-border-default">
                  {materials.slice(0, 4).map((item, index) => (
                    <li key={index} className="py-3 first:pt-0 last:pb-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[9px] font-semibold uppercase text-orange-700">Trade material</p>
                          <p className="mt-1 text-xs font-semibold text-graphite-900">{item.productSlug ? <Link href={`/p/${item.productSlug}`} className="hover:text-orange-700">{item.label}</Link> : item.label}</p>
                        </div>
                        {item.quantity && <span className="shrink-0 text-[10px] text-text-secondary">{item.quantity}</span>}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs leading-5 text-text-secondary">This article has no linked equipment list.</p>
              )}
              <Link href="/c/power-tools" className="mt-3 flex min-h-9 items-center justify-center rounded-lg bg-graphite-900 px-3 text-xs font-semibold text-white hover:bg-graphite-700">Browse power tools</Link>
            </section>

            <section className="rounded-xl bg-graphite-900 p-4 text-white">
              <p className="mb-2 text-[9px] font-bold uppercase text-orange-400">Trade reference library</p>
              <h2 className="text-base leading-5 font-bold">Plan work with verified guides and calculators</h2>
              <div className="mt-4 flex flex-col gap-2">
                <Link href="/guides" className="flex min-h-9 items-center justify-between gap-2 rounded-lg bg-white/5 px-3 text-xs font-semibold hover:bg-white/10">Project guides <span aria-hidden className="text-orange-400">›</span></Link>
                <Link href="/calculators" className="flex min-h-9 items-center justify-between gap-2 rounded-lg bg-white/5 px-3 text-xs font-semibold hover:bg-white/10">Material calculators <span aria-hidden className="text-orange-400">›</span></Link>
              </div>
            </section>
          </aside>
        </div>

        {relatedPosts.length > 0 && (
          <section aria-labelledby="related-articles" className="mt-10 border-t border-border-default pt-7 sm:mt-12">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="mb-1 text-[10px] font-bold uppercase text-orange-700">Continue learning</p>
                <h2 id="related-articles" className="text-xl font-bold text-graphite-900 sm:text-2xl">Related trade guides and articles</h2>
              </div>
              <Link href="/blog" className="text-xs font-semibold text-orange-700 hover:underline">Explore all articles <span aria-hidden>→</span></Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map((related) => (
                <article key={related.slug} className="overflow-hidden rounded-xl border border-border-default bg-white">
                  <Link href={`/blog/${related.slug}`} aria-label={`Read ${related.title}`} className="block focus-visible:outline-2 focus-visible:outline-orange-500">
                    <ArticleImage post={related} className="aspect-[16/9] w-full" />
                  </Link>
                  <div className="p-4">
                    <p className="text-[10px] font-semibold uppercase text-orange-700">{related.blogCategory?.title || "Buildivo Guides"}</p>
                    <h3 className="mt-1 line-clamp-2 text-sm leading-5 font-bold text-graphite-900"><Link href={`/blog/${related.slug}`} className="hover:text-orange-700">{related.title}</Link></h3>
                    <p className="mt-2 text-[10px] text-text-secondary">{date(related.publishedAt)} · {readTime(related)}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
