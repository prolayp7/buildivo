import type { Metadata } from "next";
import Link from "next/link";
import { BundleCard } from "@/components/bundles/bundle-card";
import { fetchBundles } from "@/lib/api";

export const metadata: Metadata = {
  title: "Project Bundles & Job Kits",
  description: "Complete material kits for common jobs, priced below buying each item separately.",
};

export default async function BundlesPage() {
  const bundles = await fetchBundles().catch(() => []);
  return (
    <div className="mx-auto max-w-[1600px] px-4 py-10 sm:px-margin-desktop">
      <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1 text-label-sm font-label-sm text-text-secondary">
        <Link href="/" className="hover:underline">Home</Link>
        <span aria-hidden>/</span>
        <span aria-current="page" className="text-graphite-900">Project bundles</span>
      </nav>
      <p className="mb-1 text-label-md font-label-md font-semibold uppercase tracking-wide text-orange-600">Turnkey project packs</p>
      <h1 className="mb-2 text-headline-lg-mobile font-headline-lg-mobile font-bold text-graphite-900 sm:text-headline-lg sm:font-headline-lg">Project bundles</h1>
      <p className="mb-8 max-w-2xl text-body-md font-body-md text-text-secondary">Everything for the job in one basket, at a bundle price below buying each item on its own.</p>
      {bundles.length ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {bundles.map((bundle) => <BundleCard key={bundle.slug} bundle={bundle} />)}
        </div>
      ) : (
        <p className="rounded-2xl bg-surface-warm p-10 text-center text-body-md text-text-secondary">No bundles are available right now. Please check back soon.</p>
      )}
    </div>
  );
}
