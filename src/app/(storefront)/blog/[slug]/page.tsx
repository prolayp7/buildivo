import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RichContent } from "@/components/content/rich-content";
import { JsonLd } from "@/components/seo/json-ld";
import { fetchBlogPost } from "@/lib/api";
import { cleanHtml } from "@/lib/cms-content";
import { SITE_NAME, absoluteUrl } from "@/lib/site";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

const date = (value: string | null) => (value ? new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "");

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchBlogPost(slug);
  if (!post) return { title: "Post not found" };
  const title = post.metaTitle || post.title;
  const description = post.metaDescription || post.excerpt || undefined;
  return {
    title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { type: "article", title, description, url: `/blog/${post.slug}`, publishedTime: post.publishedAt ?? undefined, modifiedTime: post.updatedAt, authors: post.author ? [post.author.name] : undefined },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await fetchBlogPost(slug);
  if (!post) notFound();
  const tags = Array.isArray(post.tags) ? post.tags.filter((tag): tag is string => typeof tag === "string") : [];

  return (
    <article className="mx-auto w-full max-w-[760px] px-4 py-10 sm:px-8">
      <JsonLd data={{
        "@context": "https://schema.org", "@type": "BlogPosting",
        headline: post.title, description: post.metaDescription || post.excerpt || undefined,
        datePublished: post.publishedAt ?? undefined, dateModified: post.updatedAt,
        author: post.author ? { "@type": "Person", name: post.author.name } : { "@type": "Organization", name: SITE_NAME },
        publisher: { "@type": "Organization", name: SITE_NAME },
        mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
      }} />
      <nav aria-label="Breadcrumb" className="text-sm text-text-secondary">
        <Link href="/" className="hover:underline">Home</Link> / <Link href="/blog" className="hover:underline">Blog</Link>
      </nav>
      {post.blogCategory && <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-orange-700"><Link href={`/blog?category=${encodeURIComponent(post.blogCategory.slug)}`}>{post.blogCategory.title}</Link></p>}
      <h1 className="mt-2 text-3xl font-bold leading-tight">{post.title}</h1>
      <p className="mt-3 text-sm text-text-secondary">{[post.author?.name, date(post.publishedAt)].filter(Boolean).join(" · ")}</p>
      <div className="mt-8"><RichContent html={cleanHtml(post.content)} /></div>
      {tags.length > 0 && <ul aria-label="Tags" className="mt-10 flex flex-wrap gap-2">{tags.map((tag) => <li key={tag} className="rounded-full bg-graphite-100 px-3 py-1 text-sm text-text-secondary">{tag}</li>)}</ul>}
      {post.author?.bio && <p className="mt-10 border-t border-border-default pt-6 text-sm text-text-secondary"><strong className="text-text-primary">{post.author.name}</strong> — {post.author.bio}</p>}
    </article>
  );
}
