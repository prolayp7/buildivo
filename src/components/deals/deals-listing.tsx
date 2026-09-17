"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Eye, Grid2X2, List, ShoppingCart, Star, X } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/types";
import { ProductImage } from "@/components/commerce/product-image";
import { useCartStore } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";
import styles from "./deals-listing.module.css";

const discount = (p: Product) => p.compareAtIncVat && p.compareAtIncVat > p.priceIncVat ? Math.round((1 - p.priceIncVat / p.compareAtIncVat) * 100) : 0;
const tabs = [
  { label: "All Deals", matches: () => true },
  { label: "Flash Clearance", matches: (p: Product) => (p.badges ?? []).some((b) => /flash|clearance/i.test(b)) },
  { label: "Tool Combo Bundles", matches: (p: Product) => /kit|combo|bundle/i.test(p.name) },
  { label: "Pallet & Site Bulk Packs", matches: (p: Product) => /pallet|bulk|pack/i.test(p.name) || Boolean(p.quantityTiers?.length) },
  { label: "Trade Exclusives (Net 30)", matches: (p: Product) => p.tradePriceIncVat !== undefined },
  { label: "Factory Refurbished", matches: (p: Product) => /refurbished|reconditioned/i.test(`${p.name} ${p.badges?.join(" ") ?? ""}`) },
];
const filters = ["Discounts 40%+", "Under £50", "18V Cordless", "DeWalt", "Milwaukee", "Makita"];

export function DealsListing({ products }: { products: Product[] }) {
  const [tab, setTab] = useState(0);
  const [active, setActive] = useState<string[]>([]);
  const [inStock, setInStock] = useState(true);
  const [sort, setSort] = useState("discount");
  const [view, setView] = useState("grid");
  const [limit, setLimit] = useState(24);
  const filtered = useMemo(() => products.filter((p) => {
    if (!tabs[tab].matches(p) || (inStock && p.stock === "out-of-stock")) return false;
    if (active.includes("Discounts 40%+") && discount(p) < 40) return false;
    if (active.includes("Under £50") && p.priceIncVat >= 50) return false;
    if (active.includes("18V Cordless") && !/18\s?v/i.test(`${p.name} ${p.specs.map((s) => s.value).join(" ")}`)) return false;
    const brands = active.filter((f) => ["DeWalt", "Milwaukee", "Makita"].includes(f));
    return !brands.length || brands.some((brand) => p.brand.toLowerCase() === brand.toLowerCase());
  }).sort((a, b) => sort === "price_asc" ? a.priceIncVat - b.priceIncVat : sort === "price_desc" ? b.priceIncVat - a.priceIncVat : sort === "rating" ? b.rating - a.rating : discount(b) - discount(a)), [products, tab, active, inStock, sort]);
  function toggleFilter(filter: string) { setActive((values) => values.includes(filter) ? values.filter((value) => value !== filter) : [...values, filter]); setLimit(24); }
  return <section id="clearance-deals" className={styles.section} aria-label="Clearance deals">
    <div className={styles.tabs} aria-label="Deal categories">{tabs.map((item, index) => <button key={item.label} aria-pressed={tab === index} onClick={() => { setTab(index); setLimit(24); }}>{item.label}<span>{products.filter(item.matches).length}</span></button>)}</div>
    <div className={styles.toolbar}><div className={styles.filters}><span>FILTER BY:</span>{filters.map((filter) => <button key={filter} onClick={() => toggleFilter(filter)} aria-pressed={active.includes(filter)}>{filter}{active.includes(filter) && <X size={12} />}</button>)}<label><input type="checkbox" checked={inStock} onChange={(event) => { setInStock(event.target.checked); setLimit(24); }} />In Stock Only</label></div><div className={styles.controls}><label>Sort by:<select value={sort} onChange={(event) => setSort(event.target.value)}><option value="discount">Biggest Discount %</option><option value="price_asc">Price: Low to High</option><option value="price_desc">Price: High to Low</option><option value="rating">Customer Rating</option></select></label><div className={styles.views}><button aria-label="Grid view" aria-pressed={view === "grid"} onClick={() => setView("grid")}><Grid2X2 size={17} /></button><button aria-label="List view" aria-pressed={view === "list"} onClick={() => setView("list")}><List size={17} /></button></div></div></div>
    <p className="sr-only" role="status">{filtered.length} deals found</p>
    {filtered.length ? <div className={`${styles.grid} ${view === "list" ? styles.list : ""}`}>{filtered.slice(0, limit).map((product) => <DealCard key={product.id} product={product} />)}</div> : <div className={styles.empty}><h2>No deals match these filters</h2><p>Try another category or clear your filters.</p><button onClick={() => { setTab(0); setActive([]); setInStock(false); }}>Show all deals</button></div>}
    {filtered.length > limit && <button className={styles.loadMore} onClick={() => setLimit((value) => value + 24)}>Show more deals ({filtered.length - limit} remaining)</button>}
  </section>;
}

function DealCard({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);
  const [busy, setBusy] = useState(false);
  const saving = Math.max(0, (product.compareAtIncVat ?? product.priceIncVat) - product.priceIncVat);
  const unavailable = product.stock === "out-of-stock" || !product.defaultVariantId;
  async function add() {
    if (!product.defaultVariantId || busy) return;
    setBusy(true);
    try { await addItem(product.defaultVariantId, 1); toast.success(`Added ${product.name} to cart`); }
    catch { toast.error("Could not add this product. Please try again."); }
    finally { setBusy(false); }
  }
  return <article className={styles.card}>
    <div className={styles.cardTop}><div><strong>-{discount(product)}% OFF</strong><span>{product.badges?.[0] ?? "Clearance Line"}</span></div><span className={product.stock === "out-of-stock" ? styles.outOfStock : styles.inStock}>{product.stock === "out-of-stock" ? "Out of Stock" : "In Stock"}</span></div>
    <Link href={`/p/${product.slug}`} className={styles.imageLink} aria-label={product.name}><ProductImage src={product.image} categorySlug={product.categorySlug} className={styles.image} /><span>{product.sku}</span></Link>
    <div className={styles.body}><p className={styles.brand}>{product.brand}</p><h3><Link href={`/p/${product.slug}`} title={product.name}>{product.name}</Link></h3><div className={styles.specs}>{product.specs.slice(0, 3).map((spec) => <span key={spec.label}>{spec.value} {spec.label}</span>)}</div>
    <p className={styles.rating}><Star size={14} fill="currentColor" /><strong>{product.rating.toFixed(1)}</strong><span>({product.reviewCount})</span></p><p className={styles.stock}>{product.stockCount !== undefined ? `Stock Left: ${product.stockCount} units` : product.deliveryEta}</p>
    <div className={styles.pricing}><div><strong>{formatPrice(product.priceIncVat)}</strong>{saving > 0 && <s>{formatPrice(product.compareAtIncVat!)}</s>}</div><p>{formatPrice(product.priceIncVat / (1 + product.vatRate))} ex. VAT{saving > 0 && <span> · Save {formatPrice(saving)}</span>}</p></div><div className={styles.actions}><button onClick={add} disabled={unavailable || busy}><ShoppingCart size={17} />{busy ? "Adding…" : unavailable ? "Unavailable" : "Add"}</button><Link href={`/p/${product.slug}`} aria-label={`View ${product.name}`}><Eye size={17} /></Link></div></div>
  </article>;
}
