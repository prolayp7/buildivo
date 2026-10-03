"use client";

import { useEffect, useState, type FormEvent } from "react";
import { AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";
import styles from "./account-details.module.css";

type Customer = { firstName: string; lastName: string; email: string; phone?: string | null };

async function send(url: string, method: string, body: unknown): Promise<void> {
  const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || "Something went wrong. Please try again.");
}

export function AccountDetails({ customer, onUpdated }: { customer: Customer; onUpdated: (next: Partial<Customer>) => void }) {
  const [profile, setProfile] = useState({ firstName: customer.firstName, lastName: customer.lastName, phone: customer.phone ?? "" });
  const [profileBusy, setProfileBusy] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [pwBusy, setPwBusy] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [deletion, setDeletion] = useState<{ requestedAt: string } | null>(null);
  const [deletionLoading, setDeletionLoading] = useState(true);
  const [deletionBusy, setDeletionBusy] = useState(false);
  const [deletionConfirm, setDeletionConfirm] = useState(false);
  const [deletionMsg, setDeletionMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/customer-session/deletion-request", { signal: controller.signal, cache: "no-store" })
      .then(async (res) => {
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.message);
        setDeletion(body.request ?? null);
      })
      .catch((error) => { if (!controller.signal.aborted) setDeletionMsg({ ok: false, text: error instanceof Error && error.message ? error.message : "Deletion request status could not be loaded." }); })
      .finally(() => { if (!controller.signal.aborted) setDeletionLoading(false); });
    return () => controller.abort();
  }, []);

  async function requestDeletion() {
    if (deletionBusy) return;
    setDeletionBusy(true); setDeletionMsg(null);
    try {
      const res = await fetch("/api/customer-session/deletion-request", { method: "POST" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message || "Your deletion request could not be submitted. Please try again.");
      setDeletion(body.request);
      setDeletionConfirm(false);
      setDeletionMsg({ ok: body.emailSent !== false, text: body.emailSent === false
        ? "Your request is recorded, but we couldn’t send the acknowledgment email. Please contact support."
        : body.alreadyRequested ? "You already have a deletion request under review." : "Your request has been received. We sent an acknowledgment email." });
    } catch (error) { setDeletionMsg({ ok: false, text: error instanceof Error ? error.message : "Your deletion request could not be submitted." }); }
    finally { setDeletionBusy(false); }
  }

  async function saveProfile(event: FormEvent) {
    event.preventDefault();
    if (profileBusy) return;
    if (!profile.firstName.trim() || !profile.lastName.trim()) { setProfileMsg({ ok: false, text: "First and last name are required." }); return; }
    setProfileBusy(true); setProfileMsg(null);
    try {
      const patch = { firstName: profile.firstName.trim(), lastName: profile.lastName.trim(), phone: profile.phone.trim() || undefined };
      await send("/api/customer-session/profile", "PATCH", patch);
      onUpdated({ firstName: patch.firstName, lastName: patch.lastName, phone: patch.phone ?? null });
      setProfileMsg({ ok: true, text: "Your details have been updated." });
    } catch (error) { setProfileMsg({ ok: false, text: error instanceof Error ? error.message : "Could not update your details." }); }
    finally { setProfileBusy(false); }
  }

  async function changePassword(event: FormEvent) {
    event.preventDefault();
    if (pwBusy) return;
    if (pw.next.length < 10) { setPwMsg({ ok: false, text: "Your new password must be at least 10 characters." }); return; }
    if (pw.next !== pw.confirm) { setPwMsg({ ok: false, text: "The new passwords don't match." }); return; }
    setPwBusy(true); setPwMsg(null);
    try {
      await send("/api/customer-session/password", "POST", { currentPassword: pw.current, newPassword: pw.next });
      setPw({ current: "", next: "", confirm: "" });
      setPwMsg({ ok: true, text: "Your password has been changed." });
    } catch (error) { setPwMsg({ ok: false, text: error instanceof Error ? error.message : "Could not change your password." }); }
    finally { setPwBusy(false); }
  }

  const message = (m: { ok: boolean; text: string } | null) => m && <p role={m.ok ? "status" : "alert"} className={m.ok ? styles.ok : styles.bad}>{m.ok ? <CheckCircle2 /> : <AlertCircle />}{m.text}</p>;

  return (
    <div className={styles.layout}>
      <form className={styles.card} onSubmit={saveProfile} noValidate>
        <h2>Personal details</h2>
        <p className={styles.sub}>Keep your name and phone number up to date for deliveries.</p>
        <div className={styles.grid}>
          <label>First name<input value={profile.firstName} maxLength={120} autoComplete="given-name" onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} /></label>
          <label>Last name<input value={profile.lastName} maxLength={120} autoComplete="family-name" onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} /></label>
          <label className={styles.span2}>Email<input value={customer.email} disabled readOnly /></label>
          <label className={styles.span2}>Phone <span>(optional)</span><input type="tel" value={profile.phone} maxLength={30} autoComplete="tel" onChange={(e) => setProfile({ ...profile, phone: e.target.value })} /></label>
        </div>
        {message(profileMsg)}
        <button className={styles.primary} disabled={profileBusy} type="submit">{profileBusy ? "Saving…" : "Save details"}</button>
      </form>

      <form className={styles.card} onSubmit={changePassword} noValidate>
        <h2>Change password</h2>
        <p className={styles.sub}>Use at least 10 characters.</p>
        <div className={styles.grid}>
          <label className={styles.span2}>Current password<input type={showPw ? "text" : "password"} autoComplete="current-password" value={pw.current} maxLength={128} onChange={(e) => setPw({ ...pw, current: e.target.value })} /></label>
          <label>New password<input type={showPw ? "text" : "password"} autoComplete="new-password" value={pw.next} maxLength={128} onChange={(e) => setPw({ ...pw, next: e.target.value })} /></label>
          <label>Confirm new password<input type={showPw ? "text" : "password"} autoComplete="new-password" value={pw.confirm} maxLength={128} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} /></label>
        </div>
        <button type="button" className={styles.toggle} onClick={() => setShowPw((v) => !v)}>{showPw ? <EyeOff /> : <Eye />}{showPw ? "Hide passwords" : "Show passwords"}</button>
        {message(pwMsg)}
        <button className={styles.primary} disabled={pwBusy || !pw.current || !pw.next} type="submit">{pwBusy ? "Updating…" : "Update password"}</button>
      </form>

      <section className={`${styles.card} ${styles.danger}`}>
        <h2>Delete account</h2>
        <p className={styles.sub}>You can request account deletion here. Your account stays active while our team reviews the request.</p>
        {message(deletionMsg)}
        {deletionLoading ? <p role="status">Checking for an existing request…</p> : deletion ? (
          <div className={styles.pending} role="status"><strong>Deletion request under review</strong><span>Received {new Date(deletion.requestedAt).toLocaleDateString("en-GB")}. Your account remains active; we’ll email you when it has been deleted.</span></div>
        ) : deletionConfirm ? (
          <div className={styles.confirm}>
            <p>This sends a request for our team to review. Your account will not be deleted immediately.</p>
            <div className={styles.confirmActions}>
              <button type="button" className={styles.secondary} disabled={deletionBusy} onClick={() => setDeletionConfirm(false)}>Keep account</button>
              <button type="button" className={styles.primary} disabled={deletionBusy} onClick={() => void requestDeletion()}>{deletionBusy ? "Sending request…" : "Confirm request"}</button>
            </div>
          </div>
        ) : <button type="button" className={styles.requestDelete} onClick={() => { setDeletionConfirm(true); setDeletionMsg(null); }}>Request account deletion</button>}
      </section>
    </div>
  );
}
