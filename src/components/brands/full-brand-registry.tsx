import Link from "next/link";
import type { ApiBrand } from "@/lib/adapters";
import styles from "./full-brand-registry.module.css";

export function FullBrandRegistry({ brands }: { brands: ApiBrand[] | null }) {
  const sorted = [...(brands ?? [])].sort((a, b) => a.title.localeCompare(b.title));
  const letters = [...new Set(sorted.map((brand) => brand.title[0].toUpperCase()))];
  return <section id="full-brand-index" className={styles.registry} aria-labelledby="registry-heading"><div className={styles.container}>
    <header className={styles.header}><div><span>COMPREHENSIVE BRAND REGISTRY</span><h2 id="registry-heading">Full A–Z Manufacturer Directory</h2><p>Every brand stocked carries authenticated batch codes, original factory warranty support, and authorized servicing access.</p></div><small>Showing {sorted.length} Official Brands</small></header>
    {brands === null && <p>The directory is temporarily unavailable. Please try again shortly.</p>}
    {letters.map((letter) => <div className={styles.row} key={letter} id={`registry-${letter}`}><h3>{letter}</h3><div className={styles.cards}>{sorted.filter((brand) => brand.title[0].toUpperCase() === letter).map((brand) => <Link key={brand.id} href={`/search?q=${encodeURIComponent(brand.title)}`}><div><h4>{brand.title}</h4>{brand.productCount !== undefined && <small>{brand.productCount.toLocaleString()} SKUs</small>}</div><p>{brand.description || `Explore ${brand.title} tools, equipment and trade supplies.`}</p><span>View Range</span></Link>)}</div></div>)}
  </div></section>;
}
