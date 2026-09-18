"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { Headset, MapPin, Phone, Plus, Search, Star, Trash2, Pencil, Wrench, X } from "lucide-react";
import styles from "./account-addresses.module.css";
import type { Address, AddressType } from "./address-types";

const ADDRESS_TYPES: { value: AddressType; label: string }[] = [
  { value: "BOTH", label: "Billing & Shipping" },
  { value: "SHIPPING", label: "Shipping only" },
  { value: "BILLING", label: "Billing only" },
];

const FILTERS = ["All", "Default", "Shipping", "Billing"] as const;
type Filter = (typeof FILTERS)[number];
function matchesFilter(address: Address, filter: Filter) {
  if (filter === "All") return true;
  if (filter === "Default") return address.isDefault;
  if (filter === "Shipping") return address.addressType === "SHIPPING" || address.addressType === "BOTH";
  return address.addressType === "BILLING" || address.addressType === "BOTH";
}

type Form = {
  label: string; fullName: string; companyName: string; line1: string; line2: string;
  city: string; county: string; postcode: string; country: string; phone: string;
  addressType: AddressType; isDefault: boolean;
};

function emptyForm(): Form {
  return { label: "", fullName: "", companyName: "", line1: "", line2: "", city: "", county: "", postcode: "", country: "GB", phone: "", addressType: "BOTH", isDefault: false };
}

function fromAddress(address: Address): Form {
  return { label: address.label ?? "", fullName: address.fullName, companyName: address.companyName ?? "", line1: address.line1, line2: address.line2 ?? "", city: address.city, county: address.county ?? "", postcode: address.postcode, country: address.country, phone: address.phone ?? "", addressType: address.addressType, isDefault: address.isDefault };
}

function validate(form: Form): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!form.fullName.trim()) errors.fullName = "Please enter a full name.";
  if (!form.line1.trim()) errors.line1 = "Please enter the address line.";
  if (!form.city.trim()) errors.city = "Please enter a city.";
  if (!form.postcode.trim()) errors.postcode = "Please enter a postcode.";
  return errors;
}

const TYPE_LABEL: Record<AddressType, string> = { BOTH: "Billing & Shipping", SHIPPING: "Shipping", BILLING: "Billing" };

export function AccountAddresses() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("All");
  const [editingId, setEditingId] = useState<number | "new" | null>(null);
  const [form, setForm] = useState<Form>(emptyForm());
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  async function load() {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/customer-session/addresses", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setAddresses(data.items ?? []);
    } catch (err) { setError(err instanceof Error ? err.message : "Could not load your addresses."); }
    finally { setLoading(false); }
  }
  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, []);

  const defaultAddress = useMemo(() => addresses.find((a) => a.isDefault), [addresses]);
  const shippingReady = useMemo(() => addresses.filter((a) => a.addressType === "SHIPPING" || a.addressType === "BOTH").length, [addresses]);
  const visible = useMemo(() => addresses.filter((a) => matchesFilter(a, filter) && [a.label, a.fullName, a.city, a.postcode].join(" ").toLowerCase().includes(query.trim().toLowerCase())), [addresses, filter, query]);

  function startEdit(address?: Address) {
    setSaveError(""); setFieldErrors({});
    setEditingId(address ? address.id : "new");
    setForm(address ? fromAddress(address) : emptyForm());
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    const errors = validate(form);
    if (Object.keys(errors).length) { setFieldErrors(errors); return; }
    setFieldErrors({}); setSaveError(""); setSaving(true);
    const payload = { ...form, label: form.label.trim() || undefined, companyName: form.companyName.trim() || undefined, line2: form.line2.trim() || undefined, county: form.county.trim() || undefined, phone: form.phone.trim() || undefined };
    const isNew = editingId === "new";
    try {
      const res = await fetch(isNew ? "/api/customer-session/addresses" : `/api/customer-session/addresses/${editingId}`, { method: isNew ? "POST" : "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setNotice(isNew ? "Address added." : "Address updated.");
      setEditingId(null);
      await load();
    } catch (err) { setSaveError(err instanceof Error ? err.message : "Could not save this address."); }
    finally { setSaving(false); }
  }

  async function remove(id: number) {
    setBusyId(id); setError(""); setNotice("");
    try {
      const res = await fetch(`/api/customer-session/addresses/${id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) { const data = await res.json().catch(() => ({})); throw new Error(data.message); }
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      setNotice("Address removed.");
    } catch (err) { setError(err instanceof Error ? err.message : "Could not remove this address."); }
    finally { setBusyId(null); }
  }

  async function makeDefault(id: number) {
    setBusyId(id); setError("");
    try {
      const res = await fetch(`/api/customer-session/addresses/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isDefault: true }) });
      if (!res.ok) throw new Error();
      await load();
    } catch { setError("Could not set this as your default address."); }
    finally { setBusyId(null); }
  }

  return (
    <div className={styles.layout} id="account-panel">
      <div className={styles.main}>
        <section className={styles.hero}>
          <div><span className={styles.eyebrow}>Jobsite address book</span><h2>Jobsite Addresses</h2><p>Save delivery addresses so checkout remembers your sites.</p></div>
          {editingId === null && <button className={styles.primary} onClick={() => startEdit()}><Plus />Add address</button>}
        </section>

        <div className={styles.metrics}>
          <section className={styles.metric}><h3>Saved addresses</h3><strong>{loading ? "—" : addresses.length}</strong><p>{addresses.length === 1 ? "Address" : "Addresses"} on file</p></section>
          <section className={styles.metric}><h3>Default address</h3><strong>{loading ? "—" : defaultAddress ? (defaultAddress.label || defaultAddress.city) : "Not set"}</strong><p>{defaultAddress ? "Used first at checkout" : "Set one to speed up checkout"}</p></section>
          <section className={styles.metric}><h3>Delivery-ready</h3><strong>{loading ? "—" : shippingReady}</strong><p>of {addresses.length} accept deliveries</p></section>
        </div>

        {(addresses.length > 0 || query || filter !== "All") && <section className={styles.toolbar}>
          <label className={styles.search}><Search /><input aria-label="Search addresses" placeholder="Filter by label, name, city or postcode…" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
          <div className={styles.filters}>{FILTERS.map((name) => <button key={name} aria-pressed={filter === name} onClick={() => setFilter(name)}>{name} <span>({addresses.filter((a) => matchesFilter(a, name)).length})</span></button>)}</div>
        </section>}

        {notice && <div className={styles.message} role="status">{notice}</div>}
        {error && <div className={styles.message} role="alert">{error}</div>}

        {editingId !== null && (
          <form className={styles.form} noValidate onSubmit={save} onChange={(event) => { const name = (event.target as unknown as HTMLInputElement).name; if (name && fieldErrors[name]) setFieldErrors((prev) => { const next = { ...prev }; delete next[name]; return next; }); }}>
            <header><h3>{editingId === "new" ? "Add a new address" : "Edit address"}</h3><button type="button" aria-label="Cancel" onClick={() => setEditingId(null)}><X /></button></header>
            <div className={styles.grid}>
              <label>Label (e.g. Main Site)<input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} maxLength={60} /></label>
              <label>Address type<select value={form.addressType} onChange={(e) => setForm({ ...form, addressType: e.target.value as AddressType })}>{ADDRESS_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}</select></label>
              <label>Full name <b>*</b><input name="fullName" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} maxLength={160} aria-invalid={!!fieldErrors.fullName} />{fieldErrors.fullName && <small role="alert">{fieldErrors.fullName}</small>}</label>
              <label>Company (optional)<input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} maxLength={160} /></label>
              <label className={styles.span2}>Address line 1 <b>*</b><input name="line1" value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} maxLength={200} aria-invalid={!!fieldErrors.line1} />{fieldErrors.line1 && <small role="alert">{fieldErrors.line1}</small>}</label>
              <label className={styles.span2}>Address line 2 (optional)<input value={form.line2} onChange={(e) => setForm({ ...form, line2: e.target.value })} maxLength={200} /></label>
              <label>City <b>*</b><input name="city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} maxLength={120} aria-invalid={!!fieldErrors.city} />{fieldErrors.city && <small role="alert">{fieldErrors.city}</small>}</label>
              <label>County (optional)<input value={form.county} onChange={(e) => setForm({ ...form, county: e.target.value })} maxLength={120} /></label>
              <label>Postcode <b>*</b><input name="postcode" value={form.postcode} onChange={(e) => setForm({ ...form, postcode: e.target.value })} maxLength={20} aria-invalid={!!fieldErrors.postcode} />{fieldErrors.postcode && <small role="alert">{fieldErrors.postcode}</small>}</label>
              <label>Phone (optional)<input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} maxLength={30} /></label>
            </div>
            <label className={styles.checkbox}><input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} />Set as my default address</label>
            {saveError && <p role="alert" className={styles.error}>{saveError}</p>}
            <div className={styles.formActions}><button type="button" onClick={() => setEditingId(null)}>Cancel</button><button className={styles.primary} type="submit" disabled={saving}>{saving ? "Saving…" : "Save address"}</button></div>
          </form>
        )}

        {loading && <div className={styles.empty} role="status">Loading your addresses…</div>}
        {!loading && !addresses.length && editingId === null && <div className={styles.empty}><MapPin /><h3>No saved addresses yet</h3><p>Add a jobsite or delivery address to speed up checkout next time.</p><button className={styles.primary} onClick={() => startEdit()}><Plus />Add your first address</button></div>}
        {!loading && !!addresses.length && !visible.length && <div className={styles.empty}><Search /><h3>No matching addresses</h3><p>Try another search or filter.</p><button onClick={() => { setQuery(""); setFilter("All"); }}>Clear filters</button></div>}

        {!!visible.length && (
          <div className={styles.list}>
            {visible.map((address) => (
              <article key={address.id} className={styles.card}>
                <header>
                  <div><MapPin /><strong>{address.label || "Address"}</strong><span className={styles.type}>{TYPE_LABEL[address.addressType]}</span>{address.isDefault && <span className={styles.default}>Default</span>}</div>
                  <div className={styles.cardActions}>
                    <button aria-label={`Edit ${address.label || "address"}`} onClick={() => startEdit(address)}><Pencil /></button>
                    <button aria-label={`Delete ${address.label || "address"}`} disabled={busyId === address.id} onClick={() => remove(address.id)}><Trash2 /></button>
                  </div>
                </header>
                <div className={styles.cardBody}>
                  <p>{address.fullName}{address.companyName ? ` · ${address.companyName}` : ""}<br />{address.line1}{address.line2 ? `, ${address.line2}` : ""}<br />{address.city}{address.county ? `, ${address.county}` : ""} {address.postcode}<br />{address.country}</p>
                  {address.phone && <span className={styles.phone}><Phone />{address.phone}</span>}
                </div>
                {!address.isDefault && <footer><button className={styles.makeDefault} disabled={busyId === address.id} onClick={() => makeDefault(address.id)}><Star />Set as default</button></footer>}
              </article>
            ))}
          </div>
        )}
      </div>

      <aside className={styles.sidebar} aria-label="Jobsite delivery support">
        <section className={styles.support}>
          <div className={styles.supportHeading}><span><Wrench /></span><div><small>Jobsite support</small><h2>Keep your job moving</h2></div></div>
          <p>Need help with a delivery or an item for your next job? Visit our help desk for support.</p>
          <div className={styles.supportContact}><div><small>Customer support</small><strong>Order &amp; delivery help</strong></div><Link href="/help"><Headset />Help Desk</Link></div>
        </section>
      </aside>
    </div>
  );
}
