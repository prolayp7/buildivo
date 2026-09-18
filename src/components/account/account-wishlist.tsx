"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ClipboardList, Download, Heart, Headset, Minus, Package, Plus, Search, ShieldCheck, ShoppingCart, Trash2, Truck, Upload, Wrench, Zap } from "lucide-react";
import { ProductImage } from "@/components/commerce/product-image";
import { useCartStore } from "@/lib/cart-store";
import { fetchProductsByIds } from "@/lib/storefront-client";
import type { Product } from "@/types";
import styles from "./account-wishlist.module.css";

const money = (value: number) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(value);
const stockLimit = (product: Product) => product.variants?.find((variant) => variant.id === product.defaultVariantId)?.stockQty ?? product.stockCount;
const canAdd = (product: Product) => Boolean(product.defaultVariantId) && product.stock !== "out-of-stock" && (stockLimit(product) ?? 1) > 0;

export function AccountWishlist() {
  const wishlist = useCartStore((state) => state.wishlist);
  const toggleWishlist = useCartStore((state) => state.toggleWishlist);
  const addItem = useCartStore((state) => state.addItem);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [query, setQuery] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState("saved");
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [excluded, setExcluded] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      setLoading(true);
      setError("");
      fetchProductsByIds(wishlist).then((items) => {
        if (!cancelled) setProducts(items.map((product) => {
          const variant = product.variants?.find((item) => item.id === product.defaultVariantId);
          return { ...product, priceIncVat: variant?.priceIncVat ?? product.priceIncVat, compareAtIncVat: variant?.compareAtIncVat ?? product.compareAtIncVat };
        }));
      }).catch(() => { if (!cancelled) setError("Could not load your saved products. Please try again."); })
        .finally(() => { if (!cancelled) setLoading(false); });
    }, 0);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [wishlist, attempt]);

  const saved = products.filter((product) => wishlist.includes(product.id));
  const quantity = (product: Product) => Math.min(quantities[product.id] ?? 1, Math.max(1, stockLimit(product) ?? 999));
  const visible = saved.filter((product) => (!inStockOnly || canAdd(product)) && `${product.name} ${product.brand} ${product.sku}`.toLowerCase().includes(query.trim().toLowerCase())).sort((a, b) => sort === "price-low" ? a.priceIncVat - b.priceIncVat : sort === "price-high" ? b.priceIncVat - a.priceIncVat : sort === "stock" ? Number(canAdd(b)) - Number(canAdd(a)) : 0);
  const selected = visible.filter((product) => !excluded.includes(product.id));
  const purchasable = selected.filter(canAdd);
  const total = purchasable.reduce((sum, product) => sum + product.priceIncVat * quantity(product), 0);
  const availableValue = saved.filter(canAdd).reduce((sum, product) => sum + product.priceIncVat * quantity(product), 0);
  const savings = saved.reduce((sum, product) => sum + Math.max(0, (product.compareAtIncVat ?? product.priceIncVat) - product.priceIncVat) * quantity(product), 0);

  async function addProducts(items: Product[], singleUnit = false) {
    if (busy || !items.length) return;
    setBusy(true);
    setNotice("");
    let added = 0;
    try {
      for (const product of items) {
        if (!canAdd(product)) continue;
        await addItem(product.defaultVariantId!, singleUnit ? 1 : quantity(product));
        added++;
      }
      setNotice(`${added} ${added === 1 ? "product" : "products"} added to your basket. Prices and availability are checked at checkout.`);
    } catch (err) {
      setNotice(`${added ? `${added} products added. ` : ""}${err instanceof Error ? err.message : "Unable to add products."} Check your basket before retrying.`);
    } finally { setBusy(false); }
  }

  function exportSelection() {
    const escape = (value: string | number) => `"${String(value).replace(/^[=+@\-\t\r]/, "'$&").replaceAll('"', '""')}"`;
    const rows = [["SKU", "Product", "Brand", "Quantity", "Unit price incl. VAT", "Specifications"], ...selected.map((product) => [product.sku, product.name, product.brand, quantity(product), product.priceIncVat, product.specs.map((spec) => `${spec.label}: ${spec.value}`).join("; ")])];
    const url = URL.createObjectURL(new Blob([rows.map((row) => row.map(escape).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a"); link.href = url; link.download = "buildivo-saved-materials.csv"; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return <div className={styles.layout} id="account-panel">
    <div className={styles.main}>
      <section className={styles.intro}><div className={styles.introTop}><div><span className={styles.eyebrow}>Commercial specification &amp; tooling lists</span><h2>Wishlists &amp; Saved Materials</h2><p>Keep tools and materials ready for your next job, and add saved products to your basket.</p></div><div className={styles.introActions}><button className={styles.primary} disabled title="Multiple wishlists are not available yet"><Plus />Create New Wishlist</button><button disabled title="CSV import is not available yet"><Upload />Import CSV</button></div></div><div className={styles.metrics}><div><small>Active wishlists</small><strong>1 List</strong><span>{wishlist.length} saved items</span></div><div><small>In-stock value</small><strong>{loading || error ? "—" : money(availableValue)}</strong><span>Including VAT</span></div><div><small>Ready for dispatch</small><strong>{loading || error ? "—" : `${saved.filter(canAdd).length} items`}</strong><span>Available to add to basket</span></div><div><small>Current savings</small><strong>{loading || error ? "—" : money(savings)}</strong><span>Against listed regular prices</span></div></div></section>
      <section className={styles.controls} aria-labelledby="saved-list-title"><div className={styles.listTabs}><span><Heart />Saved Materials ({wishlist.length})</span><small>Saved on this browser</small></div><div className={styles.listHeading}><div><h3 id="saved-list-title">Your Saved Tools &amp; Materials</h3><p>Your existing storefront wishlist, ready for your next job.</p></div><span className={styles.private}>Personal list</span></div><div className={styles.filters}><label className={styles.search}><Search /><input aria-label="Search saved materials" placeholder="Filter by brand, tool name, SKU…" value={query} onChange={(event) => setQuery(event.target.value)} /></label><label className={styles.stockToggle}><input type="checkbox" checked={inStockOnly} onChange={(event) => setInStockOnly(event.target.checked)} />In-stock only</label><select aria-label="Sort saved materials" value={sort} onChange={(event) => setSort(event.target.value)}><option value="saved">Sort: Saved order</option><option value="stock">Sort: In stock first</option><option value="price-low">Price: Low to high</option><option value="price-high">Price: High to low</option></select></div><div className={styles.bulk}><label><input type="checkbox" aria-label="Select all visible products" disabled={!visible.length || loading || Boolean(error) || busy} checked={visible.length > 0 && selected.length === visible.length} onChange={(event) => setExcluded(event.target.checked ? excluded.filter((id) => !visible.some((product) => product.id === id)) : [...new Set([...excluded, ...visible.map((product) => product.id)])])} />Select all ({selected.length} selected)</label><span>Total: <strong>{money(total)}</strong><small>incl. VAT · in-stock items</small></span><button disabled={!selected.length || loading || Boolean(error)} onClick={exportSelection}><Download />Export Spec</button><button disabled title="Project BOM transfer is not available yet"><ClipboardList />Transfer to Project BOM</button><button className={styles.primary} disabled={busy || loading || Boolean(error) || !purchasable.length} onClick={() => addProducts(purchasable)}><ShoppingCart />{busy ? "Adding…" : `Add In-Stock to Cart (${money(total)})`}</button></div></section>
      {notice && <div className={styles.message} role="status">{notice} <Link href="/cart">View basket <ArrowRight /></Link></div>}
      {error ? <div className={styles.message} role="alert">{error} <button onClick={() => setAttempt(attempt + 1)}>Try again</button></div> : loading ? <div className={styles.empty} role="status">Loading saved materials…</div> : <>
        {wishlist.length > saved.length && <p className={styles.unavailable}>{wishlist.length - saved.length} saved products are no longer available in the catalogue.</p>}
        {!visible.length && <div className={styles.empty}><Heart /><h3>{saved.length ? "No matching materials" : "Your wishlist is ready"}</h3><p>{saved.length ? "Try another search or turn off the stock filter." : "Save products with the heart button while browsing to see them here."}</p>{saved.length ? <button onClick={() => { setQuery(""); setInStockOnly(false); }}>Clear filters</button> : <Link href="/">Browse products <ArrowRight /></Link>}</div>}
        {visible.map((product) => <article className={styles.product} key={product.id} aria-label={product.name}><div className={styles.productTop}><input type="checkbox" aria-label={`Select ${product.name}`} disabled={busy} checked={!excluded.includes(product.id)} onChange={(event) => setExcluded(event.target.checked ? excluded.filter((id) => id !== product.id) : [...excluded, product.id])} /><Link className={styles.image} href={`/p/${product.slug}`} aria-label={`View ${product.name}`}><span>{product.brand}</span><ProductImage src={product.image} categorySlug={product.categorySlug} className={styles.productImage} /></Link><div className={styles.details}><small>SKU: {product.sku || "Not provided"}</small><h3><Link href={`/p/${product.slug}`}>{product.name}</Link></h3><div className={styles.specs}>{product.specs.slice(0, 4).map((spec) => <span key={spec.label}>{spec.value} {spec.label}</span>)}</div><div className={styles.stock}><span className={canAdd(product) ? styles.available : styles.soldOut}><Package />{canAdd(product) ? `In stock${stockLimit(product) !== undefined ? ` (${stockLimit(product)} available)` : ""}` : "Currently unavailable"}</span><span><Truck />{product.deliveryEta}</span></div></div><div className={styles.price}><strong>{money(product.priceIncVat)}</strong>{product.compareAtIncVat && product.compareAtIncVat > product.priceIncVat && <del>{money(product.compareAtIncVat)}</del>}<small>incl. VAT</small></div></div><footer className={styles.productActions}><span>Jobsite qty:</span><div className={styles.quantity}><button aria-label={`Decrease quantity for ${product.name}`} disabled={busy || quantity(product) <= 1} onClick={() => setQuantities({ ...quantities, [product.id]: quantity(product) - 1 })}><Minus /></button><input type="number" min={1} max={Math.max(1, stockLimit(product) ?? 999)} aria-label={`Quantity for ${product.name}`} value={quantity(product)} disabled={busy} onChange={(event) => { const value = Number(event.target.value); setQuantities({ ...quantities, [product.id]: Math.max(1, Math.min(Math.floor(value) || 1, Math.max(1, stockLimit(product) ?? 999))) }); }} /><button aria-label={`Increase quantity for ${product.name}`} disabled={busy || quantity(product) >= (stockLimit(product) ?? 999)} onClick={() => setQuantities({ ...quantities, [product.id]: quantity(product) + 1 })}><Plus /></button></div><span>Subtotal: <b>{money(product.priceIncVat * quantity(product))}</b></span><button disabled title="Project BOM transfer is not available yet"><ClipboardList />Move to BOM</button><button className={styles.primary} disabled={busy || !canAdd(product)} onClick={() => addProducts([product])}><ShoppingCart />Add to Cart</button><button aria-label={`Remove ${product.name} from wishlist`} disabled={busy} onClick={() => toggleWishlist(product.id)}><Trash2 /></button></footer></article>)}
      </>}
    </div>
    <aside className={styles.sidebar} aria-label="Wishlist shortcuts and support"><section className={styles.reorder} id="fast-reorder"><h2><Zap />Quick Reorder</h2><p>Add a saved product to your basket in one click.</p><div className={styles.reorderLabel}>Saved materials</div>{!loading && !error && saved.slice(0, 3).map((product) => <div className={styles.quickItem} key={product.id}><div><ProductImage src={product.image} categorySlug={product.categorySlug} className={styles.quickImage} /><Link href={`/p/${product.slug}`}>{product.name}<small>SKU: {product.sku || "Not provided"}</small></Link><strong>{money(product.priceIncVat)}</strong></div><footer><small>{canAdd(product) ? "Available to order" : "Currently unavailable"}</small><button className={styles.primary} disabled={busy || !canAdd(product)} onClick={() => addProducts([product], true)}><ShoppingCart />1-Click Add</button></footer></div>)}{(loading || error || !saved.length) && <p>{loading ? "Loading saved products…" : error ? "Saved products are temporarily unavailable." : "Your saved products will appear here."}</p>}<Link className={styles.browse} href="/">Browse tools &amp; materials <ArrowRight /></Link></section><section className={styles.support}><span className={styles.supportLabel}><Wrench />Jobsite support</span><h2>Need materials for your next job?</h2><p>Get help with products, orders and deliveries through our customer help desk.</p><div><small>Customer support</small><Link href="/help"><Headset />Contact Help Desk</Link></div></section><section className={styles.assurances}><h2><ShieldCheck />Buildivo Account Support</h2><ul><li><ShieldCheck /><span><strong>Your saved materials.</strong> Keep your product shortlist in this browser.</span></li><li><Truck /><span><strong>Product availability.</strong> Review current stock before adding to your basket.</span></li><li><ClipboardList /><span><strong>Specification export.</strong> Download selected products and their listed specifications.</span></li></ul></section><button className={styles.dossier} disabled={!selected.length || loading || Boolean(error)} onClick={exportSelection}><ClipboardList /><span><strong>Consolidated Spec Dossier</strong><small>Selected materials · CSV</small></span><Download /></button></aside>
  </div>;
}
