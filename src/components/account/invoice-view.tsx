"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { House } from "lucide-react";
import { CURRENCY, formatPrice } from "@/lib/format";
import type { GeneralSettings } from "@/lib/api";
import styles from "./invoice-view.module.css";

type Item = { id: number; titleSnapshot: string; variantTitleSnapshot: string; skuSnapshot: string | null; quantity: number; unitPrice: string; discount?: string | null; vatRatePercent: string; vatAmount: string; subtotal: string };
type Order = {
  uuid: string; orderNumber: string; status: string; paymentStatus: string; placedAt: string; email: string;
  invoice?: { invoiceNumber: string; issuedAt: string } | null;
  billingFullName?: string; billingCompanyName?: string | null; billingLine1?: string; billingLine2?: string | null; billingCity?: string; billingPostcode?: string;
  shippingFullName: string; shippingLine1: string; shippingLine2?: string | null; shippingCity: string; shippingPostcode: string;
  subtotal: string; discountTotal: string; shippingCharge: string; vatTotal: string; total: string; couponCode?: string | null;
  shippingMethod?: { title: string } | null; shipments?: { carrier: string; trackingNumber?: string | null }[];
  items: Item[];
};

const n = (value?: string | number | null) => Number(value ?? 0);
const address = (a: { line1?: string; line2?: string | null; city?: string; postcode?: string }) => [a.line1, a.line2, [a.city, a.postcode].filter(Boolean).join(" ")].filter(Boolean).join(", ");

export function InvoiceView({ uuid, settings }: { uuid: string; settings: GeneralSettings }) {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/customer-session/orders/${uuid}`, { signal: controller.signal, cache: "no-store" })
      .then(async (res) => {
        if (res.status === 401) { router.replace(`/login?next=/account/orders/${uuid}/invoice`); return; }
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.message || "We couldn't find that order.");
        setOrder(body.order);
      })
      .catch((err) => { if (err.name !== "AbortError") setError(err.message); });
    return () => controller.abort();
  }, [uuid, router]);

  async function download() {
    if (!order || downloading) return;
    setDownloading(true); setDownloadError("");
    try {
      const res = await fetch(`/api/customer-session/orders/${uuid}/invoice`, { cache: "no-store" });
      if (!res.ok) throw new Error();
      const url = URL.createObjectURL(await res.blob());
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${order.invoice?.invoiceNumber ?? order.orderNumber}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch { setDownloadError("We couldn't generate your invoice PDF. Please try again."); }
    finally { setDownloading(false); }
  }

  const shell = (children: React.ReactNode) => (
    <div className={styles.page}>
      <nav className={styles.crumbs} aria-label="Breadcrumb">
        <Link href="/"><House aria-hidden="true" />Home</Link><span aria-hidden="true">/</span>
        <Link href="/account">Customer Account</Link><span aria-hidden="true">/</span>
        <span aria-current="page">Invoice{order ? ` ${order.invoice?.invoiceNumber ?? order.orderNumber}` : ""}</span>
      </nav>
      {children}
    </div>
  );
  if (error) return shell(<p className={styles.message} role="alert">{error} <Link href="/account">Back to your account</Link></p>);
  if (!order) return shell(<p className={styles.message} role="status">Loading invoice…</p>);
  if (!order.invoice) return shell(<p className={styles.message}>An invoice is available once this order has been paid. <Link href="/account">Back to your account</Link></p>);

  const date = new Date(order.invoice.issuedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const lines = order.items.map((item) => {
    const gross = n(item.subtotal), vat = n(item.vatAmount);
    return { item, rate: n(item.vatRatePercent), vat, gross, net: gross - vat, netUnit: (gross - vat) / item.quantity };
  });
  const byRate = new Map<number, { net: number; vat: number; gross: number }>();
  for (const line of lines) {
    const row = byRate.get(line.rate) ?? { net: 0, vat: 0, gross: 0 };
    byRate.set(line.rate, { net: row.net + line.net, vat: row.vat + line.vat, gross: row.gross + line.gross });
  }
  const totals = [...byRate.values()].reduce((sum, row) => ({ net: sum.net + row.net, vat: sum.vat + row.vat, gross: sum.gross + row.gross }), { net: 0, vat: 0, gross: 0 });
  const rateLabel = (rate: number) => (rate === 0 ? "Zero rated (0%)" : `Standard rate (${rate}%)`);
  const settled = order.paymentStatus === "REFUNDED" ? "Refunded" : order.paymentStatus === "PARTIALLY_REFUNDED" ? "Partially refunded" : "Paid in full";
  const shipment = order.shipments?.[0];
  const company = order.billingCompanyName;

  return shell(
    <div className={styles.wrap}>
      <div className={styles.toolbar}>
        <Link href="/account">← Back to account</Link>
        <button type="button" onClick={() => void download()} disabled={downloading}>{downloading ? "Preparing PDF…" : "Download PDF invoice"}</button>
      </div>
      {downloadError && <p role="alert" className={styles.downloadError}>{downloadError}</p>}
      <div className={styles.sheet}>
        <header className={styles.top}>
          <div className={styles.brand}>
            <div className={styles.logo}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={settings.logo || "/images/buildivo.png"} alt="" />
              <b>Buildivo</b>
            </div>
            <p className={styles.company}>
              <b>Buildivo Ltd</b><br />
              {settings.companyAddress}{settings.companyAddress ? <br /> : null}
              {settings.vatNumber ? <>VAT reg. no. {settings.vatNumber} · </> : null}{settings.supportEmail}
            </p>
          </div>
          <div className={styles.docId}>
            <span className={styles.badge}>Statutory VAT tax invoice</span>
            <h2 className={`${styles.number} ${styles.mono}`}>{order.invoice.invoiceNumber}</h2>
          </div>
        </header>
        <div className={styles.meta}>
          <div><span className={styles.label}>Tax point / date</span><b>{date}</b></div>
          <div><span className={styles.label}>Order reference</span><b className={styles.mono}>{order.orderNumber}</b></div>
          <div><span className={styles.label}>Payment status</span><b>{settled}</b></div>
          <div><span className={styles.label}>Delivery method</span><b>{order.shippingMethod?.title ?? "—"}</b></div>
          <div><span className={styles.label}>Currency</span><b>{CURRENCY}</b></div>
          <div><span className={styles.label}>Customer account</span><b>{order.email}</b></div>
        </div>
        <section className={styles.parties}>
          <div className={styles.party}>
            <h3>Invoice addressee (bill to)</h3>
            <strong>{company || order.billingFullName || order.shippingFullName}</strong>
            <p>
              {company ? <>{order.billingFullName}<br /></> : null}
              {address({ line1: order.billingLine1 ?? order.shippingLine1, line2: order.billingLine2 ?? order.shippingLine2, city: order.billingCity ?? order.shippingCity, postcode: order.billingPostcode ?? order.shippingPostcode })}<br />
              {order.email}
            </p>
          </div>
          <div className={styles.party}>
            <h3>Delivery address (ship to){order.status === "DELIVERED" ? <span className={styles.status}>Delivered</span> : null}</h3>
            <strong>{order.shippingFullName}</strong>
            <p>
              {address({ line1: order.shippingLine1, line2: order.shippingLine2, city: order.shippingCity, postcode: order.shippingPostcode })}
              {shipment ? <><br />Carrier: {shipment.carrier}{shipment.trackingNumber ? ` · ${shipment.trackingNumber}` : ""}</> : null}
            </p>
          </div>
        </section>
        <div className={styles.itemsHead}>
          <h3>Itemised supply schedule <span>({lines.length} recorded {lines.length === 1 ? "transaction" : "transactions"})</span></h3>
          <small>All values stated in {CURRENCY}</small>
        </div>
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead><tr><th>#</th><th>Description / specification</th><th>Qty</th><th>Unit price (inc. VAT)</th><th>Discount</th><th>Net price</th><th>VAT %</th><th>Line total (net)</th></tr></thead>
            <tbody>
              {lines.map(({ item, rate, netUnit, net }, index) => (
                <tr key={item.id}>
                  <td>{String(index + 1).padStart(2, "0")}</td>
                  <td><b>{item.titleSnapshot}</b><small>{item.variantTitleSnapshot}{item.skuSnapshot ? <span className={styles.mono}> · {item.skuSnapshot}</span> : null}</small></td>
                  <td><b>{item.quantity}</b></td>
                  <td>{formatPrice(n(item.unitPrice))}</td>
                  <td>{n(item.discount) > 0 ? <span className={styles.accent}>{formatPrice(n(item.discount))}</span> : "—"}</td>
                  <td>{formatPrice(netUnit)}</td>
                  <td>{rate.toFixed(1)}%</td>
                  <td><b>{formatPrice(net)}</b></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <section className={styles.lower}>
          <div>
            <div className={styles.box}>
              <h4>Statutory VAT rate analysis</h4>
              <table className={styles.vat}>
                <thead><tr><th>VAT category &amp; rate</th><th>Goods net total</th><th>VAT payable</th><th>Gross total</th></tr></thead>
                <tbody>{[...byRate.entries()].map(([rate, row]) => <tr key={rate}><td>{rateLabel(rate)}</td><td>{formatPrice(row.net)}</td><td>{formatPrice(row.vat)}</td><td>{formatPrice(row.gross)}</td></tr>)}</tbody>
                <tfoot><tr><td>Totals subject to VAT</td><td>{formatPrice(totals.net)}</td><td>{formatPrice(totals.vat)}</td><td>{formatPrice(totals.gross)}</td></tr></tfoot>
              </table>
            </div>
            <p className={styles.note}>Statutory tax point: {date}. Item prices above include VAT at the rate shown.</p>
          </div>
          <div>
            <div className={styles.box}>
              <h4>Financial settlement ledger</h4>
              <div className={styles.ledger}>
                <div><span>Goods subtotal (inc. VAT)</span><span>{formatPrice(n(order.subtotal))}</span></div>
                {n(order.discountTotal) > 0 ? <div><span>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</span><span className={styles.accent}>−{formatPrice(n(order.discountTotal))}</span></div> : null}
                <div><span>Delivery{order.shippingMethod ? ` — ${order.shippingMethod.title}` : ""}</span><span>{n(order.shippingCharge) === 0 ? "Free" : formatPrice(n(order.shippingCharge))}</span></div>
                <div className={styles.rule}><span>Total (ex. VAT)</span><span>{formatPrice(n(order.total) - n(order.vatTotal))}</span></div>
                <div><span>VAT included</span><span>{formatPrice(n(order.vatTotal))}</span></div>
              </div>
            </div>
            <div className={styles.totalBox}>
              <small>Total invoice value (inc. VAT)</small>
              <strong>{formatPrice(n(order.total))}</strong>
              <em>{settled}</em>
            </div>
          </div>
        </section>
        <footer className={styles.foot}>
          <span>{settings.copyright || `© ${new Date().getFullYear()} Buildivo Ltd`}{settings.vatNumber ? ` · VAT reg. no. ${settings.vatNumber}` : ""}</span>
          <span><b>{settings.supportPhone1}</b>{settings.supportPhone1 && settings.supportEmail ? " · " : ""}{settings.supportEmail}</span>
        </footer>
      </div>
    </div>,
  );
}
