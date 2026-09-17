import Link from "next/link";
import { ArrowRight, Headphones, House, Shapes } from "lucide-react";
import { fetchDepartments, fetchFeaturedProducts } from "@/lib/api";
import { ProductCard } from "@/components/commerce/product-card";
import styles from "./not-found.module.css";

const tags = ["Cordless Drills", "Makita 18V LXT", "DeWalt Twin Packs", "Milwaukee M18", "Masonry Fixings", "Site Lighting"];
const descriptions: Record<string, string> = {
  "power-tools": "Cordless combi drills, SDS-plus, mitre saws, grinders & batteries.",
  "hardware-fixings": "Multi-purpose woodscrews, drywall anchors, structural bolts & nuts.",
  "electrical-lighting": "Consumer units, twin & earth cable, smart switches & site floodlights.",
  "hand-tools": "Spirit levels, ratchet sets, tape measures, hammers & chisel packs.",
};
const focus = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-600";

export async function NotFoundPage() {
  const [departments, products] = await Promise.all([
    fetchDepartments().catch(() => []),
    fetchFeaturedProducts(4).catch(() => []),
  ]);
  const popular = Object.keys(descriptions).flatMap((slug) => departments.filter((dept) => dept.slug === slug));
  const cards = popular.length ? popular : departments.slice(0, 4);

  return (
    <div className="w-full bg-surface-warm text-graphite-900">
      <section className={styles.hero} aria-labelledby="missing-page-title">
        <div className="mx-auto flex max-w-4xl flex-col items-center px-4 pb-14 pt-8 text-center sm:px-6 sm:pb-16">
          <div aria-hidden="true" className={styles.diagnostic}>
            <svg viewBox="0 0 180 80" className="h-16 w-36" fill="none">
              <path d="M24 66 90 14l66 52M43 51l47-37 47 37" stroke="#ff7900" strokeWidth="2" opacity=".55" />
              <circle cx="90" cy="14" r="5" fill="#aeb7bc" />
              <path d="m86 43 8 5-7 6 6 5-7 9" stroke="#ff7900" strokeWidth="2" strokeDasharray="3 3" />
            </svg>
            <span className={styles.sign}>DIAGNOSTIC:<br />DISCONNECT_FAULT</span>
          </div>
          <p className="mt-5 font-mono text-[11px] font-semibold tracking-wide text-orange-700">▱ ERROR CODE: 404 · RESOURCE UNLOCATED</p>
          <h1 id="missing-page-title" className="mt-4 max-w-2xl font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">Looks like this blueprint is missing a page.</h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-text-secondary sm:text-base">The tool, product specification, or catalog asset you are trying to view has been decommissioned, relocated, or temporarily pulled from the depot inventory.</p>
          <div className="mt-4 flex max-w-3xl flex-wrap items-center justify-center gap-2">
            <span className="text-[10px] font-medium tracking-wide text-text-secondary">JOBSITE TAGS:</span>
            {tags.map((tag) => <Link key={tag} href={`/search?q=${encodeURIComponent(tag)}`} className={`rounded bg-white px-2 py-1 text-[10px] font-medium hover:text-orange-700 ${focus}`}>{tag}</Link>)}
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3 text-xs font-semibold">
            <Link href="/" className={`flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-3 text-white hover:bg-orange-600 ${focus}`}><House aria-hidden="true" className="size-4" />Return to Storefront Homepage</Link>
            <Link href="/#departments" className={`flex items-center gap-2 rounded-lg bg-graphite-800 px-5 py-3 text-white hover:bg-graphite-700 ${focus}`}><Shapes aria-hidden="true" className="size-4" />Browse {departments.length || "All"} Departments</Link>
            <Link href="/help" className={`flex items-center gap-2 rounded-lg border border-border-default bg-white px-5 py-3 hover:bg-orange-50 ${focus}`}><Headphones aria-hidden="true" className="size-4 text-orange-600" />Visit Help Center</Link>
          </div>
        </div>
      </section>
      {cards.length > 0 && <section className="mx-auto max-w-[1280px] px-4 py-8 sm:px-8" aria-labelledby="recovery-departments">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div><p className="text-[10px] font-semibold uppercase tracking-wider text-orange-700">Catalog Directory</p><h2 id="recovery-departments" className="mt-1 text-xl font-bold">Popular Hardware Departments</h2></div>
          <p className="text-xs text-text-secondary">Fast links to re-route your workshop orders immediately</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((dept) => <Link key={dept.slug} href={`/c/${dept.slug}`} className={`rounded-xl border border-border-default/60 bg-white p-5 transition-colors hover:border-orange-300 ${focus}`}>
            <div className="mb-4 flex items-center justify-between"><span aria-hidden="true" className="material-symbols-outlined rounded-lg bg-orange-50 p-2 text-orange-600">{dept.icon}</span><span className="font-mono text-[10px] text-text-secondary">{dept.productCount.toLocaleString()} SKUs</span></div>
            <h3 className="text-base font-semibold">{dept.name}</h3><p className="mt-2 text-xs leading-5 text-text-secondary">{descriptions[dept.slug] ?? `Explore ${dept.name.toLowerCase()} for your next project.`}</p>
            <span className="mt-4 flex items-center gap-1 text-xs font-semibold text-orange-700">Explore Range <ArrowRight aria-hidden="true" className="size-3" /></span>
          </Link>)}
        </div>
      </section>}
      {products.length > 0 && <section className="mx-auto max-w-[1280px] px-4 pb-10 pt-3 sm:px-8" aria-labelledby="recovery-products">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><p className="text-[10px] font-semibold uppercase tracking-wider text-orange-700">Contractor Favorites</p><h2 id="recovery-products" className="mt-1 text-xl font-bold">Popular Trade &amp; Pro Tools</h2></div><Link href="/c/power-tools" className={`flex items-center gap-1 text-xs font-semibold text-orange-700 ${focus}`}>View All Power Tools <ArrowRight aria-hidden="true" className="size-3" /></Link></div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div>
      </section>}
    </div>
  );
}
