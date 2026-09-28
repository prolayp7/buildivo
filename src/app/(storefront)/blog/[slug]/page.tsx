import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RichContent } from "@/components/content/rich-content";
import { JsonLd } from "@/components/seo/json-ld";
import { API_ORIGIN, fetchBlogPost } from "@/lib/api";
import { cleanHtml } from "@/lib/cms-content";
import { SITE_NAME, absoluteUrl } from "@/lib/site";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

const date = (value: string | null) => (value ? new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "");

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

  return (
    <article className="mx-auto w-full max-w-[760px] px-4 py-10 sm:px-8">
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
      <nav aria-label="Breadcrumb" className="text-sm text-text-secondary">
        <Link href="/" className="hover:underline">Home</Link> / <Link href="/blog" className="hover:underline">Blog</Link>
      </nav>
      {post.blogCategory && <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-orange-700"><Link href={`/blog?category=${encodeURIComponent(post.blogCategory.slug)}`}>{post.blogCategory.title}</Link></p>}
      <h1 className="mt-2 text-3xl font-bold leading-tight">{post.title}</h1>
      <p className="mt-3 text-sm text-text-secondary">{[post.author?.name, date(post.publishedAt)].filter(Boolean).join(" · ")}</p>
      {(post.difficulty || post.estimatedTimeMinutes) && (
        <ul aria-label="Guide summary" className="mt-4 flex flex-wrap gap-2 text-sm">
          {post.difficulty && <li className="rounded-full bg-orange-50 px-3 py-1 font-semibold text-orange-700">Difficulty: {post.difficulty}</li>}
          {post.estimatedTimeMinutes ? <li className="rounded-full bg-orange-50 px-3 py-1 font-semibold text-orange-700">Time: {post.estimatedTimeMinutes >= 60 ? `${Math.floor(post.estimatedTimeMinutes / 60)} h ${post.estimatedTimeMinutes % 60 ? `${post.estimatedTimeMinutes % 60} min` : ""}` : `${post.estimatedTimeMinutes} min`}</li> : null}
        </ul>
      )}
      <div className="mt-8"><RichContent html={cleanHtml(post.content)} /></div>
      {materials.length > 0 && (
        <section aria-labelledby="guide-materials" className="mt-10 rounded-xl border border-border-default bg-white p-5">
          <h2 id="guide-materials" className="text-xl font-bold">What you&apos;ll need</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {materials.map((item, index) => (
              <li key={index} className="flex flex-wrap items-baseline justify-between gap-2">
                <span>{item.productSlug ? <Link href={`/p/${item.productSlug}`} className="font-medium text-orange-700 underline">{item.label}</Link> : item.label}</span>
                {item.quantity && <span className="text-text-secondary">{item.quantity}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}
      {steps.length > 0 && (
        <section aria-labelledby="guide-steps" className="mt-10">
          <h2 id="guide-steps" className="text-xl font-bold">Step by step</h2>
          <ol className="mt-4 flex flex-col gap-6">
            {steps.map((step, index) => (
              <li key={index} className="flex gap-4">
                <span aria-hidden className="flex size-9 shrink-0 items-center justify-center rounded-full bg-orange-500 font-bold text-white">{index + 1}</span>
                <div className="min-w-0">
                  <h3 className="text-lg font-bold">{step.title}</h3>
                  {step.description && <p className="mt-1 whitespace-pre-line text-text-primary">{step.description}</p>}
                  {step.imageUrl && /^https?:\/\//.test(step.imageUrl) && (
                    // eslint-disable-next-line @next/next/no-img-element -- admin-supplied URL on an arbitrary host
                    <img src={step.imageUrl} alt={step.title ?? ""} loading="lazy" className="mt-3 max-w-full rounded-lg" />
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}
      {tags.length > 0 && <ul aria-label="Tags" className="mt-10 flex flex-wrap gap-2">{tags.map((tag) => <li key={tag} className="rounded-full bg-graphite-100 px-3 py-1 text-sm text-text-secondary">{tag}</li>)}</ul>}
      {post.author?.bio && <p className="mt-10 border-t border-border-default pt-6 text-sm text-text-secondary"><strong className="text-text-primary">{post.author.name}</strong> — {post.author.bio}</p>}
    </article>
  );
}
