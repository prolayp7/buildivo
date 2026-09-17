"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, ShieldCheck, Cable, Search, House, Award, ArrowDownAZ, ArrowRight, ClipboardCheck } from "lucide-react";
import type { ApiBrand } from "@/lib/adapters";
import { formatPrice } from "@/lib/format";
import { BatteryMatcher } from "@/components/home/battery-matcher";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import styles from "./brand-directory.module.css";

// A handful of top brands get the bespoke accent colours already designed
// for this page (see brand-directory.module.css); everything else falls
// back to the module's neutral default so the page scales to the full
// catalogue without needing a theme hand-authored per brand.
const THEMED_SLUGS = new Set(["dewalt", "milwaukee", "makita", "bosch"]);

function stripHtml(html: string | null): string {
  return html ? html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() : "";
}

function initials(title: string): string {
  return title.split(/\s+/).map((word) => word[0]).slice(0, 2).join("").toUpperCase();
}

export function BrandDirectory({ brands }: { brands: ApiBrand[] }) {
  const [query, setQuery] = useState("");
  const [matcherOpen, setMatcherOpen] = useState(false);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return brands;
    return brands.filter((brand) => `${brand.title} ${stripHtml(brand.shortDescription)} ${stripHtml(brand.description)}`.toLowerCase().includes(q));
  }, [brands, query]);
  const letters = [...new Set(filtered.map((brand) => brand.title[0].toUpperCase()))].sort();

  return <div className={styles.page}>
    <div className={styles.breadcrumbBar}><div className={styles.container}>
      <nav aria-label="Breadcrumb"><Link href="/"><House size={13} />Home</Link><span>/</span><span>Official Directory</span><span>/</span><strong>Top Hardware &amp; Tool Manufacturers</strong></nav>
      <div className={styles.assurances}><span><BadgeCheck />100% Genuine UK Supply Chain</span><i>•</i><span><Award />Extended 3-Year Factory Cover</span></div>
    </div></div>
    <section className={`${styles.container} ${styles.hero}`} aria-labelledby="brands-heading">
      <div className={styles.intro}>
        <div className={styles.copy}>
          <span className={styles.partnerBadge}><ShieldCheck size={13} />BUILDIVO CERTIFIED PARTNER NETWORK</span>
          <h1 id="brands-heading">Top Brands &amp; Official Manufacturer Partners</h1>
          <p>Direct warehouse access to verified commercial brands. Zero parallel imports, fully warrantied OEM parts, factory calibration certificates, and trade-exclusive platform volume rebate schemes.</p>
        </div>
      </div>
    </section>
    <div className={styles.controls}><div className={styles.container}>
      <div className={styles.filterRow}>
        <label className={styles.search}><Search size={17} /><input type="search" aria-label="Search brands" placeholder={`Search ${brands.length}+ brands`} value={query} onChange={(event) => setQuery(event.target.value)} /></label>
        <div className={styles.actions}>
          <button onClick={() => setMatcherOpen(true)}><Cable size={15} />Battery Platform Matcher</button>
          <a href="#full-brand-index"><ArrowDownAZ size={15} />A-Z Master Index</a>
        </div>
      </div>
      <nav className={styles.alphabet} aria-label="Jump to brands by letter"><strong>A–Z JUMP:</strong>{letters.map((letter) => <a key={letter} href={`#brand-${letter}`}>{letter}<small>{filtered.filter((brand) => brand.title[0].toUpperCase() === letter).length}</small></a>)}</nav>
    </div></div>
    <section id="brand-index" className={styles.partnersSection} aria-labelledby="partners-heading">
      <div className={styles.container}>
        <header className={styles.partnersHeading}>
          <div><p>TIER-1 PARTNERSHIPS</p><h2 id="partners-heading">Primary Industrial Manufacturing Partners</h2></div>
          <span><ClipboardCheck size={15} />Dedicated Warehousing &amp; Bulk Pallet Stocking</span>
        </header>
        <p className="sr-only" role="status">{filtered.length} manufacturer partners found</p>
        {filtered.length === 0 && <div className={styles.empty}><h3>No matching brands</h3><p>Try a different search.</p><button onClick={() => setQuery("")}>Clear search</button></div>}
        <div className={styles.partnerGrid}>{filtered.map((brand, index) => {
          const theme = THEMED_SLUGS.has(brand.slug) ? styles[brand.slug] : undefined;
          const description = stripHtml(brand.shortDescription) || stripHtml(brand.description);
          return <article key={brand.id} id={filtered.findIndex((entry) => entry.title[0].toUpperCase() === brand.title[0].toUpperCase()) === index ? `brand-${brand.title[0].toUpperCase()}` : undefined} className={`${styles.partnerCard} ${theme ?? ""}`}>
            <div className={styles.partnerIdentity}>
              {brand.logo ? (
                <span className={styles.brandMark} aria-hidden="true"><Image src={brand.logo} alt="" width={36} height={36} unoptimized className="h-full w-full object-contain" /></span>
              ) : (
                <span className={styles.brandMark} aria-hidden="true">{initials(brand.title)}</span>
              )}
              <div><h3>{brand.title}</h3></div>
              <span className={styles.skuCount}><i />{(brand.productCount ?? 0).toLocaleString()} SKUs</span>
            </div>
            {description ? <p className={styles.partnerDescription}>{description}</p> : null}
            <dl className={styles.partnerDetails}>
              {brand.priceFrom !== null && brand.priceFrom !== undefined ? <div><dt>From:</dt><dd>{formatPrice(brand.priceFrom)}</dd></div> : null}
              <div><dt>In stock:</dt><dd>{(brand.productCount ?? 0).toLocaleString()} products</dd></div>
            </dl>
            <div className={styles.partnerFooter}><Link href={`/brands/${brand.slug}`}>View {brand.title}<ArrowRight size={13} /></Link><span>DIRECT TIER-1</span></div>
          </article>;
        })}</div>
      </div>
    </section>
    <Dialog open={matcherOpen} onOpenChange={setMatcherOpen}><DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-4xl"><DialogHeader><DialogTitle>Battery Platform Matcher</DialogTitle></DialogHeader><BatteryMatcher /></DialogContent></Dialog>
  </div>;
}
