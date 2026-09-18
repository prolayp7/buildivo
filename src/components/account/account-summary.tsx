"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BadgeCheck, FileText, Heart, House, LayoutDashboard, MapPin, Package, Truck, Zap } from "lucide-react";
import styles from "./account-summary.module.css";
import { AccountOrders } from "./account-orders";
import { AccountWishlist } from "./account-wishlist";
import { AccountAddresses } from "./account-addresses";
import { AccountQuotes } from "./account-quotes";

type Customer = {
  firstName: string;
  lastName: string;
  email: string;
  emailVerified: boolean;
};

type View = "overview" | "orders" | "wishlist" | "addresses" | "quotes";

const VIEW_LABELS: Record<View, string> = {
  overview: "Account Overview",
  orders: "Orders & Jobsite Dispatches",
  wishlist: "Wishlists & Saved Materials",
  addresses: "Jobsite Addresses",
  quotes: "Quote Requests",
};

export function AccountSummary() {
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [view, setView] = useState<View>("overview");

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/customer-session", { signal: controller.signal, cache: "no-store" })
      .then(async (res) => {
        if (res.status === 401) { router.replace("/login"); return; }
        if (!res.ok) throw Error("Could not load your account. Please refresh to try again.");
        const data = await res.json();
        setCustomer(data.customer);
      })
      .catch((err) => { if (err.name !== "AbortError") setError(err.message); });
    return () => controller.abort();
  }, [router]);

  async function signOut() {
    setBusy(true);
    try {
      const res = await fetch("/api/customer-session", { method: "DELETE" });
      if (!res.ok) throw Error();
      router.replace("/login");
      router.refresh();
    } catch {
      setError("Unable to sign out. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className={styles.account} aria-label="Your account">
      <header className={styles.header}>
        <div className={styles.inner}>
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <Link href="/"><House aria-hidden="true" />Home</Link>
            <span aria-hidden="true">/</span><Link href="/account">Customer Account</Link>
            <span aria-hidden="true">/</span><span aria-current="page">{VIEW_LABELS[view]}</span>
          </nav>
          <div className={styles.summary}>
            <div className={styles.profile} id="account-overview">
              <div className={styles.avatar} aria-hidden="true">
                {customer ? `${customer.firstName.charAt(0)}${customer.lastName.charAt(0)}` : "…"}
                {customer?.emailVerified && <BadgeCheck className={styles.verified} />}
              </div>
              <div className={styles.identity}>
                <div className={styles.nameRow}>
                  <h1>{customer ? `${customer.firstName} ${customer.lastName}` : "Your Account"}</h1>
                  <span className={styles.badge}>Customer Account</span>
                </div>
                <p>{customer ? customer.email : "Loading your account…"}</p>
              </div>
            </div>
            <div className={styles.statuses}>
              <button className={styles.transit} onClick={() => setView("orders")}>
                <span className={styles.statusIcon}><Truck aria-hidden="true" /></span>
                <div><span className={styles.label}>Active transit</span><span className={styles.value}>Track your order</span></div>
              </button>
              <a className={styles.reorder} href="#fast-reorder"><Zap aria-hidden="true" />Fast Reorder</a>
            </div>
          </div>
          <nav className={styles.navigation} aria-label="Customer account">
            <button className={view === "overview" ? styles.active : undefined} aria-pressed={view === "overview"} aria-controls="account-panel" onClick={() => setView("overview")}><LayoutDashboard aria-hidden="true" />Account Overview</button>
            <button className={view === "orders" ? styles.active : undefined} aria-pressed={view === "orders"} aria-controls="account-panel" onClick={() => setView("orders")}><Package aria-hidden="true" />Orders &amp; Dispatches</button>
            <button className={view === "wishlist" ? styles.active : undefined} aria-pressed={view === "wishlist"} aria-controls="account-panel" onClick={() => setView("wishlist")}><Heart aria-hidden="true" />Wishlist</button>
            <button className={view === "addresses" ? styles.active : undefined} aria-pressed={view === "addresses"} aria-controls="account-panel" onClick={() => setView("addresses")}><MapPin aria-hidden="true" />Jobsite Addresses</button>
            <button className={view === "quotes" ? styles.active : undefined} aria-pressed={view === "quotes"} aria-controls="account-panel" onClick={() => setView("quotes")}><FileText aria-hidden="true" />Quote Requests</button>
          </nav>
        </div>
      </header>
      <div className={styles.content}>
        {error && <p role="alert" className={styles.error}>{error}</p>}
        {customer ? <>
          {view === "wishlist" ? <AccountWishlist />
            : view === "addresses" ? <AccountAddresses />
            : view === "quotes" ? <AccountQuotes />
            : <AccountOrders view={view} onViewOrders={() => setView("orders")} />}
          <div className={styles.actions}>
          <Link href="/">Continue shopping</Link>
          <button onClick={() => setView("wishlist")}>Saved products</button>
          <button disabled={busy} onClick={signOut}>{busy ? "Signing out…" : "Sign out"}</button>
        </div></> : !error && <p role="status">Loading your account…</p>}
      </div>
    </section>
  );
}
