import { TrustStrip } from "@/components/home/trust-strip";
import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { SITE_NAME, absoluteUrl } from "@/lib/site";
import { HomeHero } from "@/components/home/hero/home-hero";
import ShopByDepartment  from "@/components/commerce/shop-by-department";
import FeaturedProducts  from "@/components/commerce/featured-products";
import ProjectKits  from "@/components/commerce/project-kits";
import TradeCTA  from "@/components/commerce/trade-cta";
import { CalculatorsSection } from "@/components/home/calculators-section";
import { EcosystemMatcherSection } from "@/components/home/ecosystem-matcher-section";
import { fetchCalculatorsContent, fetchEcosystemMatcherContent, fetchFloatingBadge, fetchHeroSlides, fetchProjectKitsContent, fetchToolPlatforms, fetchTrustBadges, fetchVisibleHomepageSections } from "@/lib/api";

export const metadata: Metadata = {
  title: "Buildivo — Pro-Grade Tools, Hardware & DIY Supplies",
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [visibleSections, heroSlides, trustBadges, floatingBadge, calculatorsContent, ecosystemMatcherContent, projectKitsContent, toolPlatforms] = await Promise.all([
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
  const projects = projectKitsContent.kits.filter((kit) => kit.active).map((kit) => ({ ...kit, slug: kit.id, categorySlug: "building-materials" }));
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
      <ProjectKits content={projectKitsContent} kits={projects} />
      )}

      {visibleSections.has("TRADE_CTA") && (
      <TradeCTA />
      )}

      {visibleSections.has("CALCULATORS") && (
      <CalculatorsSection content={calculatorsContent} calculators={calculators} />
      )}

      {visibleSections.has("ECOSYSTEM_MATCHER") && (
      <EcosystemMatcherSection content={ecosystemMatcherContent} platforms={toolPlatforms} />
      )}
    </div>
  );
}
