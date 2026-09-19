"use client";

import { CURRENCY } from "@/lib/format";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ClipboardList, FileText, Headset, Package, Search, XCircle } from "lucide-react";
import styles from "./account-quotes.module.css";
import type { AccountQuote } from "./quote-types";

const money = (value: string | number) => new Intl.NumberFormat("en-GB", { style: "currency", currency: CURRENCY }).format(Number(value));

const STATUSES = ["All", "NEW", "REVIEWING", "QUOTED", "ACCEPTED", "DECLINED", "EXPIRED"] as const;
type StatusFilter = (typeof STATUSES)[number];
const STATUS_LABEL: Record<string, string> = {
  NEW: "Submitted", REVIEWING: "Being reviewed", QUOTED: "Quote ready", ACCEPTED: "Accepted", DECLINED: "Declined", EXPIRED: "Expired",
};
function statusClass(status: string) {
  if (status === "QUOTED" || status === "ACCEPTED") return styles.positive;
  if (status === "DECLINED" || status === "EXPIRED") return styles.negative;
  return styles.pending;
}
function reference(uuid: string) {
  return `RFQ-${uuid.slice(0, 6).toUpperCase()}`;
}

export function AccountQuotes() {
  const [quotes, setQuotes] = useState<AccountQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [busyUuid, setBusyUuid] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("All");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/customer-session/quotes", { cache: "no-store" });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        setQuotes(data.items ?? []);
      } catch (err) { setError(err instanceof Error ? err.message : "Could not load your quote requests."); }
      finally { setLoading(false); }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function respond(uuid: string, action: "accept" | "decline") {
    setBusyUuid(uuid); setActionError("");
    try {
      const response = await fetch(`/api/customer-session/quotes/${uuid}/${action}`, { method: "PATCH" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setQuotes((prev) => prev.map((q) => (q.uuid === uuid ? data.item : q)));
    } catch (err) { setActionError(err instanceof Error ? err.message : `Could not ${action} this quote.`); }
    finally { setBusyUuid(null); }
  }

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    const filtered = quotes.filter((q) => (filter === "All" || q.status === filter) && (!term || reference(q.uuid).toLowerCase().includes(term) || q.items.some((item) => item.productVariant.product.title.toLowerCase().includes(term))));
    return [...filtered].sort((a, b) => (sort === "newest" ? +new Date(b.createdAt) - +new Date(a.createdAt) : +new Date(a.createdAt) - +new Date(b.createdAt)));
  }, [quotes, filter, query, sort]);

  return (
    <div className={styles.layout} id="account-panel">
      <div className={styles.main}>
        <section className={styles.toolbar}>
          <label className={styles.search}><Search /><input aria-label="Search quote requests" placeholder="Search by reference code or product name…" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
          <label className={styles.sort}>Sort<select aria-label="Sort quote requests" value={sort} onChange={(event) => setSort(event.target.value as "newest" | "oldest")}><option value="newest">Date: Newest first</option><option value="oldest">Date: Oldest first</option></select></label>
        </section>
        <div className={styles.filters}>{STATUSES.map((status) => <button key={status} aria-pressed={filter === status} onClick={() => setFilter(status)}>{status === "All" ? "All" : STATUS_LABEL[status]} <span>({status === "All" ? quotes.length : quotes.filter((q) => q.status === status).length})</span></button>)}</div>

        {error && <div className={styles.message} role="alert">{error}</div>}
        {actionError && <div className={styles.message} role="alert">{actionError}</div>}
        {loading && <div className={styles.empty} role="status">Loading your quote requests…</div>}
        {!loading && !quotes.length && <div className={styles.empty}><FileText /><h3>No quote requests yet</h3><p>Request a quote from a product or bulk-order page for project or trade pricing.</p><Link href="/deals">Browse deals &amp; bulk pricing <ClipboardList /></Link></div>}
        {!loading && !!quotes.length && !visible.length && <div className={styles.empty}><Search /><h3>No matching requests</h3><p>Try another search or status filter.</p><button onClick={() => { setQuery(""); setFilter("All"); }}>Clear filters</button></div>}

        {!!visible.length && (
          <div className={styles.list}>
            {visible.map((quote) => (
              <article key={quote.uuid} className={styles.card}>
                <header>
                  <div><strong>{reference(quote.uuid)}</strong><span className={styles.dot}>•</span><span>Submitted {new Date(quote.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span></div>
                  <span className={statusClass(quote.status)}>{STATUS_LABEL[quote.status] ?? quote.status}</span>
                </header>
                <div className={styles.items}>{quote.items.map((item) => <div key={item.id} className={styles.item}><Package /><span><b>{item.productVariant.product.title}</b><small>Variant: {item.productVariant.title}</small></span><em>Qty {item.quantity}</em></div>)}</div>

                {quote.status === "QUOTED" && (
                  <footer className={styles.quotedFooter}>
                    {quote.adminNote && <p className={styles.note}><strong>Trade pricing note:</strong> {quote.adminNote}</p>}
                    <div className={styles.quotedRow}>
                      <span className={styles.total}>Quoted total <b>{money(quote.quotedTotal ?? 0)}</b></span>
                      <div className={styles.actions}>
                        <button disabled={busyUuid === quote.uuid} onClick={() => respond(quote.uuid, "decline")}><XCircle />Decline</button>
                        <button className={styles.accept} disabled={busyUuid === quote.uuid} onClick={() => respond(quote.uuid, "accept")}><CheckCircle2 />{busyUuid === quote.uuid ? "Saving…" : "Accept Quote"}</button>
                      </div>
                    </div>
                  </footer>
                )}
                {(quote.status === "NEW" || quote.status === "REVIEWING") && <footer><p className={styles.pendingNote}>We&rsquo;ll email you once this has been priced.</p></footer>}
                {quote.status === "ACCEPTED" && <footer><p className={styles.resolvedNote}><CheckCircle2 />Accepted on {new Date(quote.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}{quote.quotedTotal ? ` — ${money(quote.quotedTotal)}` : ""}</p></footer>}
                {quote.status === "DECLINED" && <footer><p className={styles.resolvedNote}><XCircle />Declined on {new Date(quote.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p></footer>}
                {quote.status === "EXPIRED" && <footer><p className={styles.pendingNote}>This quote request has expired.</p></footer>}
              </article>
            ))}
          </div>
        )}
      </div>

      <aside className={styles.sidebar} aria-label="Quote request help">
        <section className={styles.support}>
          <div className={styles.supportHeading}><span><Headset /></span><div><small>Direct assistance</small><h2>Need help with a quote?</h2></div></div>
          <p>Questions about volume trade pricing, custom specifications or split delivery? Our team can help.</p>
          <div className={styles.supportContact}><div><small>Trade desk</small><strong>0800 456 7890</strong></div><Link href="/help"><Headset />Help Desk</Link></div>
        </section>
        <section className={styles.howItWorks}>
          <h2>How trade quoting works</h2>
          <ol>
            <li><span>1</span><div><strong>Request a quote</strong><p>Add items from a product or bulk-order page with your project notes.</p></div></li>
            <li><span>2</span><div><strong>We review &amp; price it</strong><p>Our team works out volume pricing for your request.</p></div></li>
            <li><span>3</span><div><strong>Accept to lock it in</strong><p>Once priced, accept online to confirm your quoted rate.</p></div></li>
          </ol>
        </section>
      </aside>
    </div>
  );
}
