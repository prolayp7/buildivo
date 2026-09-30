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
import { fetchCalculatorsContent, fetchDepartments, fetchEcosystemMatcherContent, fetchFeaturedProducts, fetchFloatingBadge, fetchHeroSlides, fetchHomepageSections, fetchProjectKitsContent, fetchToolPlatforms, fetchTradeCtaContent, fetchTrustBadges, sectionHeader, type ApiHomepageSection } from "@/lib/api";

export const metadata: Metadata = {
  title: "Buildivo — Pro-Grade Tools, Hardware & DIY Supplies",
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [sections, heroSlides, trustBadges, floatingBadge, calculatorsContent, ecosystemMatcherContent, projectKitsContent, toolPlatforms, departments, featuredProducts, tradeCtaContent] = await Promise.all([
    fetchHomepageSections(),
    fetchHeroSlides(),
    fetchTrustBadges(),
    fetchFloatingBadge(),
    fetchCalculatorsContent(),
    fetchEcosystemMatcherContent(),
    fetchProjectKitsContent(),
    fetchToolPlatforms(),
    fetchDepartments().catch(() => []),
    fetchFeaturedProducts(4).catch(() => []),
    fetchTradeCtaContent(),
  ]);
  const calculators = [
    { slug: "concrete-mortar", icon: calculatorsContent.calc1Icon, label: calculatorsContent.calc1Label, caption: calculatorsContent.calc1Caption },
    { slug: "paint-coverage", icon: calculatorsContent.calc2Icon, label: calculatorsContent.calc2Label, caption: calculatorsContent.calc2Caption },
    { slug: "flooring-underlay", icon: calculatorsContent.calc3Icon, label: calculatorsContent.calc3Label, caption: calculatorsContent.calc3Caption },
  ];
  const projects = projectKitsContent.kits.filter((kit) => kit.active).map((kit) => ({ ...kit, slug: kit.id, categorySlug: "building-materials" }));

  // Sections render in the order (and with the visibility) set on buildivo-admin's Homepage page.
  function renderSection(section: ApiHomepageSection) {
    switch (section.type) {
      case "HERO": return heroSlides.length > 0 ? <HomeHero key="hero" slides={heroSlides} floatingBadge={floatingBadge} /> : null;
      case "TRUST_STRIP": return trustBadges.length > 0 ? <TrustStrip key="trust" badges={trustBadges} /> : null;
      case "DEPARTMENTS": return <ShopByDepartment key="departments" header={sectionHeader(section.config, { heading: "Shop by Department", linkLabel: "View all products", linkHref: "/c/power-tools" })} departments={departments} />;
      case "FEATURED_PRODUCTS": return <FeaturedProducts key="featured" header={sectionHeader(section.config, { heading: "Featured Pro Tools", linkLabel: "Shop all Power Tools", linkHref: "/c/power-tools" })} products={featuredProducts} />;
      case "PROJECT_KITS": return <ProjectKits key="kits" content={projectKitsContent} kits={projects} />;
      case "TRADE_CTA": return <TradeCTA key="trade" content={tradeCtaContent} />;
      case "CALCULATORS": return <CalculatorsSection key="calculators" content={calculatorsContent} calculators={calculators} />;
      case "ECOSYSTEM_MATCHER": return <EcosystemMatcherSection key="ecosystem" content={ecosystemMatcherContent} platforms={toolPlatforms} />;
      default: return null;
    }
  }

  return (
    <div className="flex flex-col">
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Organization", name: SITE_NAME, url: absoluteUrl("/") }} />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "WebSite", name: SITE_NAME, url: absoluteUrl("/"), potentialAction: { "@type": "SearchAction", target: absoluteUrl("/search?q={search_term_string}"), "query-input": "required name=search_term_string" } }} />
      {sections.map(renderSection)}
    </div>
  );
}
