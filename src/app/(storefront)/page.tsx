import { TrustStrip } from "@/components/home/trust-strip";
import Link from "next/link";
import type { Metadata } from "next";
import { ProductImage } from "@/components/commerce/product-image";
import { TileCalculator } from "@/components/home/tile-calculator";
import { BatteryMatcher } from "@/components/home/battery-matcher";
import { JsonLd } from "@/components/seo/json-ld";
import { SITE_NAME, absoluteUrl } from "@/lib/site";
import { HomeHero } from "@/components/home/hero/home-hero";
import ShopByDepartment  from "@/components/commerce/shop-by-department";
import FeaturedProducts  from "@/components/commerce/featured-products";
import ProjectKits  from "@/components/commerce/project-kits";
import TradeCTA  from "@/components/commerce/trade-cta";
import { fetchCalculatorsContent, fetchDepartments, fetchEcosystemMatcherContent, fetchFeaturedProducts, fetchFloatingBadge, fetchHeroSlides, fetchProjectKitsContent, fetchToolPlatforms, fetchTrustBadges, fetchVisibleHomepageSections } from "@/lib/api";

export const metadata: Metadata = {
  title: "Buildivo — Pro-Grade Tools, Hardware & DIY Supplies",
  alternates: { canonical: "/" },
};

// Image/slug/categorySlug are structural (tied to real asset paths and
// category routing), so they stay hardcoded here - only the text/stat
// fields below come from ProjectKitsContent (admin-editable).
const projectKitAssets = [
  { slug: "decking-outdoor-framing", image: "/images/projects/decking.jpg", categorySlug: "garden-outdoor" },
  { slug: "complete-bathroom-refit", image: "/images/projects/bathroom.jpg", categorySlug: "plumbing-heating" },
  { slug: "jobsite-rough-in", image: "/images/projects/electrical.jpg", categorySlug: "electrical-lighting" },
  { slug: "workshop-storage-build", image: "/images/projects/workshop.jpg", categorySlug: "storage" },
];

export default async function HomePage() {
  const [departments, featured, visibleSections, heroSlides, trustBadges, floatingBadge, calculatorsContent, ecosystemMatcherContent, projectKitsContent, toolPlatforms] = await Promise.all([
    fetchDepartments(),
    fetchFeaturedProducts(4),
    fetchVisibleHomepageSections(),
    fetchHeroSlides(),
    fetchTrustBadges(),
    fetchFloatingBadge(),
    fetchCalculatorsContent(),
    fetchEcosystemMatcherContent(),
    fetchProjectKitsContent(),
    fetchToolPlatforms(),
  ]);
  const calculators = [
    { slug: "concrete-mortar", icon: calculatorsContent.calc1Icon, label: calculatorsContent.calc1Label, caption: calculatorsContent.calc1Caption },
    { slug: "paint-coverage", icon: calculatorsContent.calc2Icon, label: calculatorsContent.calc2Label, caption: calculatorsContent.calc2Caption },
    { slug: "flooring-underlay", icon: calculatorsContent.calc3Icon, label: calculatorsContent.calc3Label, caption: calculatorsContent.calc3Caption },
  ];
  const projects = [
    { ...projectKitAssets[0], name: projectKitsContent.kit1Name, description: projectKitsContent.kit1Description, specLabel: projectKitsContent.kit1SpecLabel, specValue: projectKitsContent.kit1SpecValue, est: projectKitsContent.kit1Est, itemCount: projectKitsContent.kit1ItemCount },
    { ...projectKitAssets[1], name: projectKitsContent.kit2Name, description: projectKitsContent.kit2Description, specLabel: projectKitsContent.kit2SpecLabel, specValue: projectKitsContent.kit2SpecValue, est: projectKitsContent.kit2Est, itemCount: projectKitsContent.kit2ItemCount },
    { ...projectKitAssets[2], name: projectKitsContent.kit3Name, description: projectKitsContent.kit3Description, specLabel: projectKitsContent.kit3SpecLabel, specValue: projectKitsContent.kit3SpecValue, est: projectKitsContent.kit3Est, itemCount: projectKitsContent.kit3ItemCount },
    { ...projectKitAssets[3], name: projectKitsContent.kit4Name, description: projectKitsContent.kit4Description, specLabel: projectKitsContent.kit4SpecLabel, specValue: projectKitsContent.kit4SpecValue, est: projectKitsContent.kit4Est, itemCount: projectKitsContent.kit4ItemCount },
  ];
  return (
    <div className="flex flex-col">
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Organization", name: SITE_NAME, url: absoluteUrl("/") }} />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "WebSite", name: SITE_NAME, url: absoluteUrl("/"), potentialAction: { "@type": "SearchAction", target: absoluteUrl("/search?q={search_term_string}"), "query-input": "required name=search_term_string" } }} />
      {visibleSections.has("HERO") && heroSlides.length > 0 && <HomeHero slides={heroSlides} floatingBadge={floatingBadge} />}

      {visibleSections.has("TRUST_STRIP") && trustBadges.length > 0 && (
      <TrustStrip badges={trustBadges} />
      )}

      {visibleSections.has("DEPARTMENTS") && (
      <ShopByDepartment />
      )}

      {visibleSections.has("FEATURED_PRODUCTS") && (
      <FeaturedProducts />
      )}

      {visibleSections.has("PROJECT_KITS") && (
      <section id="project-kits" className="w-full bg-white py-12 sm:py-16" style={{ backgroundColor: "#ffffff" }}>
        <div className="mx-auto max-w-[1600px] px-4 sm:px-margin-desktop">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-1 text-label-md font-label-md font-semibold uppercase tracking-wide text-orange-600">{projectKitsContent.badgeLabel}</p>
              <h2 className="mb-1 text-headline-lg-mobile font-headline-lg-mobile font-bold text-graphite-900 sm:text-headline-lg sm:font-headline-lg">
                {projectKitsContent.heading}
              </h2>
              <p className="max-w-2xl text-body-md font-body-md text-text-secondary">
                {projectKitsContent.description}
              </p>
            </div>
            <p className="text-label-sm font-label-sm text-text-secondary">{projectKitsContent.footnote}</p>
          </div>
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:pb-0 lg:grid-cols-4">
            {projects.map((project) => (
              <div
                key={project.slug}
                className="flex w-[85%] min-w-[85%] snap-start flex-col overflow-hidden rounded-2xl bg-surface-warm sm:w-auto sm:min-w-0"
              >
                <div className="relative">
                  <ProductImage
                    src={project.image}
                    categorySlug={project.categorySlug}
                    className="aspect-[3/2] w-full object-cover"
                  />

                  <span className="absolute left-3 top-3 rounded-full bg-graphite-900/90 px-2.5 py-1 text-label-sm font-label-sm font-semibold text-text-inverse">
                    {project.itemCount} items bundled
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <h3 className="mb-1 min-h-14 text-[20px] leading-7 font-semibold text-graphite-900">
                    {project.name}
                  </h3>

                  <p className="mb-4 line-clamp-2 min-h-10 text-body-sm font-body-sm text-text-secondary">
                    {project.description}
                  </p>

                  <div className="mb-8 space-y-2 rounded-xl bg-surface-white p-3">
                    <div className="flex items-center justify-between gap-2 text-label-sm font-label-sm">
                      <span className="text-text-secondary">
                        {project.specLabel}:
                      </span>

                      <span className="font-bold text-graphite-900">
                        {project.specValue}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 text-label-sm font-label-sm">
                      <span className="text-text-secondary">
                        Est. Materials Total:
                      </span>

                      <span className="font-bold text-orange-600">
                        {project.est}
                      </span>
                    </div>
                  </div>

                  <Link
                    href="/guides"
                    className="mt-auto flex min-h-10 items-center justify-center gap-2 rounded-xl bg-surface-white px-3 py-2.5 text-label-md font-label-md font-semibold text-text-primary transition-colors hover:bg-orange-500 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-500"
                  >
                    View Material List
                    <span
                      aria-hidden
                      className="material-symbols-outlined text-[16px]"
                    >
                      list_alt
                    </span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      )}

      {visibleSections.has("TRADE_CTA") && (
      <TradeCTA />
      )}

      {visibleSections.has("CALCULATORS") && (
      <section className="mx-auto w-full max-w-[1600px] px-4 py-10 sm:px-margin-desktop">
        <p className="mb-1 text-label-md font-label-md font-semibold uppercase tracking-wide text-orange-600">
          {calculatorsContent.eyebrow}
        </p>

        <h2 className="mb-1 text-headline-lg-mobile font-headline-lg-mobile font-bold text-graphite-900 sm:text-headline-lg sm:font-headline-lg">
          {calculatorsContent.heading}
        </h2>

        <p className="mb-8 max-w-[560px] text-body-md font-body-md text-text-secondary">
          {calculatorsContent.description}
        </p>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          
          <TileCalculator />

          {/* Calculator swipe area on mobile */}
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 lg:grid lg:grid-rows-3 lg:gap-4 lg:overflow-visible lg:pb-0">
            {calculators.map((calc) => (
              <Link
                key={calc.slug}
                href="/calculators"
                className="flex w-[85%] min-w-[85%] snap-start items-center justify-between gap-4 rounded-2xl bg-surface-white px-5 py-7 shadow-[0_1px_2px_rgb(0_0_0/0.05)] transition-colors hover:bg-orange-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-500 lg:w-auto lg:min-w-0 lg:min-h-32"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <span
                    aria-hidden
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-container-low text-graphite-900"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {calc.icon}
                    </span>
                  </span>

                  <div>
                    <p className="text-[18px] leading-6 font-bold text-graphite-900">
                      {calc.label}
                    </p>

                    <p className="text-[14px] leading-5 text-text-secondary">
                      {calc.caption}
                    </p>
                  </div>
                </div>

                <span
                  aria-hidden
                  className="material-symbols-outlined shrink-0 text-[20px] text-graphite-400"
                >
                  arrow_forward
                </span>
              </Link>
            ))}
          </div>

        </div>
      </section>
      )}

      {visibleSections.has("ECOSYSTEM_MATCHER") && (
      <section className="mx-auto w-full max-w-[1600px] px-4 pb-14 sm:px-margin-desktop">
        <BatteryMatcher content={ecosystemMatcherContent} platforms={toolPlatforms} />
      </section>
      )}
    </div>
  );
}
