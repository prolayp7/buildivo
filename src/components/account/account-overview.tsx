import Link from "next/link";
import { ArrowRight, Check, ClipboardCheck, MapPin, Package, TrendingUp, Truck } from "lucide-react";
import type { AccountOrder } from "./order-types";
import styles from "./account-overview.module.css";

const money = (value: string | number) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(Number(value));

export function AccountOverview({ orders, total, loading, error, onViewOrders }: {
  orders: AccountOrder[];
  total?: number;
  loading: boolean;
  error: string;
  onViewOrders: (orderNumber?: string) => void;
}) {
  const ready = !loading && !error;
  const partial = total !== undefined && orders.length < total;
  const active = orders.filter((order) => order.status === "SHIPPED");
  const dispatch = active[0];
  const currentYear = new Date().getFullYear();
  const spend = orders.filter((order) => new Date(order.placedAt).getFullYear() === currentYear && order.paymentStatus === "PAID" && !["CANCELLED", "FAILED"].includes(order.status)).reduce((sum, order) => sum + Number(order.total), 0);
  let tracking: string | undefined;
  try { if (dispatch?.trackingUrl) { const url = new URL(dispatch.trackingUrl); if (["http:", "https:"].includes(url.protocol)) tracking = url.href; } } catch { /* No carrier link when the URL is invalid. */ }

  return <div className={styles.overview}>
    <section className={styles.welcome} aria-labelledby="overview-heading">
      <div><span className={styles.eyebrow}>Commercial master operations</span><h2 id="overview-heading">Account Overview &amp;<br />Operational Hub</h2><p>Your orders, live dispatches and fleet replenishment, together in one place.</p></div>
    </section>
    <div className={styles.metrics}>
      <section className={styles.metric}><div><h3>{partial ? "Loaded dispatches" : "Active dispatches"}</h3><Truck /></div><strong>{ready ? active.length : "—"}<br />{ready && active.length === 1 ? "Shipment" : "Shipments"}</strong><p>{ready ? active.length ? "Orders currently in transit" : "No shipments in transit" : "Awaiting order history"}</p><footer><button onClick={() => onViewOrders()}>View dispatches <ArrowRight /></button></footer></section>
      <section className={styles.metric}><div><h3>{partial ? "Loaded YTD spend" : "YTD tooling spend"}</h3><TrendingUp /></div><strong>{ready ? money(spend) : "—"}</strong><p>Paid orders in {currentYear} · incl. VAT</p></section>
    </div>
    {partial && <p className={styles.partial}>Summary covers {orders.length} of {total} orders. <button onClick={() => onViewOrders()}>View order history</button> to load the remaining orders for complete totals.</p>}
    {dispatch ? <article className={styles.dispatch} aria-label={`Active dispatch ${dispatch.orderNumber}`}>
      <header><span className={styles.locationIcon}><MapPin /></span><div><small>Order #{dispatch.orderNumber} <span>• In transit</span></small><h3>{dispatch.shippingCompanyName || dispatch.shippingLine1}</h3></div><span className={styles.status}>In transit</span></header>
      <div className={styles.dispatchBody}>
        <div className={styles.routing}><div><small>Direct routing</small><strong>{dispatch.shippingLine1}</strong><p>{dispatch.shippingCity} · {dispatch.shippingPostcode}</p></div><div><small>Carrier &amp; tracking</small><strong>{dispatch.trackingCarrier || "Not provided"}</strong><p>{dispatch.trackingNumber || "Tracking number pending"}</p></div><div>{tracking ? <a className={styles.primary} href={tracking} target="_blank" rel="noopener noreferrer"><MapPin />Track delivery</a> : <span>Carrier link pending</span>}</div></div>
        <ol className={styles.progress} aria-label="Dispatch progress">{["Order received", "Hub packed", "In transit", "Delivered"].map((label, index) => <li key={label} className={index < 2 ? styles.complete : index === 2 ? styles.current : ""} aria-current={index === 2 ? "step" : undefined}><span>{index < 2 ? <Check /> : index === 2 ? <Truck /> : <ClipboardCheck />}</span><strong>{label}</strong><small>{index < 2 ? "Complete" : index === 2 ? "Current status" : "Pending"}</small></li>)}</ol>
        <footer className={styles.manifest}><strong>{dispatch.items.length} consigned {dispatch.items.length === 1 ? "item" : "items"}</strong><p>{dispatch.items.map((item) => item.titleSnapshot).join(", ")}</p><span><b>{money(dispatch.total)}</b><small>incl. VAT</small></span><button onClick={() => onViewOrders(dispatch.orderNumber)}>View Manifest <ArrowRight /></button></footer>
      </div>
    </article> : <section className={styles.noDispatch}><Truck /><div><h3>{ready ? "No active dispatches" : "Dispatch overview"}</h3><p>{ready ? "Your next shipment will appear here when it is dispatched." : "Shipment details will appear when your order history is available."}</p></div></section>}
    <section className={styles.recent} aria-labelledby="recent-orders-heading"><header><div><h2 id="recent-orders-heading">Recent Trade Orders &amp; Dispatches</h2><p>Your latest orders and jobsite deliveries.</p></div><button onClick={() => onViewOrders()}>View All {total ?? ""} Records <ArrowRight /></button></header>
      {orders.length ? <div className={styles.tableScroll} role="region" aria-label="Recent orders table" tabIndex={0}><table><thead><tr><th scope="col">Order / Reference</th><th scope="col">Timestamp</th><th scope="col">Jobsite destination</th><th scope="col">Total incl. VAT</th><th scope="col">Fulfilment status</th><th scope="col">Action</th></tr></thead><tbody>{orders.slice(0, 5).map((order) => <tr key={order.uuid}><th scope="row">#{order.orderNumber}</th><td><time dateTime={order.placedAt}>{new Date(order.placedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</time></td><td>{order.shippingCompanyName || order.shippingLine1}</td><td className={styles.amount}>{money(order.total)}</td><td><span className={`${styles.tableStatus} ${order.status === "DELIVERED" ? styles.delivered : ["CANCELLED", "FAILED"].includes(order.status) ? styles.stopped : ""}`}>{order.status.replaceAll("_", " ").toLowerCase()}</span></td><td><button onClick={() => onViewOrders(order.orderNumber)}>View order</button></td></tr>)}</tbody></table></div> : <div className={styles.empty}><Package /><p>{loading ? "Loading recent orders…" : error ? "Recent orders are currently unavailable." : "No orders yet. Your first order will appear here."}</p>{ready && <Link href="/">Browse tools &amp; materials <ArrowRight /></Link>}</div>}
    </section>
  </div>;
}
