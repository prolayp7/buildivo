"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Check, ClipboardCheck, Download, Headset, MapPin, Package, Printer, RotateCcw, Search, ShieldCheck, ShoppingCart, SlidersHorizontal, Truck, Wrench, Zap } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import type { AccountOrder, AccountOrderItem, AccountOrderPage } from "./order-types";
import styles from "./account-orders.module.css";
import { AccountOverview } from "./account-overview";

const money = (value: string | number) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(Number(value));
const statusLabel = (value: string) => value.toLowerCase().replaceAll("_", " ");
const filters = ["All Orders", "In Transit", "Delivered", "Awaiting Dispatch"] as const;
type Filter = typeof filters[number];
const awaiting = ["PENDING", "AWAITING_PAYMENT", "PROCESSING", "PACKED"];
const matchesFilter = (order: AccountOrder, filter: Filter) => filter === "All Orders" || (filter === "In Transit" ? order.status === "SHIPPED" : filter === "Delivered" ? order.status === "DELIVERED" : awaiting.includes(order.status));

function trackingUrl(value: string | null) {
  if (!value) return undefined;
  try { const url = new URL(value); return ["https:", "http:"].includes(url.protocol) ? url.href : undefined; } catch { return undefined; }
}

export function AccountOrders({ view = "orders", onViewOrders }: { view?: "overview" | "orders"; onViewOrders?: () => void }) {
  const [orders, setOrders] = useState<AccountOrder[]>([]);
  const [meta, setMeta] = useState<AccountOrderPage["meta"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("All Orders");
  const [showFilters, setShowFilters] = useState(false);
  const [site, setSite] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch("/api/customer-session/orders", { signal: controller.signal, cache: "no-store" });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        setOrders(data.items);
        setMeta(data.meta);
      } catch (err) {
        if (!controller.signal.aborted) setError(err instanceof Error ? err.message : "Could not load your orders.");
      } finally { if (!controller.signal.aborted) setLoading(false); }
    }
    void load();
    return () => controller.abort();
  }, [attempt]);

  async function loadMore() {
    if (!meta) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/customer-session/orders?page=${meta.page + 1}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setOrders((previous) => [...previous, ...data.items]);
      setMeta(data.meta);
    } catch (err) { setError(err instanceof Error ? err.message : "Could not load more orders."); }
    finally { setLoading(false); }
  }

  async function reorder(items: AccountOrderItem[], key: string) {
    if (busy) return;
    setBusy(key);
    setNotice("");
    let added = 0;
    try {
      for (const item of items) { await addItem(item.productVariantId, item.quantity); added++; }
      setNotice(`${added} ${added === 1 ? "item" : "items"} added to your basket. Current prices and availability apply.`);
    } catch (err) {
      setNotice(`${added ? `${added} items added. ` : ""}${err instanceof Error ? err.message : "Could not add items to your basket."} Check your basket before retrying.`);
    } finally { setBusy(null); }
  }

  const sites = [...new Set(orders.map((order) => order.shippingPostcode))];
  const visible = orders.filter((order) => matchesFilter(order, filter) && (!site || order.shippingPostcode === site) && [order.orderNumber, order.shippingCompanyName, order.shippingLine1, order.shippingPostcode, ...order.items.flatMap((item) => [item.titleSnapshot, item.skuSnapshot])].join(" ").toLowerCase().includes(query.trim().toLowerCase()));
  const recentItems = [...new Map(orders.filter((order) => !["CANCELLED", "FAILED"].includes(order.status)).flatMap((order) => order.items).map((item) => [item.productVariantId, item] as const).reverse()).values()].reverse().slice(0, 3);

  function exportOrders() {
    const cell = (value: string | number) => `"${String(value).replace(/^[=+@\-\t\r]/, "'$&").replaceAll('"', '""')}"`;
    const rows = [["Order", "Placed", "Status", "Jobsite", "Total GBP"], ...visible.map((order) => [order.orderNumber, order.placedAt, order.status, order.shippingPostcode, order.total])];
    const url = URL.createObjectURL(new Blob([rows.map((row) => row.map(cell).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a"); link.href = url; link.download = "buildivo-orders.csv"; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function viewOrders(orderNumber = "") {
    setQuery(orderNumber);
    setFilter("All Orders");
    setSite("");
    onViewOrders?.();
  }

  return (
    <div className={`${styles.layout} ${view === "overview" ? styles.overviewLayout : ""}`} id="account-panel">
      <div className={styles.main}>
        {notice && <div className={styles.message} role="status">{notice} <Link href="/cart">View basket <ArrowRight /></Link></div>}
        {error && <div className={styles.message} role="alert">{error} <button onClick={() => { if (orders.length) { void loadMore(); } else { setError(""); setLoading(true); setAttempt(attempt + 1); } }}>Try again</button> <Link href="/login">Sign in</Link></div>}
        {view === "overview" ? <AccountOverview orders={orders} total={meta?.total} loading={loading} error={error} onViewOrders={viewOrders} /> : <>
        <section className={styles.toolbar} aria-labelledby="orders-title">
          <div className={styles.headingRow}>
            <div><h2 id="orders-title">Orders &amp; Jobsite Consignments</h2><p>{meta ? `${meta.total} recorded orders · ${sites.length} ${sites.length === 1 ? "jobsite" : "jobsites"} in loaded orders` : "Your order history and jobsite deliveries."}</p></div>
            <div className={styles.tools}><button onClick={() => setShowFilters(!showFilters)} aria-expanded={showFilters} aria-controls="order-site-filter"><SlidersHorizontal />Filter</button><button onClick={exportOrders} disabled={!visible.length}><Download />Export CSV</button></div>
          </div>
          <div className={styles.filterRow}>
            <label className={styles.search}><Search /><input aria-label="Search orders" placeholder="Filter by order, jobsite, SKU…" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
            <div className={styles.filters} aria-label="Order status">{filters.map((name) => <button key={name} aria-pressed={filter === name} onClick={() => setFilter(name)}>{name} <span>({orders.filter((order) => matchesFilter(order, name)).length})</span></button>)}</div>
          </div>
          {showFilters && <div className={styles.siteFilter} id="order-site-filter"><label htmlFor="order-jobsite">Jobsite</label><select id="order-jobsite" value={site} onChange={(event) => setSite(event.target.value)}><option value="">All jobsites</option>{sites.map((postcode) => <option key={postcode}>{postcode}</option>)}</select></div>}
          {meta && orders.length < meta.total && <p>Showing {orders.length} of {meta.total} orders. Filters and export apply to loaded orders.</p>}
        </section>
        {loading && <div className={styles.empty} role="status">Loading your orders…</div>}
        {!loading && !error && !visible.length && <div className={styles.empty}><Package /><h3>{orders.length ? "No matching orders" : "Your orders will appear here"}</h3><p>{orders.length ? "Try another search or status filter." : "Once you place an order, you can follow its progress and reorder items here."}</p>{orders.length ? <button onClick={() => { setQuery(""); setFilter("All Orders"); setSite(""); }}>Clear filters</button> : <Link href="/">Browse tools &amp; materials <ArrowRight /></Link>}</div>}
        {visible.map((order) => {
          const delivered = order.status === "DELIVERED";
          const stopped = ["CANCELLED", "FAILED"].includes(order.status);
          const stage = delivered ? 3 : order.status === "SHIPPED" ? 2 : ["PROCESSING", "PACKED"].includes(order.status) ? 1 : 0;
          const tracking = trackingUrl(order.trackingUrl);
          return <article key={order.uuid} className={`${styles.order} ${delivered ? styles.delivered : ""}`} aria-label={`Order ${order.orderNumber}`}>
            <header className={styles.orderHeader}>
              <div><div className={styles.orderTitle}><h3>ORDER <span>#{order.orderNumber}</span></h3><time dateTime={order.placedAt}>Placed {new Date(order.placedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</time>{order.shippingCompanyName && <span className={styles.jobsite}><MapPin />{order.shippingCompanyName}</span>}</div><p><MapPin />{[order.shippingLine1, order.shippingCity, order.shippingPostcode].filter(Boolean).join(" · ")}</p></div>
              <span className={`${styles.status} ${stopped ? styles.stopped : ""}`}><span />{statusLabel(order.status)}</span>
            </header>
            {(order.trackingCarrier || order.trackingNumber || tracking) && <div className={styles.tracking}><span><Truck /><strong>{order.trackingCarrier || "Shipment tracking"}</strong>{order.trackingNumber && <span>{order.trackingNumber}</span>}</span>{tracking && <a href={tracking} target="_blank" rel="noopener noreferrer"><MapPin />Track delivery</a>}</div>}
            {!delivered && !stopped && <ol className={styles.progress} aria-label="Order progress">{["Order received", "Hub pick & pack", "In transit", "Delivered"].map((label, index) => <li key={label} className={index < stage ? styles.complete : index === stage ? styles.current : ""} aria-current={index === stage ? "step" : undefined}><span>{index < stage ? <Check /> : index === 2 ? <Truck /> : index === 3 ? <ClipboardCheck /> : <Package />}</span><strong>{label}</strong><small>{index < stage ? "Complete" : index === stage ? "Current status" : "Pending"}</small></li>)}</ol>}
            <div className={styles.items}>
              {!delivered && <p className={styles.itemsLabel}>Consigned equipment &amp; fasteners ({order.items.length} line items · {order.items.reduce((sum, item) => sum + item.quantity, 0)} total units)</p>}
              <div className={delivered ? styles.compactItems : styles.itemList}>{order.items.map((item) => <div className={styles.item} key={item.id}><span className={styles.productImage}><Package aria-label="Product image unavailable" /></span><div className={styles.itemInfo}><small>{item.skuSnapshot ? `SKU: ${item.skuSnapshot}` : "Ordered item"}</small><h4>{item.titleSnapshot}</h4><p>{item.variantTitleSnapshot}</p><p><strong>Qty: {item.quantity}</strong><span>Unit: {money(Number(item.subtotal) / item.quantity)} incl. VAT</span></p></div><div className={styles.price}><strong>{money(item.subtotal)}</strong><small>{money(Number(item.subtotal) - Number(item.vatAmount))} ex. VAT</small></div></div>)}</div>
            </div>
            <footer className={styles.orderFooter}><div><small>Subtotal ex. VAT</small><strong>{money(Number(order.subtotal) - Number(order.vatTotal))}</strong></div><div className={styles.total}><small>Total payable incl. VAT</small><strong>{money(order.total)}</strong></div><div><small>Payment status</small><strong className={styles.payment}>{statusLabel(order.paymentStatus)}</strong></div><div className={styles.orderActions}><button onClick={() => window.print()}><Printer />Print summaries</button><button className={styles.orangeButton} disabled={busy !== null || !order.items.length} onClick={() => reorder(order.items, order.uuid)}><RotateCcw />{busy === order.uuid ? "Adding to basket…" : delivered ? "Quick Reorder" : "Reorder Consignment"}</button></div></footer>
          </article>;
        })}
        {meta && meta.page < meta.totalPages && <button className={styles.loadMore} disabled={loading} onClick={loadMore}>Load more orders</button>}
        </>}
      </div>
      <aside className={styles.sidebar} aria-label="Reorder and account support">
        <section className={styles.restock} id="fast-reorder"><div className={styles.restockLabel}><span><span />Fast Reorder Hub</span><small>Previously ordered</small></div><h2>Your Fleet Restock</h2><p>Quickly replenish essential tools and materials from your previous orders.</p><div className={styles.restockTabs}><strong>Recently ordered ({recentItems.length})</strong><Link href="/wishlist">Saved Products</Link></div>{recentItems.length ? recentItems.map((item) => <div className={styles.restockItem} key={item.productVariantId}><div><span className={styles.productImage}><Package /></span><div><small>{item.skuSnapshot || "Previously ordered"}</small><h3>{item.titleSnapshot}</h3><p>{item.variantTitleSnapshot}</p></div></div><footer><span><strong>{money(Number(item.subtotal) / item.quantity)}</strong><small>Last ordered price</small></span><button disabled={busy !== null} onClick={() => reorder([{ ...item, quantity: 1 }], `item-${item.id}`)}><ShoppingCart />{busy === `item-${item.id}` ? "Adding…" : "Reorder"}</button></footer></div>) : <p className={styles.restockEmpty}>{loading ? "Loading your previous purchases…" : "Products from your orders will appear here for quick reordering."}</p>}<Link className={styles.viewSaved} href="/wishlist">View saved products <ArrowRight /></Link></section>
        <section className={styles.support}><div className={styles.supportHeading}><span><Wrench /></span><div><small>Jobsite support</small><h2>Keep your job moving</h2></div></div><p>Need help with a delivery or an item for your next job? Visit our help desk for support.</p><div className={styles.supportContact}><div><small>Customer support</small><strong>Order &amp; delivery help</strong></div><Link href="/help"><Headset />Help Desk</Link></div></section>
        <section className={styles.protections}><h2>Commercial Account Support</h2><ul><li><BadgeCheck /><div><strong>Your order records.</strong> Review purchased items, quantities and totals in one place.</div></li><li><Truck /><div><strong>Delivery tracking.</strong> Follow carrier updates when tracking is available.</div></li><li><ShieldCheck /><div><strong>Account access.</strong> Your order history is available after signing in.</div></li><li><Zap /><div><strong>Easy replenishment.</strong> Add previous purchases to your basket at current prices.</div></li></ul></section>
      </aside>
    </div>
  );
}
