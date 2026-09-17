"use client";

import { useState } from "react";
import { Archive, Download, FileText } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/types";
import { formatPrice } from "@/lib/format";
import { useCartStore } from "@/lib/cart-store";
import { submitQuoteRequest } from "@/lib/storefront-client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import styles from "./bulk-pallets.module.css";

function downloadSpecs(products: Product[]) {
  const lines = ["BUILDIVO - BULK PALLET & JOB-PACK SPECIFICATIONS", "Prices exclude VAT. Check current availability before ordering.", "", ...products.flatMap((p) => [p.name, `SKU: ${p.sku}`, `Price: GBP ${(p.priceIncVat / (1 + p.vatRate)).toFixed(2)} ex. VAT`, ...(p.quantityTiers ?? []).map((t) => `${t.minQty}+ units: GBP ${t.unitPriceExVat.toFixed(2)} each ex. VAT`), ...p.specs.slice(0, 3).map((s) => `${s.label}: ${s.value}`), ""])];
  const wrapped = lines.flatMap((line) => line.match(/.{1,85}(?:\s|$)|.{1,85}/g) ?? [""]).slice(0, 48);
  const escape = (value: string) => value.replace(/[^\x20-\x7E]/g, " ").replace(/([\\()])/g, "\\$1");
  const stream = `BT /F1 10 Tf 14 TL 40 800 Td ${wrapped.map((line) => `(${escape(line)}) Tj T*`).join("\n")} ET`;
  const objects = ["<< /Type /Catalog /Pages 2 0 R >>", "<< /Type /Pages /Kids [3 0 R] /Count 1 >>", "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>", "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>", `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`];
  let pdf = "%PDF-1.4\n"; const offsets = [0];
  objects.forEach((object, index) => { offsets.push(pdf.length); pdf += `${index + 1} 0 obj\n${object}\nendobj\n`; });
  const xref = pdf.length;
  pdf += `xref\n0 6\n0000000000 65535 f \n${offsets.slice(1).map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`).join("")}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  const url = URL.createObjectURL(new Blob([pdf], { type: "application/pdf" })); const link = document.createElement("a"); link.href = url; link.download = "buildivo-bulk-specifications.pdf"; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function BulkPallets({ products }: { products: Product[] }) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selected, setSelected] = useState<string>(String(products[0]?.defaultVariantId ?? ""));
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState("");
  return <section className={styles.section} aria-labelledby="bulk-heading"><div className={styles.container}>
    <header className={styles.header}><div><span className={styles.kicker}><Archive size={16} />SITE-DIRECT PALLET LOGISTICS</span><h2 id="bulk-heading">Contractor Bulk Pallets &amp; Job-Pack Overstocks</h2><p>Commercial-grade jobsite quantities discounted directly from Tier-1 trade suppliers.<br />Invoiced on verified Trade Net-30 credit terms.</p></div><div className={styles.headerActions}><button disabled={!products.length} onClick={() => downloadSpecs(products)}><Download size={17} />Download Pallet Spec Sheet<br />(PDF)</button><button disabled={!products.some((p) => p.defaultVariantId)} onClick={() => { setError(""); setConfirmation(""); setOpen(true); }}><FileText size={17} />RFQ Bulk Quotation</button></div></header>
    <div className={styles.grid}>{products.map((product) => <BulkCard key={product.id} product={product} />)}</div>
    {!products.length && <p className={styles.empty}>Bulk offers are currently unavailable. Please check back soon.</p>}
    <Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle>Request a bulk quotation</DialogTitle></DialogHeader>{confirmation ? <p role="status">Your request has been received. Reference: {confirmation}</p> : <form className={styles.form} onSubmit={async (event) => { event.preventDefault(); const data = new FormData(event.currentTarget); setSubmitting(true); setError(""); try { const result = await submitQuoteRequest({ contactName: String(data.get("name")), email: String(data.get("email")), companyName: String(data.get("company")), message: String(data.get("message")), items: [{ productVariantId: Number(selected), quantity: Number(data.get("quantity")) }] }); setConfirmation(result.uuid); } catch { setError("We could not submit your request. Please try again."); } finally { setSubmitting(false); } }}>
      <label>Product<select value={selected} onChange={(e) => setSelected(e.target.value)} required>{products.filter((p) => p.defaultVariantId).map((p) => <option key={p.id} value={p.defaultVariantId}>{p.name}</option>)}</select></label><label>Quantity<input name="quantity" type="number" min="1" step="1" defaultValue="1" required /></label><label>Your name<input name="name" autoComplete="name" required /></label><label>Email<input name="email" type="email" autoComplete="email" required /></label><label>Company<input name="company" autoComplete="organization" /></label><label>Delivery requirements<textarea name="message" rows={3} /></label>{error && <p role="alert">{error}</p>}<button disabled={submitting}>{submitting ? "Submitting…" : "Request quotation"}</button>
    </form>}</DialogContent></Dialog>
  </div></section>;
}
function BulkCard({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem); const [busy, setBusy] = useState(false);
  const tiers = product.quantityTiers?.length ? product.quantityTiers : [{ minQty: 1, unitPriceExVat: product.priceIncVat / (1 + product.vatRate), savePct: 0 }];
  const saving = Math.max(0, (product.compareAtIncVat ?? product.priceIncVat) - product.priceIncVat);
  return <article className={styles.card}>{saving > 0 && <span className={styles.saving}>SAVE {formatPrice(saving)} / PACK</span>}<span className={styles.pack}>TRADE PACK #{product.sku}</span><h3>{product.name}</h3><p className={styles.description}>{product.description.replace(/<[^>]*>/g, " ") || product.specs.map((s) => `${s.label}: ${s.value}`).join(" · ")}</p><div className={styles.prices}>{tiers.slice(0, 2).map((tier, i) => <div key={tier.minQty} className={i > 0 ? styles.tradePrice : undefined}><span>{tier.minQty}+ Packs{ i > 0 ? " (Trade Net)" : ""}:</span><strong>{formatPrice(tier.unitPriceExVat)} / ea</strong></div>)}<p><span>Delivery:</span><span>{product.deliveryEta}</span></p><small>Prices exclude VAT</small></div><footer><span>SKU: {product.sku}</span><button disabled={busy || !product.defaultVariantId || product.stock === "out-of-stock"} onClick={async () => { if (!product.defaultVariantId) return; setBusy(true); try { await addItem(product.defaultVariantId, 1); toast.success(`Added ${product.name} to cart`); } catch { toast.error("Could not add this pack. Please try again."); } finally { setBusy(false); } }}>{busy ? "Adding…" : product.stock === "out-of-stock" ? "Unavailable" : /pallet/i.test(product.name) ? "Add Pallet" : "Add Pack"}</button></footer></article>;
}
