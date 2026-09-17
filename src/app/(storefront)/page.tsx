import Link from "next/link";
import { DotPattern } from "@/components/ui/dot-pattern";
import type { Metadata } from "next";
import { ProductCard } from "@/components/commerce/product-card";
import { ProductImage } from "@/components/commerce/product-image";
import { TileCalculator } from "@/components/home/tile-calculator";
import { BatteryMatcher } from "@/components/home/battery-matcher";
import { HomeHero } from "@/components/home/hero/home-hero";
import { fetchDepartments, fetchFeaturedProducts, fetchVisibleHomepageSections } from "@/lib/api";

export const metadata: Metadata = {
  title: "Buildivo — Pro-Grade Tools, Hardware & DIY Supplies",
};

const trustBadges = [
  { icon: "local_shipping", title: "Next-Day Jobsite Dispatch", caption: "Orders before 8 PM ship tonight" },
  { icon: "cached", title: "30-Day Free Returns", caption: "Zero hassle on unopened stock" },
  { icon: "price_check", title: "Price Match Promise", caption: "We beat authorized trade quotes" },
  { icon: "verified_user", title: "3-Year Manufacturer Warranty", caption: "Registered straight at checkout" },
];



const projects = [
  {
    slug: "decking-outdoor-framing",
    image: "/images/projects/decking.jpg",
    name: "Decking & Outdoor Framing",
    description: "C24 treated joists, deck boards, weed membrane, joist tape & coach screws.",
    itemCount: 24,
    specLabel: "Estimated Area",
    specValue: "25 - 35 m²",
    est: "£1,420.00",
    categorySlug: "garden-outdoor",
  },
  {
    slug: "complete-bathroom-refit",
    image: "/images/projects/bathroom.jpg",
    name: "Complete Bathroom Refit",
    description: "Tanking kit, 15mm/22mm copper, JG Speedfit manifolds, tile backer boards.",
    itemCount: 48,
    specLabel: "Typical Room Size",
    specValue: "Standard 3-piece",
    est: "£2,180.00",
    categorySlug: "plumbing-heating",
  },
  {
    slug: "jobsite-rough-in",
    image: "/images/projects/electrical.jpg",
    name: "Jobsite Electrical Rough-In",
    description: "100m drums 2.5mm² T&E, 1.5mm² lighting, dry lining boxes, RCBOs.",
    itemCount: 32,
    specLabel: "Scope",
    specValue: "4-Zone Extension",
    est: "£895.00",
    categorySlug: "electrical-lighting",
  },
  {
    slug: "workshop-storage-build",
    image: "/images/projects/workshop.jpg",
    name: "Workshop Storage Build",
    description: "Birch plywood sheets, heavy duty steel angle brackets, heavy-duty castors.",
    itemCount: 18,
    specLabel: "Bench Spec",
    specValue: "2.4m Heavy Workbench",
    est: "£640.00",
    categorySlug: "storage",
  },
];

const calculators = [
  {
    slug: "concrete-mortar",
    icon: "architecture",
    label: "Concrete & Mortar Volume",
    caption: (
      <>
        Calculates <span className="text-text-secondary">cubic meters, ballast &amp; cement bags</span> for footings and slabs.
      </>
    ),
  },
  {
    slug: "paint-coverage",
    icon: "format_paint",
    label: "Paint Coverage & Primer",
    caption: (
      <>
        Coat multipliers for <span className="text-text-secondary">masonry, emulsion, gloss, and exterior cladding</span>.
      </>
    ),
  },
  {
    slug: "flooring-underlay",
    icon: "view_agenda",
    label: "Flooring & Underlay Packs",
    caption: (
      <>
        Pack box rounding with <span className="text-text-secondary">expansion gap perimeter formulas</span>.
      </>
    ),
  },

];

export default async function HomePage() {
  const [departments, featured, visibleSections] = await Promise.all([fetchDepartments(), fetchFeaturedProducts(4), fetchVisibleHomepageSections()]);
  return (
    <div className="flex flex-col">
      {visibleSections.has("HERO") && <HomeHero />}

      {visibleSections.has("TRUST_STRIP") && (
      <section className="bg-surface-warm">
        <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-4 sm:grid-cols-2 px-4 py-6 sm:px-margin-desktop lg:grid-cols-4">
          {trustBadges.map((badge) => (
            <div key={badge.title} className="flex min-h-16 items-center gap-2 rounded-lg bg-white p-3 shadow-[0_1px_2px_rgb(0_0_0/0.05)]">
              <span aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                <span className="material-symbols-outlined text-[22px]">{badge.icon}</span>
              </span>
              <div>
                <p className="text-[12px] leading-4 font-semibold text-graphite-900">{badge.title}</p>
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
            <p className="mb-1 text-label-md font-label-md font-semibold uppercase tracking-wide text-orange-600">Turnkey Project Packs</p>
            <h2 className="mb-1 text-headline-lg-mobile font-headline-lg-mobile font-bold text-graphite-900 sm:text-headline-lg sm:font-headline-lg">
              Shop by Complete Job
            </h2>
            <p className="max-w-2xl text-body-md font-body-md text-text-secondary">
              Standardized bills of materials curated with vetted tradespeople. Eliminate missed fixings, incorrect gauge wiring, and return trips.
            </p>
          </div>
          <p className="text-label-sm font-label-sm text-text-secondary">All bundles include 5% bulk rebate</p>
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
                Official Trade Contractor Scheme
              </span>
              <h2 className="mb-4 text-[28px] leading-tight font-bold tracking-[-0.025em] text-text-inverse sm:text-[36px]">
                Unlock Net Pricing &amp; 30-Day Credit Lines
              </h2>
              <p className="mb-8 max-w-[650px] text-[18px] leading-7 text-[#91a3b5]">
                Power your jobs with instant approvals, volume tiered rates on daily consumables, and guaranteed delivery direct to active jobsites before 9:00 AM.
              </p>
              <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div className="min-h-[142px] rounded-[14px] bg-[#0e1a26] p-4">
                  <p className="text-[32px] leading-8 font-bold tracking-tight text-orange-500">Up to 15%</p>
                  <p className="text-[16px] leading-6 font-semibold text-text-inverse">Trade Discount</p>
                  <p className="mt-1 text-[11px] leading-6">Tiered rebates applied to invoicing</p>
                </div>
                <div className="min-h-[142px] rounded-[14px] bg-[#0e1a26] p-4">
                  <span aria-hidden className="material-symbols-outlined mb-2 block text-[28px] text-orange-500">
                    support_agent
                  </span>
                  <p className="text-[16px] leading-6 font-semibold text-text-inverse">Dedicated Manager</p>
                  <p className="mt-1 text-[11px] leading-6">Direct phone desk for instant tender quotes</p>
                </div>
                <div className="min-h-[142px] rounded-[14px] bg-[#0e1a26] p-4">
                  <span aria-hidden className="material-symbols-outlined mb-2 block text-[28px] text-orange-500">
                    location_on
                  </span>
                  <p className="text-[16px] leading-6 font-semibold text-text-inverse">Instant Jobsite Drops</p>
                  <p className="mt-1 text-[11px] leading-6">What3words geofenced drop-offs</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/trade"
                  className="inline-flex items-center min-h-[52px] justify-center gap-2 rounded-xl bg-orange-500 px-8 py-3 font-label-lg text-label-lg font-bold text-text-inverse transition-colors hover:bg-orange-600 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-500"
                >
                  Apply for Trade Account
                  <span aria-hidden className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
                <p className="flex items-center gap-1.5 text-label-sm font-label-sm">
                  <span aria-hidden className="material-symbols-outlined text-[16px] text-orange-500">bolt</span>
                  Instant 2-minute soft-check application (Companies House verified)
                </p>
              </div>
            </div>
            <div className="flex min-h-[242px] flex-col rounded-2xl bg-[#0b1721] p-6">
              <div className="mb-6 flex items-center justify-between gap-3">
                <span className="flex items-center gap-2">
                  <span aria-hidden className="material-symbols-outlined text-[26px] text-orange-500">
                    deployed_code
                  </span>
                  <span className="text-[20px] leading-7 font-bold text-text-inverse">BUILDIVO PRO</span>
                </span>
                <span className="rounded-sm bg-success-500/20 px-2.5 py-0.5 text-label-sm font-label-sm font-semibold uppercase tracking-wide text-success-500">
                  Active
                </span>
              </div>
              <p className="mb-1 text-label-sm font-label-sm uppercase text-[#8499ad]">Account Holder</p>
              <p className="mb-3 text-[14px] leading-5 font-semibold text-text-inverse">Apex Mechanical &amp; Electrical Ltd</p>
              <div className="mb-10 flex items-start justify-between gap-4">
                <div>
                  <p className="text-label-sm font-label-sm uppercase text-[#8499ad]">Credit Limit</p>
                  <p className="text-body-md font-body-md font-bold text-orange-500">£25,000.00</p>
                </div>
                <div>
                  <p className="text-label-sm font-label-sm uppercase text-[#8499ad]">Terms</p>
                  <p className="text-body-md font-body-md font-bold text-text-inverse">Net 30 Days</p>
                </div>
              </div>
              <div className="mt-auto flex items-center justify-between text-label-sm font-label-sm uppercase text-[#8499ad]">
                <span>Card: •••• 9842</span>
                <span>Exp: 12/28</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {visibleSections.has("CALCULATORS") && (
      <section className="mx-auto w-full max-w-[1600px] px-4 py-10 sm:px-margin-desktop">
        <p className="mb-1 text-label-md font-label-md font-semibold uppercase tracking-wide text-orange-600">Jobsite Estimation Suite</p>
        <h2 className="mb-1 text-headline-lg-mobile font-headline-lg-mobile font-bold text-graphite-900 sm:text-headline-lg sm:font-headline-lg">
          Interactive Material Calculators
        </h2>
        <p className="mb-8 max-w-[560px] text-body-md font-body-md text-text-secondary">
          Prevent site waste and calculate exact quantities for{" "}
          <span className="text-text-secondary">tile, paint coverage, concrete pours, and laminate flooring</span> with automatic 10% wastage
          allowance.
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
        <BatteryMatcher />
      </section>
      )}
    </div>
  );
}
