"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Flame, House, BadgeCheck, Truck, ArrowDown, Bookmark, ShoppingCart, Timer, CheckCheck } from "lucide-react";
import styles from "./deals-hero.module.css";
import { ProductImage } from "@/components/commerce/product-image";
import { Rating } from "@/components/commerce/rating";
import { useCartStore } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/types";

function msUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime() - now.getTime();
}

function formatCountdown(ms: number): { hours: string; minutes: string; seconds: string } {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    hours: pad(Math.floor(totalSeconds / 3600)),
    minutes: pad(Math.floor((totalSeconds % 3600) / 60)),
    seconds: pad(totalSeconds % 60),
  };
}

// Resets nightly rather than pointing at a fixed campaign end date - there's
// no "flash sale end time" concept in the catalog, so this counts down to
// midnight instead of a fabricated countdown target.
function useCountdownToMidnight(): string | null {
  const [remainingMs, setRemainingMs] = useState<number | null>(null);
  useEffect(() => {
    const timer = window.setTimeout(() => setRemainingMs(msUntilMidnight()), 0);
    const id = window.setInterval(() => setRemainingMs(msUntilMidnight()), 1000);
    return () => { window.clearTimeout(timer); window.clearInterval(id); };
  }, []);
  if (remainingMs === null) return null;
  const { hours, minutes, seconds } = formatCountdown(remainingMs);
  return `${hours}:${minutes}:${seconds}`;
}

export function DealsHero({ spotlight, dealsCount, maxDiscountPct }: { spotlight: Product | null; dealsCount: number; maxDiscountPct: number }) {
  const countdown = useCountdownToMidnight();
  const addItem = useCartStore((s) => s.addItem);

  const wishlist = useCartStore((s) => s.wishlist);
  const toggleWishlist = useCartStore((s) => s.toggleWishlist);
  const [busy, setBusy] = useState(false);
  async function claimDeal() {
    if (!spotlight?.defaultVariantId || busy) return;
    setBusy(true);
    try { await addItem(spotlight.defaultVariantId, 1); toast.success(`Added ${spotlight.name} to cart`); }
    catch { toast.error("Unable to add this deal. Please try again."); }
    finally { setBusy(false); }
  }
  return <section className={styles.section}>
    <div className={styles.crumbs}><div className={styles.container}><nav aria-label="Breadcrumb"><Link href="/"><House size={12} />Home</Link><span>/</span><span>Trade Specials</span><span>/</span><strong><Flame size={12} />Deals &amp; Pro Clearance Hub</strong></nav><span><BadgeCheck size={13} />OEM Certified Overstock</span></div></div>
    <div className={styles.hero}><div className={`${styles.container} ${styles.heroGrid}`}>
      <div className={styles.copy}><span className={styles.event}><Timer size={13} />LIMITED TRADE ALLOCATION EVENT</span>
        <h1>Flash Deals &amp; Pro Clearance Event — <em>Save up to {maxDiscountPct}% Off</em> Industrial Overstock</h1>
        <p>Direct trade contractor access to tier-1 factory overstocks, discontinued platform lines, and bulk site consumables. 100% factory inspected and backed by full OEM warranties.</p>
        <div className={styles.countdown}><Flame size={21} /><span>TODAY’S DEALS REFRESH IN:</span><div>{(countdown ?? "--:--:--").split(":").map((part, index) => <span key={index}>{part}</span>)}</div><small>LOCAL</small><span className={styles.cutoff}>Next-day pallet batch cut-off: 17:00</span></div>
        <div className={styles.benefits}><span><BadgeCheck />{dealsCount} Verified Trade SKUs</span><span><CheckCheck />Direct OEM Price Match</span><span><Truck />Pre-10am Jobsite Delivery</span></div>
      </div>
      <aside className={styles.metric}><span className={styles.metricBadge}>CLEARANCE</span><h2>LIVE CLEARANCE CATALOG <i /></h2><div><span>Reduced Product Lines:</span><strong>{dealsCount.toLocaleString()}</strong></div><div className={styles.meter}><span style={{width: `${Math.min(100, maxDiscountPct)}%`}} /></div><p><span>Maximum saving: {maxDiscountPct}%</span><span>While stocks last</span></p><footer><span><CheckCheck size={12} />Live catalog pricing</span><a href="#clearance-deals">Browse all <ArrowDown size={12} /></a></footer></aside>
    </div></div>
    {spotlight && <div className={`${styles.container} ${styles.spotlightWrap}`}><article className={styles.spotlight}>
      <header><div><strong><BadgeCheck size={13} />DEAL OF THE DAY</strong><span>CLEARANCE LOT #{spotlight.sku}</span></div>{spotlight.stockCount !== undefined && <small>{spotlight.stockCount} Units Left at This Price</small>}</header>
      <div className={styles.productLayout}><div className={styles.media}><span className={styles.saving}>SAVE {formatPrice(Math.max(0,(spotlight.compareAtIncVat ?? spotlight.priceIncVat)-spotlight.priceIncVat))} ({maxDiscountPct}% OFF)</span><Link href={`/p/${spotlight.slug}`} aria-label={spotlight.name}><ProductImage src={spotlight.image} categorySlug={spotlight.categorySlug} className={styles.image} /></Link><p><BadgeCheck size={13} />{spotlight.stock === "out-of-stock" ? "Out of stock" : "In Regional Stock"}<span>SKU: <b>{spotlight.sku}</b></span></p></div>
        <div className={styles.productCopy}><div className={styles.review}><span>{spotlight.brand} TRADE SERIES</span><Rating value={spotlight.rating} count={spotlight.reviewCount} /></div><h2><Link href={`/p/${spotlight.slug}`}>{spotlight.name}</Link></h2>
        <p className={styles.description}>{spotlight.description.replace(/<[^>]*>/g, " ")}</p>
        <dl className={styles.specs}>{spotlight.specs.slice(0,4).map((spec) => <div key={spec.label}><dt>{spec.label}</dt><dd>{spec.value}</dd></div>)}</dl>
        <p className={styles.stock}>{spotlight.stockCount !== undefined ? `${spotlight.stockCount} available at clearance price` : spotlight.deliveryEta}</p>
        <div className={styles.price}><strong>{formatPrice(spotlight.priceIncVat)}</strong>{spotlight.compareAtIncVat && <s>RRP {formatPrice(spotlight.compareAtIncVat)}</s>}<span>SAVE {maxDiscountPct}%</span></div><p className={styles.delivery}>{formatPrice(spotlight.priceIncVat / (1 + spotlight.vatRate))} ex. VAT · {spotlight.deliveryEta}</p>
        <div className={styles.buy}><button onClick={claimDeal} disabled={busy || spotlight.stock === "out-of-stock" || !spotlight.defaultVariantId}><ShoppingCart size={18} />{busy ? "Adding…" : "Claim Deal & Add to Basket"}</button><button aria-label="Save deal" aria-pressed={wishlist.includes(spotlight.id)} onClick={() => toggleWishlist(spotlight.id)}><Bookmark size={18} fill={wishlist.includes(spotlight.id) ? "currentColor" : "none"} /></button></div>
        </div>
      </div>
    </article></div>}
  </section>;
}
