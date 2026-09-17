"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, BadgeCheck, BookOpen, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/types";
import { ProductImage } from "@/components/commerce/product-image";
import { useCartStore } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";
import styles from "./dewalt-spotlight.module.css";

export function DewaltSpotlight({ products, total }: { products: Product[]; total: number }) {
  function downloadCatalog() {
    const rows = [["Product", "SKU", "Price inc VAT", "Price ex VAT", "Specifications"], ...products.map((p) => [p.name, p.sku, formatPrice(p.priceIncVat), formatPrice(p.priceIncVat / (1 + p.vatRate)), p.specs.map((s) => `${s.label}: ${s.value}`).join("; ")])];
    const csv = rows.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url; link.download = "buildivo-dewalt-spotlight-specifications.csv"; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return <section className={styles.spotlight} aria-labelledby="dewalt-heading">
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.intro}>
          <div className={styles.eyebrow}><span>OFFICIAL STOREFRONT SPOTLIGHT</span><small><BadgeCheck size={14} />Direct Manufacturer Authorized Stockist</small></div>
          <h2 id="dewalt-heading">DeWalt Industrial XR &amp; FlexVolt Centre</h2>
          <p>Buildivo operates as a premier UK stocking partner for DeWalt industrial corded and cordless heavy equipment. Benefit from guaranteed same-day regional hub dispatch, automated online tool warranty serial registration, and dedicated trade fleet discounting.</p>
        </div>
        <div className={styles.actions}>
          <Link href="/brands/dewalt">Browse All {total > 0 ? total.toLocaleString() : ""} DeWalt Tools<ArrowRight size={18} /></Link>
          <button onClick={downloadCatalog} disabled={!products.length}><BookOpen size={18} />Download Spec Catalog</button>
        </div>
      </header>
      <div className={styles.sectionLabel}><h3>ESSENTIAL JOBSITE BEST-SELLERS — IN STOCK FOR IMMEDIATE DISPATCH</h3><span>ALL PRICES INC. VAT (EX. VAT DISPLAYED)</span></div>
      {products.length ? <div className={styles.products}>{products.map((product) => <SpotlightProduct key={product.id} product={product} />)}</div> : <p className={styles.empty}>DeWalt products are currently unavailable. Please check back shortly.</p>}
    </div>
  </section>;
}

function SpotlightProduct({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);
  const [busy, setBusy] = useState(false);
  const savings = product.compareAtIncVat && product.compareAtIncVat > product.priceIncVat ? product.compareAtIncVat - product.priceIncVat : 0;
  const unavailable = product.stock === "out-of-stock" || !product.defaultVariantId;
  async function addToCart() {
    if (!product.defaultVariantId || busy) return;
    setBusy(true);
    try { await addItem(product.defaultVariantId, 1); toast.success(`Added ${product.name} to cart`); }
    catch { toast.error("Could not add this product. Please try again."); }
    finally { setBusy(false); }
  }
  return <article className={styles.product}>
    <div className={styles.stockRow}><span>SKU: {product.sku}</span><strong>{product.stock === "out-of-stock" ? "OUT OF STOCK" : `IN STOCK${product.stockCount !== undefined ? `: ${product.stockCount}` : ""}`}</strong></div>
    <Link href={`/p/${product.slug}`} className={styles.imageLink} aria-label={product.name}><ProductImage src={product.image} categorySlug={product.categorySlug} className={styles.image} />{product.badges?.[0] && <span className={styles.badge}>{product.badges[0]}</span>}</Link>
    <h4><Link href={`/p/${product.slug}`} title={product.name}>{product.name}</Link></h4>
    <div className={styles.specs}>{product.specs.slice(0, 2).map((spec) => <span key={spec.label}>{spec.value} {spec.label}</span>)}</div>
    <div className={styles.priceBlock}><div><strong>{formatPrice(product.priceIncVat)}</strong>{savings > 0 && <s>{formatPrice(product.compareAtIncVat!)}</s>}</div><div><span>{formatPrice(product.priceIncVat / (1 + product.vatRate))} ex. VAT</span>{savings > 0 && <em>Save {Math.round(savings / product.compareAtIncVat! * 100)}%</em>}</div></div>
    <button className={styles.addButton} disabled={unavailable || busy} onClick={addToCart}><ShoppingCart size={17} />{busy ? "Adding…" : unavailable ? "Unavailable" : "Add to Job Cart"}</button>
  </article>;
}
