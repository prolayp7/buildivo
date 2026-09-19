"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertCircle, ArrowRight, BadgeCheck, Eye, EyeOff, Flame, Gift, Heart, LockKeyhole, Mail, ShieldCheck, Truck, Undo2, Wrench } from "lucide-react";
import { request } from "@/lib/storefront-client";
import type { Product } from "@/types";
import { ProductImage } from "@/components/commerce/product-image";
import { formatPrice } from "@/lib/format";
import { useCartStore } from "@/lib/cart-store";
import { OtpBoxes } from "./otp-boxes";
import styles from "./registration.module.css";

const STRENGTH_LEVELS = [
  { label: "Weak", color: "#b72a3c" },
  { label: "Weak", color: "#b72a3c" },
  { label: "Fair", color: "#ff7900" },
  { label: "Good", color: "#d0a300" },
  { label: "Strong", color: "#00a477" },
];

function passwordStrength(password: string) {
  let score = 0;
  if (password.length >= 10) score++;
  if (password.length >= 14) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score++;
  return { score, ...STRENGTH_LEVELS[score] };
}

function validate(data: FormData): Record<string, string> {
  const errors: Record<string, string> = {};
  const firstName = String(data.get("firstName") || "").trim();
  const lastName = String(data.get("lastName") || "").trim();
  const email = String(data.get("email") || "").trim();
  const phone = String(data.get("phone") || "").trim();
  const password = String(data.get("password") || "");

  if (!firstName) errors.firstName = "Please enter your first name.";
  if (!lastName) errors.lastName = "Please enter your last name.";
  if (!email) errors.email = "Please enter your email address.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Please enter a valid email address.";
  if (phone && !/^[+\d][\d\s-]{6,19}$/.test(phone)) errors.phone = "Please enter a valid phone number.";
  if (!password) errors.password = "Please create a password.";
  else if (password.length < 10) errors.password = "Password must be at least 10 characters.";
  if (!data.get("agree")) errors.agree = "Please confirm to create an account.";
  return errors;
}

export function Registration({ products }: { products: Product[] }) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"form" | "verify">("form");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [otpCode, setOtpCode] = useState("");
  const [verifyBusy, setVerifyBusy] = useState(false);
  const [verifyError, setVerifyError] = useState("");
  const [verifyFieldError, setVerifyFieldError] = useState("");
  const [resendBusy, setResendBusy] = useState(false);
  const [resendNotice, setResendNotice] = useState("");
  const [filter, setFilter] = useState("Featured Kits");
  const strength = password ? passwordStrength(password) : null;
  const wishlist = useCartStore((s) => s.wishlist);
  const toggleWishlist = useCartStore((s) => s.toggleWishlist);
  const shown = products.filter((p) => filter === "Featured Kits" || (filter === "Combi Drills" ? /combi/i.test(p.name) : filter === "Twin Packs" ? /twin|2.pack|2.piece/i.test(p.name) : /18v/i.test(p.name)));
  return <div className={styles.page}><div className="border-b border-border-default bg-surface-white"><div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-2 px-4 py-3 text-label-sm font-label-sm text-text-secondary sm:px-margin-desktop"><nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1"><Link href="/" className="flex items-center hover:underline"><span aria-hidden className="material-symbols-outlined text-[16px]">home</span><span className="sr-only">Home</span></Link><span aria-hidden>/</span><span className="font-semibold text-text-primary">Create Account</span></nav></div></div>
    <div className={styles.layout}><div><section className={styles.formCard} aria-labelledby="register-heading">
      <div className={styles.topline}><span><Gift size={12} />NEW ACCOUNT INCENTIVE</span><small>{step === "verify" ? "Step 2 of 2: Verify your email" : "Step 1 of 2: Setup Credentials"}</small></div>
      <h1 id="register-heading">Power Your Jobsite &amp; Home.<br /><em>Claim 15% Off</em> First Order.</h1><p className={styles.intro}>Join 45,000+ UK contractors, mechanical teams, and master builders. Get commercial net-30 terms, direct trade discounts, and live delivery dispatch tracking.</p>
      {step === "verify" ? <div className={styles.success} role="status">
        <BadgeCheck size={32} />
        <h2>Check your email</h2>
        <p>We&rsquo;ve sent a 6-digit code to <strong>{email}</strong>. Enter it below to activate your account and sign in.</p>
        <form className={styles.form} noValidate  onSubmit={async (event) => {event.preventDefault(); if (verifyBusy) return; const code = otpCode.trim(); if (!code) { setVerifyFieldError("Please enter the 6-digit code."); return; } if (!/^\d{6}$/.test(code)) { setVerifyFieldError("Enter the 6-digit code exactly as emailed to you."); return; } setVerifyFieldError(""); setVerifyError(""); setVerifyBusy(true); try { const res = await fetch("/api/customer-session/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, code }) }); const result = await res.json(); if (!res.ok) throw new Error(result.message); toast.success("Account verified — you're signed in"); router.replace("/account"); router.refresh(); } catch (err) { setVerifyError(err instanceof Error ? err.message : "That code is invalid or has expired."); } finally { setVerifyBusy(false); }}}>
          <div><span>Verification code <b>*</b></span><OtpBoxes value={otpCode} onChange={(next) => { setOtpCode(next); if (verifyFieldError) setVerifyFieldError(""); }} disabled={verifyBusy} invalid={!!verifyFieldError} /></div>
          {verifyFieldError && <small role="alert" className={styles.fieldError}>{verifyFieldError}</small>}
          {verifyError && <p role="alert" className={styles.error}><AlertCircle size={16} /><span>{verifyError}</span></p>}
          <button className={styles.submit} disabled={verifyBusy} type="submit">{verifyBusy ? "Verifying…" : "Verify & Activate Account"}<ArrowRight size={16} /></button>
        </form>
        <button type="button" disabled={resendBusy} onClick={async () => {setResendBusy(true); setResendNotice(""); setVerifyError(""); try { await request("auth/otp/send", { method: "POST", body: JSON.stringify({ email, purpose: "email_verification" }) }); setResendNotice("A new code has been sent."); setOtpCode(""); } catch (err) { setVerifyError(err instanceof Error ? err.message : "Could not resend the code."); } finally { setResendBusy(false); }}} className="mt-4 text-xs font-semibold text-orange-600 disabled:opacity-50">{resendBusy ? "Sending…" : "Resend code"}</button>
        {resendNotice && <p role="status" className={styles.notice}>{resendNotice}</p>}
      </div> : <>
      <div className={styles.notice}><ShieldCheck size={18} /><p><strong>Create your account today.</strong>Save your favourite tools and keep your details ready for your next order.</p></div>
      <form className={styles.form} noValidate onChange={(event) => {const name = (event.target as unknown as HTMLInputElement).name; if (name && fieldErrors[name]) setFieldErrors((prev) => {const next = {...prev}; delete next[name]; return next;});}} onSubmit={async (event) => {event.preventDefault(); if(busy)return; const data = new FormData(event.currentTarget); const errors = validate(data); if (Object.keys(errors).length) {setFieldErrors(errors); return;} setFieldErrors({});setError("");setBusy(true);try { await request("auth/register", { method: "POST", body: JSON.stringify({ firstName: String(data.get("firstName")).trim(), lastName: String(data.get("lastName")).trim(), email: email.trim(), password: data.get("password"), phone: String(data.get("phone") || "").trim() || undefined }) });setStep("verify");}catch(err){setError(err instanceof Error ? err.message : "Registration failed. Please try again.");}finally{setBusy(false);}}}>
        <div className={styles.twoColumns}><label>First Name <b>*</b><input name="firstName" autoComplete="given-name" placeholder="e.g. David" maxLength={120} aria-invalid={!!fieldErrors.firstName} />{fieldErrors.firstName && <small role="alert" className={styles.fieldError}>{fieldErrors.firstName}</small>}</label><label>Last Name <b>*</b><input name="lastName" autoComplete="family-name" placeholder="e.g. Sterling" maxLength={120} aria-invalid={!!fieldErrors.lastName} />{fieldErrors.lastName && <small role="alert" className={styles.fieldError}>{fieldErrors.lastName}</small>}</label></div>
        <label>Work / Business Email <b>*</b><div className={styles.inputIcon}><Mail size={15} /><input name="email" type="email" autoComplete="email" placeholder="d.sterling@apexmechanical.co.uk" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} aria-invalid={!!fieldErrors.email} /></div>{fieldErrors.email && <small role="alert" className={styles.fieldError}>{fieldErrors.email}</small>}</label>
        <label>Jobsite Dispatch Mobile<div className={styles.inputIcon}><input name="phone" type="tel" autoComplete="tel" placeholder="+44 7700 900077" maxLength={30} aria-invalid={!!fieldErrors.phone} /></div>{fieldErrors.phone && <small role="alert" className={styles.fieldError}>{fieldErrors.phone}</small>}</label>
        <label>Create Password <b>*</b><small className={styles.passwordHint}>At least 10 characters</small><div className={styles.inputIcon}><LockKeyhole size={15} /><input name="password" type={visible ? "text" : "password"} autoComplete="new-password" maxLength={128} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimum 10 characters" aria-invalid={!!fieldErrors.password} /><button type="button" onClick={() => setVisible(!visible)} aria-label={visible ? "Hide password" : "Show password"}>{visible ? <EyeOff size={16} /> : <Eye size={16} />}</button></div>
        {strength && <div className={styles.strength}><div className={styles.strengthBars}>{[0, 1, 2, 3].map((i) => <span key={i} style={i < strength.score ? {background: strength.color} : undefined} />)}</div><small style={{color: strength.color}}>{strength.label}</small></div>}
        {fieldErrors.password && <small role="alert" className={styles.fieldError}>{fieldErrors.password}</small>}</label>
        <div className={styles.offer}><Gift size={23} /><div><strong>BLV-WELCOME15</strong><p>Welcome offer subject to eligibility and checkout validation.</p></div><b>−15%</b></div>
        <label className={styles.check}><input type="checkbox" name="agree" aria-invalid={!!fieldErrors.agree} />I confirm these details are correct and want to create a Buildivo account.</label>
        {fieldErrors.agree && <small role="alert" className={styles.fieldError}>{fieldErrors.agree}</small>}
        {error && <p role="alert" className={styles.error}><AlertCircle size={16} /><span>{error}</span></p>}<button className={styles.submit} disabled={busy} type="submit">{busy ? "Creating your account…" : "Create Free Account"}<ArrowRight size={16} /></button>
      </form><p className="mt-5 text-center text-xs text-text-secondary">Already have an account? <Link href="/login" className="font-semibold text-orange-600">Sign in here</Link></p><div className={styles.social}><span>OR RAPID REGISTER WITH</span><div><button disabled>Google Workspace</button><button disabled>Apple ID</button></div><small>Social registration is not available yet.</small></div></>}
    </section><div className={styles.trust}>{[[LockKeyhole,"256-Bit SSL","Bank-grade vault"],[BadgeCheck,"ISO 9001:2015","Quality certified"],[ShieldCheck,"Cyber Essentials","UK secured"],[Undo2,"30-Day Returns","Jobsite collection"]].map(([Icon,title,caption]) => {const Symbol=Icon as typeof LockKeyhole;return <div key={String(title)}><Symbol size={16}/><span><strong>{String(title)}</strong><small>{String(caption)}</small></span></div>;})}</div></div>
    <aside className={styles.sidebar} aria-label="Trending jobsite essentials"><header><Flame size={22}/><div><h2>Trending Jobsite Essentials</h2><p>Explore popular tools and jobsite essentials for your first order</p><small>Live Dispatch: Ready</small></div></header><div className={styles.filters}>{["Featured Kits","Combi Drills","Twin Packs","Heavy Duty 18V"].map((name)=><button key={name} aria-pressed={filter===name} onClick={()=>setFilter(name)}>{name}</button>)}</div>
      {shown.map((p)=><article className={styles.product} key={p.id}><Link href={`/p/${p.slug}`} className={styles.productImage}><ProductImage src={p.image} categorySlug={p.categorySlug} className={styles.image}/><span>SKU: {p.sku}</span></Link><div><button className={styles.wishlist} aria-label={`Save ${p.name}`} aria-pressed={wishlist.includes(p.id)} onClick={()=>toggleWishlist(p.id)}><Heart size={14} fill={wishlist.includes(p.id)?"currentColor":"none"}/></button><small className={styles.rating}>★★★★★ <span>{p.rating.toFixed(1)} ({p.reviewCount} reviews)</span></small><h3><Link href={`/p/${p.slug}`}>{p.name}</Link></h3><p>{p.specs.slice(0,3).map(s=>s.value).join(" · ")}</p><strong className={styles.price}>{formatPrice(p.priceIncVat)}</strong>{p.compareAtIncVat && <s>{formatPrice(p.compareAtIncVat)}</s>}<small className={styles.stock}>{p.stockCount !== undefined ? `${p.stockCount} in stock` : p.deliveryEta}</small></div></article>)}
      {!shown.length && <p className={styles.empty}>No products in this selection. Try Featured Kits.</p>}
      <div className={styles.sidebarTrust}><span><BadgeCheck/>100% Genuine OEM Warranties</span><span><Truck/>Free Next-Day Delivery £75</span><span><Undo2/>30-Day Hassle-Free Returns</span><span><Wrench/>Dedicated trade support</span></div>
    </aside></div></div>;
}
