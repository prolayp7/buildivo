"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, BadgeCheck, CalendarDays, Check, CircleAlert, CreditCard, FileText, Heart, House, LayoutDashboard, LogOut, MapPin, Package, PackageCheck, RotateCcw, Truck, UserRound } from "lucide-react";
import { CURRENCY } from "@/lib/format";
import { stopWishlistSync } from "@/lib/cart-store";
import { CHECKOUT_RETURN_KEY, createPaymentAttempt, listPaymentMethods, type PaymentProvider } from "@/lib/payments";
import type { AccountOrder } from "./order-types";
import { OrderActions } from "./order-actions";
import header from "./account-summary.module.css";
import styles from "./order-detail.module.css";

type DetailItem = AccountOrder["items"][number] & { unitPrice: string | number; imageUrl: string | null };
type DetailOrder = Omit<AccountOrder, "items"> & {
  email: string;
  shippingFullName: string;
  shippingLine2: string | null;
  shippingMethodTitle: string | null;
  discountTotal: string | number;
  shippingCharge: string | number;
  giftCardDiscount: string | number;
  couponCode: string | null;
  items: DetailItem[];
};
type Customer = { firstName: string; lastName: string; email: string; emailVerified: boolean };

const money = (value: string | number) => new Intl.NumberFormat("en-GB", { style: "currency", currency: CURRENCY }).format(Number(value));
const label = (value: string) => value.toLowerCase().replaceAll("_", " ");
const PAID = ["PAID", "PARTIALLY_REFUNDED", "REFUNDED"];
const PAYABLE = ["PENDING", "AWAITING_PAYMENT", "FAILED"];

function Thumb({ src }: { src: string | null }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <Package aria-label="Product image unavailable" />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" loading="lazy" onError={() => setFailed(true)} />;
}

function tone(status: string) {
  if (["DELIVERED", "PARTIALLY_RETURNED", "RETURNED", "PAID"].includes(status)) return "success";
  if (["CANCELLED", "FAILED", "PAYMENT_FAILED"].includes(status)) return "danger";
  if (["PROCESSING", "PACKED", "SHIPPED", "AWAITING_PAYMENT"].includes(status)) return "progress";
  return "neutral";
}

const TABS = [
  { tab: "overview", text: "Account Overview", Icon: LayoutDashboard },
  { tab: "orders", text: "Orders & Dispatches", Icon: Package },
  { tab: "returns", text: "Returns", Icon: RotateCcw },
  { tab: "wishlist", text: "Saved Products", Icon: Heart },
  { tab: "addresses", text: "Jobsite Addresses", Icon: MapPin },
  { tab: "quotes", text: "Quote Requests", Icon: FileText },
  { tab: "details", text: "Account Details", Icon: UserRound },
];

export function OrderDetail({ uuid }: { uuid: string }) {
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<number | null>(null);
  const [order, setOrder] = useState<DetailOrder | null>(null);
  const [error, setError] = useState("");
  const [signingOut, setSigningOut] = useState(false);

  async function signOut() {
    setSigningOut(true);
    try {
      const res = await fetch("/api/customer-session", { method: "DELETE" });
      if (!res.ok) throw Error();
      stopWishlistSync();
      router.replace("/login");
      router.refresh();
    } catch {
      setSigningOut(false);
    }
  }
  const [providers, setProviders] = useState<PaymentProvider[] | null>(null);
  const [provider, setProvider] = useState<PaymentProvider | null>(null);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");

  useEffect(() => {
    listPaymentMethods().then((methods) => {
      const available = methods.filter((m) => m.enabled && (m.provider === "STRIPE" || m.provider === "PAYPAL")).map((m) => m.provider as PaymentProvider);
      setProviders(available);
      setProvider((current) => current && available.includes(current) ? current : available[0] ?? null);
    }).catch(() => setProviders([]));
  }, []);

  async function payNow() {
    if (!order || !provider || paying) return;
    setPaying(true);
    setPayError("");
    try {
      const attempt = await createPaymentAttempt({ orderUuid: order.uuid, email: order.email, provider });
      if (!attempt.redirectUrl) throw new Error("The payment provider did not return a checkout link.");
      sessionStorage.setItem(CHECKOUT_RETURN_KEY, JSON.stringify({ order, email: order.email, method: provider.toLowerCase(), attemptId: attempt.attemptId }));
      window.location.href = attempt.redirectUrl;
    } catch (err) {
      setPayError(err instanceof Error ? err.message : "We couldn’t start your payment. Please try again.");
      setPaying(false);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    async function load() {
      try {
        const [account, detail, list] = await Promise.all([
          fetch("/api/customer-session", { signal, cache: "no-store" }),
          fetch(`/api/customer-session/orders/${uuid}`, { signal, cache: "no-store" }),
          fetch("/api/customer-session/orders", { signal, cache: "no-store" }),
        ]);
        if (account.status === 401 || detail.status === 401) { router.replace("/login"); return; }
        if (!account.ok) throw new Error("Could not load your account.");
        setCustomer((await account.json()).customer);
        const body = await detail.json().catch(() => ({}));
        if (!detail.ok) throw new Error(body.message ?? "We couldn’t find that order.");
        setOrder(body.order);
        if (list.ok) setOrders((await list.json()).meta?.total ?? null);
      } catch (err) {
        if (!signal.aborted) setError(err instanceof Error ? err.message : "We couldn’t find that order.");
      }
    }
    void load();
    return () => controller.abort();
  }, [uuid, router]);

  const paid = !!order && PAID.includes(order.paymentStatus);
  const shipping = order ? [order.shippingLine1, order.shippingLine2].filter(Boolean).join(", ") : "";
  const safeTracking = (() => { try { const url = new URL(order?.trackingUrl ?? ""); return ["http:", "https:"].includes(url.protocol) ? url.href : null; } catch { return null; } })();

  return (
    <section className={header.account} aria-label="Order details">
      <header className={header.header}>
        <div className={header.inner}>
          <nav className={header.breadcrumb} aria-label="Breadcrumb">
            <Link href="/"><House aria-hidden="true" />Home</Link>
            <span aria-hidden="true">/</span><Link href="/account">Customer Account</Link>
            <span aria-hidden="true">/</span><Link href="/account?tab=orders">Orders &amp; Dispatches</Link>
            <span aria-hidden="true">/</span><span aria-current="page">{order ? `#${order.orderNumber}` : "Order"}</span>
          </nav>
          <div className={header.summary}>
            <div className={header.profile}>
              <div className={header.avatar} aria-hidden="true">
                {customer ? `${customer.firstName.charAt(0)}${customer.lastName.charAt(0)}` : "…"}
                {customer?.emailVerified && <BadgeCheck className={header.verified} />}
              </div>
              <div className={header.identity}>
                <div className={header.nameRow}>
                  <h1>{customer ? `${customer.firstName} ${customer.lastName}` : "Your Account"}</h1>
                  <span className={header.badge}>Customer Account</span>
                </div>
                <p>{customer ? customer.email : "Loading your account…"}</p>
              </div>
            </div>
            <div className={header.statuses}>
              <Link className={header.transit} href="/account?tab=orders">
                <span className={header.statusIcon}><Truck aria-hidden="true" /></span>
                <div><span className={header.label}>Orders on account</span><span className={header.value}>{orders ?? "—"}</span></div>
              </Link>
              <button className={header.signout} disabled={signingOut} onClick={() => void signOut()}><LogOut aria-hidden="true" />{signingOut ? "Signing out…" : "Sign out"}</button>
            </div>
          </div>
          <nav className={header.navigation} aria-label="Customer account">
            {TABS.map(({ tab, text, Icon }) => (
              <Link key={tab} href={`/account?tab=${tab}`} className={tab === "orders" ? header.active : undefined} aria-current={tab === "orders" ? "page" : undefined}>
                <Icon aria-hidden="true" />{text}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <div className={`${header.content} ${styles.page}`}>
        {error ? (
          <div className={styles.message} role="alert">
            <CircleAlert aria-hidden="true" /><h2>We couldn’t find that order</h2><p>{error}</p>
            <Link className={styles.secondary} href="/account?tab=orders"><ArrowLeft aria-hidden="true" />Back to orders</Link>
          </div>
        ) : !order ? <p role="status" className={styles.loading}>Loading order details…</p> : <>
          <div className={styles.titleRow}>
            <div>
              <Link className={styles.back} href="/account?tab=orders"><ArrowLeft aria-hidden="true" />Orders &amp; Dispatches</Link>
              <h2>Order <span>#{order.orderNumber}</span></h2>
              <p><CalendarDays aria-hidden="true" />Placed {new Date(order.placedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
            </div>
            <span className={styles.status} data-tone={tone(order.status)}><i />{label(order.status)}</span>
          </div>
          {paid && <div className={styles.actions}><Link className={styles.primary} href={`/account/orders/${order.uuid}/invoice`}><FileText aria-hidden="true" />View / download invoice</Link></div>}

          <section className={styles.overview} aria-label="Order summary">
            <div className={styles.total}><span>Order total</span><strong>{money(order.total)}</strong></div>
            <div className={styles.meta}>
              <div><span>Payment</span><strong data-tone={tone(order.paymentStatus)}>{paid ? <Check aria-hidden="true" /> : <CreditCard aria-hidden="true" />}{label(order.paymentStatus)}</strong></div>
              <div><span>Items</span><strong>{order.items.length} {order.items.length === 1 ? "product" : "products"}</strong></div>
              <div><span>Delivery</span><strong>{order.shippingMethodTitle ?? "Standard delivery"}</strong></div>
            </div>
          </section>

          <div className={styles.grid}>
            <section className={styles.panel} aria-labelledby="items-heading">
              <div className={styles.heading}><span><PackageCheck aria-hidden="true" /></span><div><h3 id="items-heading">Items in this order</h3><p>{order.items.length} {order.items.length === 1 ? "product" : "products"}</p></div></div>
              <div className={styles.items}>
                {order.items.map((item) => (
                  <article key={item.id} className={styles.item}>
                    <span className={styles.thumb}><Thumb src={item.imageUrl} /></span>
                    <div>
                      <h4>{item.titleSnapshot}</h4>
                      {item.variantTitleSnapshot ? <p>{item.variantTitleSnapshot}</p> : null}
                      <small>Qty {item.quantity} · {money(item.unitPrice)} each{item.skuSnapshot ? ` · SKU ${item.skuSnapshot}` : ""}</small>
                    </div>
                    <strong>{money(item.subtotal)}</strong>
                  </article>
                ))}
              </div>
              <div className={styles.totals}>
                <div><span>Subtotal</span><strong>{money(order.subtotal)}</strong></div>
                {Number(order.discountTotal) > 0 && <div className={styles.discount}><span>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</span><strong>−{money(order.discountTotal)}</strong></div>}
                {Number(order.giftCardDiscount) > 0 && <div className={styles.discount}><span>Gift card</span><strong>−{money(order.giftCardDiscount)}</strong></div>}
                <div><span>Delivery{order.shippingMethodTitle ? ` · ${order.shippingMethodTitle}` : ""}</span><strong>{money(order.shippingCharge)}</strong></div>
                <div><span>VAT</span><strong>{money(order.vatTotal)}</strong></div>
                <div className={styles.grand}><span>Order total</span><strong>{money(order.total)}</strong></div>
              </div>
            </section>

            <aside className={styles.side}>
              <section className={styles.panel} aria-labelledby="delivery-heading">
                <div className={styles.heading}><span><MapPin aria-hidden="true" /></span><div><h3 id="delivery-heading">Delivering to</h3><p>Shipping address</p></div></div>
                <address>
                  <strong>{order.shippingFullName}</strong>
                  {order.shippingCompanyName ? <span>{order.shippingCompanyName}</span> : null}
                  <span>{shipping}</span>
                  <span>{order.shippingCity}, {order.shippingPostcode}</span>
                </address>
                {order.trackingCarrier || order.trackingNumber ? (
                  <div className={styles.tracking}><Truck aria-hidden="true" /><div>{order.trackingCarrier ? <span>{order.trackingCarrier}</span> : null}<strong>{order.trackingNumber ?? "Tracking pending"}</strong>{safeTracking ? <a href={safeTracking} target="_blank" rel="noopener noreferrer">Track package</a> : null}</div></div>
                ) : null}
              </section>
              <section className={styles.panel} aria-labelledby="payment-heading">
                <div className={styles.heading}><span><CreditCard aria-hidden="true" /></span><div><h3 id="payment-heading">Payment</h3><p>Payment status</p></div></div>
                <div className={styles.payment} data-tone={tone(order.paymentStatus)}>
                  <span>{paid ? <Check aria-hidden="true" /> : <CreditCard aria-hidden="true" />}</span>
                  <div><strong>{label(order.paymentStatus)}</strong><small>{paid ? "Payment received" : "Payment for this order"}</small></div>
                </div>
                {!paid && PAYABLE.includes(order.status) && (
                  <div className={styles.pay}>
                    {providers === null ? <p role="status">Loading payment methods…</p> : providers.length ? <>
                      {providers.length > 1 && (
                        <fieldset>
                          <legend>Choose how to pay</legend>
                          {providers.map((p) => (
                            <label key={p}><input type="radio" name="payment-provider" checked={provider === p} onChange={() => setProvider(p)} /><span>{p === "PAYPAL" ? "PayPal" : "Debit or credit card"}</span></label>
                          ))}
                        </fieldset>
                      )}
                      {payError ? <p role="alert" className={styles.payError}>{payError}</p> : null}
                      <button type="button" className={styles.payButton} onClick={() => void payNow()} disabled={paying || !provider} aria-busy={paying}>
                        {paying ? "Redirecting to payment…" : `Pay now${provider ? ` with ${provider === "PAYPAL" ? "PayPal" : "card"}` : ""}`}
                      </button>
                    </> : <p>No payment method is available right now. Please contact support.</p>}
                  </div>
                )}
              </section>
              <section className={`${styles.panel} ${styles.manage}`}>
                <OrderActions order={order} onChange={(_id, update) => setOrder((current) => (current ? { ...current, ...update(current) } as DetailOrder : current))} />
              </section>
            </aside>
          </div>
          <Link className={styles.back} href="/account?tab=orders"><ArrowLeft aria-hidden="true" />Back to orders</Link>
        </>}
      </div>
    </section>
  );
}
