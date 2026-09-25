import styles from "@/components/commerce/category-mobile.module.css";
import { CategoryExtras } from "@/components/commerce/category-extras";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductListing } from "@/components/commerce/product-listing";
import { fetchCategoryBySlug, fetchCategoryTree, fetchDepartments, fetchProducts, fetchToolPlatforms } from "@/lib/api";
import { cn } from "@/lib/utils";

interface CategoryPageProps {
  params: Promise<{ slugs: string[] }>;
  searchParams: Promise<{ platform?: string }>;
}

const POWER_TOOLS_DESCRIPTION =
  "Industrial cordless platforms, brushless SDS rotary hammers, high-torque impact drivers, and precision cutting tools certified to EN 60745 industrial site standards. Guaranteed next-day depot dispatch across Great Britain.";

const POWER_TOOLS_FEATURES = [
  { icon: "local_shipping", title: "Free Next-Day Delivery", caption: "Orders over £75 ex.VAT" },
  { icon: "receipt_long", title: "15% Trade Net 30", caption: "Direct billing available" },
  { icon: "verified_user", title: "3-Yr Warranty", caption: "Direct manufacturer backed" },
];

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slugs } = await params;
  const category = await fetchCategoryBySlug(slugs[slugs.length - 1]);
  if (!category) return { title: "Category" };
  const description = `Shop ${category.name} at Buildivo${category.productCount ? ` - ${category.productCount} products` : ""} with fast delivery and trade pricing.`;
  return { title: category.name, description, alternates: { canonical: `/c/${category.slug}` }, openGraph: { title: category.name, description, url: `/c/${category.slug}` } };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slugs } = await params;
  const { platform } = await searchParams;
  const activeSlug = slugs[slugs.length - 1];
  const [category, departments, tree, initialProducts, platforms, accessories] = await Promise.all([
    fetchCategoryBySlug(activeSlug),
    fetchDepartments(),
    fetchCategoryTree(),
    fetchProducts({ category: activeSlug, platform, page: 1, perPage: 12, sort: "newest" }),
    fetchToolPlatforms(activeSlug),
    activeSlug === "power-tools" ? fetchProducts({ category: "hardware-fixings", page: 1, perPage: 4, sort: "newest" }).then((result) => result.items).catch(() => []) : Promise.resolve([]),
  ]);
  if (!category) notFound();

  const parentDepartment = category.parentSlug ? departments.find((d) => d.slug === category.parentSlug) : undefined;
  const isPowerTools = category.slug === "power-tools";
  const powerToolsSubcategories = isPowerTools ? tree.filter((c) => c.parentSlug === "power-tools") : [];

  return (
    <div className={styles.page}>
      <div data-category-breadcrumb className="border-b border-border-default bg-surface-white">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-2 px-4 py-3 text-label-sm font-label-sm text-text-secondary sm:px-margin-desktop">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1">
            <Link href="/" className="flex items-center hover:underline">
              <span aria-hidden className="material-symbols-outlined text-[16px]">home</span>
              <span className="sr-only">Home</span>
            </Link>
            <span aria-hidden>/</span>
            {isPowerTools ? (
              <>
                <span>Tools</span>
                <span aria-hidden>/</span>
              </>
            ) : parentDepartment ? (
              <>
                <Link href={`/c/${parentDepartment.slug}`} className="hover:underline">{parentDepartment.name}</Link>
                <span aria-hidden>/</span>
              </>
            ) : null}
            <span className="font-semibold text-text-primary">{category.name}</span>
          </nav>

          {isPowerTools ? (
            <div className="flex flex-wrap items-center gap-2 whitespace-nowrap">
              <span className="flex items-center gap-1.5 text-success-500">
                <span aria-hidden className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-success-500" />
                London Depot: 1,480 items ready for dispatch
              </span>
              <span aria-hidden className="text-border-default">|</span>
              <span>Official UK Distributor: DeWalt, Milwaukee, Makita, Bosch Pro</span>
            </div>
          ) : null}
        </div>
      </div>

      <div data-category-heading className="border-b border-border-default bg-surface-white">
        <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-margin-desktop">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-headline-lg-mobile font-headline-lg-mobile font-bold text-graphite-900 sm:text-headline-lg sm:font-headline-lg">
              {category.name}
            </h1>
            <span className="inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-label-sm font-label-sm font-semibold text-orange-600">
              {initialProducts.meta.total.toLocaleString()} <span className="sm:hidden">SKUs</span><span className="hidden sm:inline">{isPowerTools ? "Professional & DIY Models" : "Active Products"}</span>
            </span>
          </div>

          {isPowerTools ? (
            <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
              <p className="text-body-sm font-body-sm text-text-secondary lg:max-w-md">{POWER_TOOLS_DESCRIPTION}</p>

              <div className="flex flex-wrap gap-3">
                {POWER_TOOLS_FEATURES.map((feature) => (
                  <div key={feature.title} className="flex items-start gap-2 rounded-lg border border-border-default bg-surface-white px-3 py-2.5">
                    <span aria-hidden className="material-symbols-outlined mt-0.5 text-[18px] text-orange-600">{feature.icon}</span>
                    <div>
                      <p className="whitespace-nowrap text-label-sm font-label-sm font-semibold text-text-primary">{feature.title}</p>
                      <p className="whitespace-nowrap text-label-sm font-label-sm text-text-secondary">{feature.caption}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <nav aria-label="Subcategories" className={styles.tabs}>
        <Link href={`/c/${category.slug}`} aria-current="page">All {category.name}<span>{initialProducts.meta.total.toLocaleString()}</span></Link>
        {tree.filter((item) => item.parentSlug === category.slug).map((item) => (
          <Link key={item.slug} href={`/c/${item.slug}`}>{item.name}<span>{item.productCount.toLocaleString()}</span></Link>
        ))}
      </nav>

      {isPowerTools ? (
        <div data-desktop-subcategories className="border-b border-border-default bg-surface-white">
          <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-margin-desktop">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-label-sm font-label-sm font-semibold uppercase tracking-wide text-text-secondary">
                Shop by Power Tool Subcategory
              </p>
              <Link href="/c/power-tools" className="flex items-center gap-1 whitespace-nowrap text-label-sm font-label-sm font-semibold text-orange-600 hover:underline">
                View All Tool Classifications
                <span aria-hidden className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
              {powerToolsSubcategories.map((item) => (
                <Link
                  key={item.slug}
                  href={`/c/${item.slug}`}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-colors hover:border-orange-300 hover:bg-orange-50",
                    item.slug === activeSlug ? "border-orange-500 bg-orange-50" : "border-border-default bg-surface-white",
                  )}
                >
                  <span aria-hidden className="material-symbols-outlined text-[26px] text-orange-600">{item.icon}</span>
                  <span className="text-body-sm font-body-sm font-semibold text-text-primary">{item.name}</span>
                  <span className="text-label-sm font-label-sm text-text-secondary">{item.productCount} Models</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <ProductListing initialProducts={initialProducts} categorySlug={activeSlug} categoryName={category.name} platform={platform} platforms={platforms} />
      {activeSlug === "power-tools" && <CategoryExtras accessories={accessories} />}
    </div>
  );
}
