import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RichContent } from "@/components/content/rich-content";
import { fetchCmsPage } from "@/lib/api";
import { pageContentToHtml } from "@/lib/cms-content";

// Static pages authored in the admin (About us, Privacy, Terms...), served at /<slug>. Any real
// route (cart, blog, search...) wins over this one, and an unknown slug is a normal 404.
interface CmsPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CmsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await fetchCmsPage(slug);
  if (!page) return { title: "Page not found" };
  return { title: page.metaTitle || page.title, description: page.metaDescription || undefined, alternates: { canonical: `/${page.slug}` } };
}

export default async function CmsPage({ params }: CmsPageProps) {
  const { slug } = await params;
  const page = await fetchCmsPage(slug);
  if (!page) notFound();
  return (
    <article className="mx-auto w-full max-w-[760px] px-4 py-10 sm:px-8">
      <h1 className="text-3xl font-bold leading-tight">{page.title}</h1>
      <div className="mt-8"><RichContent html={pageContentToHtml(page.contentBlocks)} /></div>
    </article>
  );
}
