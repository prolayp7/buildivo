import Link from "next/link";
import { DotPattern } from "@/components/ui/dot-pattern";
import type { Metadata } from "next";
import { ProductCard } from "@/components/commerce/product-card";
import { ProductImage } from "@/components/commerce/product-image";
import { TileCalculator } from "@/components/home/tile-calculator";
import { BatteryMatcher } from "@/components/home/battery-matcher";
import { JsonLd } from "@/components/seo/json-ld";
import { SITE_NAME, absoluteUrl } from "@/lib/site";
import { HomeHero } from "@/components/home/hero/home-hero";
import { fetchCalculatorsContent, fetchDepartments, fetchEcosystemMatcherContent, fetchFeaturedProducts, fetchFloatingBadge, fetchHeroSlides, fetchProjectKitsContent, fetchToolPlatforms, fetchTradeCtaContent, fetchTrustBadges, fetchVisibleHomepageSections } from "@/lib/api";

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
  const [departments, featured, visibleSections, heroSlides, trustBadges, floatingBadge, tradeCta, calculatorsContent, ecosystemMatcherContent, projectKitsContent, toolPlatforms] = await Promise.all([
    fetchDepartments(),
    fetchFeaturedProducts(4),
    fetchVisibleHomepageSections(),
    fetchHeroSlides(),
    fetchTrustBadges(),
    fetchFloatingBadge(),
    fetchTradeCtaContent(),
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
      <section className="bg-surface-warm">
        <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-4 sm:grid-cols-2 px-4 py-6 sm:px-margin-desktop lg:grid-cols-4">
          {trustBadges.map((badge) => (
            <div key={badge.id} className="flex min-h-16 items-center gap-2 rounded-lg bg-white p-3 shadow-[0_1px_2px_rgb(0_0_0/0.05)]">
              <span aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                <span className="material-symbols-outlined text-[22px]">{badge.icon ?? "verified"}</span>
              </span>
              <div>
                <p className="text-[12px] leading-4 font-semibold text-graphite-900">{badge.label}</p>
                <p className="text-label-sm font-label-sm text-text-secondary">{badge.caption}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      )}

      {visibleSections.has("DEPARTMENTS") && (
      <section id="departments" className="mx-auto w-full max-w-[1600px] scroll-mt-40 px-4 py-10 sm:px-margin-desktop">
        <div className="mb-space-lg flex items-center justify-between">
          <h2 className="text-headline-lg-mobile font-headline-lg-mobile font-bold text-graphite-900 sm:text-headline-lg sm:font-headline-lg">Shop by Department</h2>
          <Link href="/c/power-tools" className="text-label-lg font-label-lg font-semibold text-orange-600 hover:underline">
            View all 45,000+ SKUs
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {departments.map((dept) => (
            <Link
              key={dept.slug}
              href={`/c/${dept.slug}`}
              className="flex flex-col items-center gap-2 rounded-xl border border-border-default bg-surface-white p-4 text-center transition-colors hover:border-orange-500 hover:bg-orange-50"
            >
              <span aria-hidden className="material-symbols-outlined text-[28px] text-orange-600">{dept.icon}</span>
              <span className="text-body-sm font-body-sm font-semibold text-text-primary">{dept.name}</span>
              <span className="text-label-sm font-label-sm text-text-secondary">{dept.productCount.toLocaleString()}+ lines</span>
            </Link>
          ))}
        </div>
      </section>
      )}

      {visibleSections.has("FEATURED_PRODUCTS") && (
      <section className="mx-auto w-full max-w-[1600px] px-4 py-10 sm:px-margin-desktop">
        <div className="mb-space-lg flex items-center justify-between">
          <h2 className="text-headline-lg-mobile font-headline-lg-mobile font-bold text-graphite-900 sm:text-headline-lg sm:font-headline-lg">Featured Pro Tools</h2>
          <Link href="/c/power-tools" className="text-label-lg font-label-lg font-semibold text-orange-600 hover:underline">
            Shop all Power Tools
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} featured />
          ))}
        </div>
      </section>
      )}

      {visibleSections.has("PROJECT_KITS") && (
      <section className="w-full bg-white py-12 sm:py-16" id="project-kits" style={{ backgroundColor: "#ffffff" }}>
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
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {projects.map((project) => (
            <div key={project.slug} className="flex h-full flex-col overflow-hidden rounded-2xl bg-surface-warm">
              <div className="relative">
                <ProductImage src={project.image} categorySlug={project.categorySlug} className="aspect-[3/2] w-full object-cover" />
                <span className="absolute left-3 top-3 rounded-full bg-graphite-900/90 px-2.5 py-1 text-label-sm font-label-sm font-semibold text-text-inverse">
                  {project.itemCount} items bundled
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="mb-1 min-h-14 text-[20px] leading-7 font-semibold text-graphite-900">{project.name}</h3>
                <p className="mb-4 line-clamp-2 min-h-10 text-body-sm font-body-sm text-text-secondary">{project.description}</p>
                <div className="mb-8 space-y-2 rounded-xl bg-surface-white p-3">
                  <div className="flex items-center justify-between gap-2 text-label-sm font-label-sm">
                    <span className="text-text-secondary">{project.specLabel}:</span>
                    <span className="font-bold text-graphite-900">{project.specValue}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 text-label-sm font-label-sm">
                    <span className="text-text-secondary">Est. Materials Total:</span>
                    <span className="font-bold text-orange-600">{project.est}</span>
                  </div>
                </div>
                <Link
                  href="/guides"
                  className="mt-auto flex min-h-10 items-center justify-center gap-2 rounded-xl bg-surface-white px-3 py-2.5 text-label-md font-label-md font-semibold text-text-primary transition-colors hover:bg-orange-500 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-500"
                >
                  View Material List
                  <span aria-hidden className="material-symbols-outlined text-[16px]">list_alt</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
        </div>
      </section>
      )}

      {visibleSections.has("TRADE_CTA") && (
      <section className="relative isolate w-full overflow-hidden bg-[#080f18] text-[#9aabba]" style={{ backgroundImage: "radial-gradient(ellipse at 72% 0%, rgba(100, 139, 171, 0.08), transparent 58%), linear-gradient(115deg, #070e16 0%, #111f2c 48%, #0b1520 76%, #070e16 100%)" }}>
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(155deg,transparent_15%,rgba(213,234,250,0.025)_34%,transparent_52%)]" />
        <DotPattern width={32} height={32} cr={1.3} glow className="text-[#b5d7ed]/35 [mask-image:radial-gradient(ellipse_at_65%_40%,black,transparent_75%)]" />
        <div className="relative z-10 mx-auto max-w-[1600px] px-4 py-12 sm:px-margin-desktop lg:py-16">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,2.1fr)_minmax(0,1fr)] lg:gap-7">
            <div>
              <span className="mb-4 inline-flex items-center gap-2 rounded-sm bg-[#0c1722] px-3 py-1 text-label-sm font-label-sm font-bold uppercase tracking-wide text-orange-500">
                <span aria-hidden className="material-symbols-outlined text-[14px]">badge</span>
                {tradeCta.badgeLabel}
              </span>
              <h2 className="mb-4 text-[28px] leading-tight font-bold tracking-[-0.025em] text-text-inverse sm:text-[36px]">
                {tradeCta.heading}
              </h2>
              <p className="mb-8 max-w-[650px] text-[18px] leading-7 text-[#91a3b5]">
                {tradeCta.description}
              </p>
              <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div className="min-h-[142px] rounded-[14px] bg-[#0e1a26] p-4">
                  <p className="text-[32px] leading-8 font-bold tracking-tight text-orange-500">{tradeCta.stat1Value}</p>
                  <p className="text-[16px] leading-6 font-semibold text-text-inverse">{tradeCta.stat1Label}</p>
                  <p className="mt-1 text-[11px] leading-6">{tradeCta.stat1Caption}</p>
                </div>
                <div className="min-h-[142px] rounded-[14px] bg-[#0e1a26] p-4">
                  <span aria-hidden className="material-symbols-outlined mb-2 block text-[28px] text-orange-500">
                    {tradeCta.stat2Icon}
                  </span>
                  <p className="text-[16px] leading-6 font-semibold text-text-inverse">{tradeCta.stat2Label}</p>
                  <p className="mt-1 text-[11px] leading-6">{tradeCta.stat2Caption}</p>
                </div>
                <div className="min-h-[142px] rounded-[14px] bg-[#0e1a26] p-4">
                  <span aria-hidden className="material-symbols-outlined mb-2 block text-[28px] text-orange-500">
                    {tradeCta.stat3Icon}
                  </span>
                  <p className="text-[16px] leading-6 font-semibold text-text-inverse">{tradeCta.stat3Label}</p>
                  <p className="mt-1 text-[11px] leading-6">{tradeCta.stat3Caption}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href={tradeCta.ctaHref}
                  className="inline-flex items-center min-h-[52px] justify-center gap-2 rounded-xl bg-orange-500 px-8 py-3 font-label-lg text-label-lg font-bold text-text-inverse transition-colors hover:bg-orange-600 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-500"
                >
                  {tradeCta.ctaLabel}
                  <span aria-hidden className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
                <p className="flex items-center gap-1.5 text-label-sm font-label-sm">
                  <span aria-hidden className="material-symbols-outlined text-[16px] text-orange-500">bolt</span>
                  {tradeCta.microcopy}
                </p>
              </div>
            </div>
            <div className="flex min-h-[242px] flex-col rounded-2xl bg-[#0b1721] p-6">
              <div className="mb-6 flex items-center justify-between gap-3">
                <span className="flex items-center gap-2">
                  <span aria-hidden className="material-symbols-outlined text-[26px] text-orange-500">
                    deployed_code
                  </span>
                  <span className="text-[20px] leading-7 font-bold text-text-inverse">{tradeCta.previewBrand}</span>
                </span>
                <span className="rounded-sm bg-success-500/20 px-2.5 py-0.5 text-label-sm font-label-sm font-semibold uppercase tracking-wide text-success-500">
                  {tradeCta.previewStatus}
                </span>
              </div>
              <p className="mb-1 text-label-sm font-label-sm uppercase text-[#8499ad]">Account Holder</p>
              <p className="mb-3 text-[14px] leading-5 font-semibold text-text-inverse">{tradeCta.previewHolderName}</p>
              <div className="mb-10 flex items-start justify-between gap-4">
                <div>
                  <p className="text-label-sm font-label-sm uppercase text-[#8499ad]">Credit Limit</p>
                  <p className="text-body-md font-body-md font-bold text-orange-500">{tradeCta.previewCreditLimit}</p>
                </div>
                <div>
                  <p className="text-label-sm font-label-sm uppercase text-[#8499ad]">Terms</p>
                  <p className="text-body-md font-body-md font-bold text-text-inverse">{tradeCta.previewTerms}</p>
                </div>
              </div>
              <div className="mt-auto flex items-center justify-between text-label-sm font-label-sm uppercase text-[#8499ad]">
                <span>Card: {tradeCta.previewCardMask}</span>
                <span>Exp: {tradeCta.previewExpiry}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {visibleSections.has("CALCULATORS") && (
      <section className="mx-auto w-full max-w-[1600px] px-4 py-10 sm:px-margin-desktop">
        <p className="mb-1 text-label-md font-label-md font-semibold uppercase tracking-wide text-orange-600">{calculatorsContent.eyebrow}</p>
        <h2 className="mb-1 text-headline-lg-mobile font-headline-lg-mobile font-bold text-graphite-900 sm:text-headline-lg sm:font-headline-lg">
          {calculatorsContent.heading}
        </h2>
        <p className="mb-8 max-w-[560px] text-body-md font-body-md text-text-secondary">
          {calculatorsContent.description}
        </p>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <TileCalculator />
          <div className="grid grid-rows-3 gap-4">
            {calculators.map((calc) => (
              <Link
                key={calc.slug}
                href="/calculators"
                className="flex items-center justify-between gap-4 rounded-2xl bg-surface-white px-5 py-7 shadow-[0_1px_2px_rgb(0_0_0/0.05)] transition-colors hover:bg-orange-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-500 lg:min-h-32"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <span aria-hidden className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-container-low text-graphite-900">
                    <span className="material-symbols-outlined text-[20px]">{calc.icon}</span>
                  </span>
                  <div>
                    <p className="text-[18px] leading-6 font-bold text-graphite-900">{calc.label}</p>
                    <p className="text-[14px] leading-5 text-text-secondary">{calc.caption}</p>
                  </div>
                </div>
                <span aria-hidden className="material-symbols-outlined shrink-0 text-[20px] text-graphite-400">
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
