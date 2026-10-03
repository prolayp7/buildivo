import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RichContent } from "@/components/content/rich-content";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-json-ld";
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
    <main className="min-h-screen bg-surface-container-low">
      <div className="mx-auto w-full max-w-[1600px] px-4 pt-4 pb-6 sm:px-margin-desktop sm:pt-3 sm:pb-10">
        <BreadcrumbJsonLd items={[{ name: "Home", url: "/" }, { name: page.title, url: `/${page.slug}` }]} />
        <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-2 text-label-sm font-label-sm text-text-secondary">
          <Link href="/" className="hover:text-orange-700">Home</Link>
          <span aria-hidden>/</span>
          <span aria-current="page" className="font-semibold text-graphite-900">{page.title}</span>
        </nav>
        <article className="w-full">
          <h1 className="mb-6 text-headline-lg-mobile font-headline-lg-mobile font-bold text-graphite-900 sm:text-headline-lg sm:font-headline-lg">{page.title}</h1>
          <RichContent html={pageContentToHtml(page.contentBlocks)} />
        </article>
      </div>
    </main>
  );
}
