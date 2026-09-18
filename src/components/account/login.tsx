"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, BadgeCheck, Building2, Eye, EyeOff, Flame, Headphones, LockKeyhole, ShieldCheck, ShoppingCart, Truck, Undo2 } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/types";
import { request } from "@/lib/storefront-client";
import { useCartStore } from "@/lib/cart-store";
import { ProductImage } from "@/components/commerce/product-image";
import { formatPrice } from "@/lib/format";
import styles from "./login.module.css";

type Recovery = "none" | "email" | "code";

function validate(recovery: Recovery, data: FormData): Record<string, string> {
  const errors: Record<string, string> = {};
  const email = String(data.get("email") || "").trim();
  if (!email) errors.email = "Please enter your email address.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Please enter a valid email address.";
  if (recovery === "code") {
    const code = String(data.get("code") || "").trim();
    if (!code) errors.code = "Please enter the 6-digit code.";
    else if (!/^\d{6}$/.test(code)) errors.code = "Enter the 6-digit code exactly as emailed to you.";
  }
  if (recovery !== "email") {
    const password = String(data.get("password") || "");
    if (!password) errors.password = recovery === "code" ? "Please create a new password." : "Please enter your password.";
    else if (recovery === "code" && password.length < 10) errors.password = "Password must be at least 10 characters.";
  }
  return errors;
}

export function Login({ products }: { products: Product[] }) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [recovery, setRecovery] = useState<Recovery>("none");
  const [notice, setNotice] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  return <div className={styles.page}><div className="border-b border-border-default bg-surface-white"><div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-2 px-4 py-3 text-label-sm font-label-sm text-text-secondary sm:px-margin-desktop"><nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1"><Link href="/" className="flex items-center hover:underline"><span aria-hidden className="material-symbols-outlined text-[16px]">home</span><span className="sr-only">Home</span></Link><span aria-hidden>/</span><span className="font-semibold text-text-primary">Sign In</span></nav></div></div><div className={styles.layout}>
    <div><section className={styles.panel} aria-labelledby="login-heading"><span className={styles.portal}><LockKeyhole size={12}/>SECURE CONTRACTOR &amp; RETAIL PORTAL</span><h1 id="login-heading">Welcome Back.<br/><em>Access Trade Terms &amp; Fast Reorder.</em></h1><p className={styles.intro}>Sign in to unlock personalized fleet pricing, cached jobsite delivery manifests, instant Net-30 credit release, and live satellite dispatch tracking.</p>
      <form className={styles.form} noValidate onChange={(event) => {const name = (event.target as unknown as HTMLInputElement).name; if (name && fieldErrors[name]) setFieldErrors((prev) => {const next = {...prev}; delete next[name]; return next;});}} onSubmit={async(e)=>{e.preventDefault();if(busy)return;const data=new FormData(e.currentTarget);const errors=validate(recovery,data);if(Object.keys(errors).length){setFieldErrors(errors);return;}setFieldErrors({});setError("");setNotice("");setBusy(true);try{if(recovery==="email"){await request("auth/otp/send",{method:"POST",body:JSON.stringify({email:email.trim(),purpose:"password_reset"})});setRecovery("code");setNotice("If this email has an account, a reset code has been sent.");}else if(recovery==="code"){await request("auth/password/reset",{method:"POST",body:JSON.stringify({email:email.trim(),code:data.get("code"),newPassword:data.get("password")})});setRecovery("none");setNotice("Password updated. Sign in with your new password.");}else{const res=await fetch("/api/customer-session",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:email.trim(),password:data.get("password"),remember:data.get("remember")==="on"})});const result=await res.json();if(!res.ok)throw Error(result.message);toast.success("Signed in successfully");router.replace("/account");router.refresh();}}catch(err){setError(err instanceof Error?err.message:"Please try again.");}finally{setBusy(false);}}}>
        <label>Commercial or Trade Email <b>*</b><div className={styles.input}><Building2 size={15}/><input name="email" type="email" autoComplete="email" maxLength={255} placeholder="d.sterling@apexmechanical.co.uk" value={email} onChange={e=>setEmail(e.target.value)} aria-invalid={!!fieldErrors.email}/></div>{fieldErrors.email && <small role="alert" className={styles.fieldError}>{fieldErrors.email}</small>}</label>
        {recovery==="code" && <label>Email verification code<input name="code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="6-digit reset code" aria-invalid={!!fieldErrors.code}/>{fieldErrors.code && <small role="alert" className={styles.fieldError}>{fieldErrors.code}</small>}</label>}
        {recovery!=="email" && <label>{recovery==="code"?"New Password":"Master Passcode"} <b>*</b>{recovery==="none" && <button type="button" className={styles.forgot} onClick={()=>{setRecovery("email");setError("");setNotice("");setFieldErrors({});}}>Forgot code?</button>}<div className={styles.input}><LockKeyhole size={15}/><input key={recovery} name="password" type={visible?"text":"password"} autoComplete={recovery==="code"?"new-password":"current-password"} maxLength={128} placeholder={recovery==="code"?"At least 10 characters":"Enter your password"} aria-invalid={!!fieldErrors.password}/><button type="button" aria-label={visible?"Hide password":"Show password"} onClick={()=>setVisible(!visible)}>{visible?<EyeOff size={16}/>:<Eye size={16}/>}</button></div>{fieldErrors.password && <small role="alert" className={styles.fieldError}>{fieldErrors.password}</small>}</label>}
        {recovery==="none" && <><label className={styles.remember}><input type="checkbox" name="remember" defaultChecked/>Remember this jobsite terminal for 30 days</label><div className={styles.security}><ShieldCheck size={16}/><p><strong>Secure account access</strong>Your sign-in session is protected with secure, HTTP-only cookies. Trade facilities remain subject to account approval.</p></div></>}
        {error && <p role="alert" className={styles.error}><AlertCircle size={16} /><span>{error}</span></p>}{notice && <p role="status" className={styles.notice}>{notice}</p>}
        <button type="submit" className={styles.submit} disabled={busy}>{busy?"Please wait…":recovery==="email"?"Send Email Reset Code":recovery==="code"?"Reset Password":"Sign In to Buildivo Account"} →</button>
        {recovery!=="none" && <button type="button" className={styles.back} onClick={()=>{setRecovery("none");setError("");setNotice("");setFieldErrors({});}}>Back to sign in</button>}
      </form><div className={styles.otp}><LockKeyhole size={17}/><div><strong>Jobsite OTP / Temporary Token?</strong><p>SMS sign-in is not available yet.</p></div><button disabled>Send SMS Code</button></div><div className={styles.register}>Don’t have a Buildivo account yet?<Link href="/register">Open Commercial Account &amp; Claim 15% Off First Pallet ↗</Link></div>
    </section><div className={styles.trust}>{[{Icon:LockKeyhole,title:"256-Bit Vault",caption:"Bank-grade data"},{Icon:BadgeCheck,title:"ISO 9001:2015",caption:"Certified Depot"},{Icon:ShieldCheck,title:"Cyber Essentials",caption:"UK Gov Audited"},{Icon:Undo2,title:"30-Day Returns",caption:"Free Site Pickup"}].map(({Icon,title,caption})=><div key={title}><Icon size={18}/><strong>{title}</strong><span>{caption}</span></div>)}</div></div>
    <aside className={styles.showcase} aria-label="Member showcase"><header><h2><Flame size={22}/>Member Perks &amp; Express Reorder</h2><p>Instantly replenish consumable kits or fleet machinery with contractual discount locks.</p><div><span>Frequently Reordered ({products.length})</span><span>Saved Project Gear</span><span>Jobsite Bundles</span><span>Trade Exclusives</span></div></header><div className={styles.products}>{products.map(p=><ReorderCard key={p.id} product={p}/>)}</div><div className={styles.memberNote}><BadgeCheck size={30}/><div><h3>Ready for your next jobsite</h3><p>Keep your crew equipped with professional tools, live stock availability, and fast access to your next order.</p><Link href="/deals">Explore current trade deals →</Link></div></div><div className={styles.service}><span><ShieldCheck/>100% Genuine OEM Warranties Registered Automatically</span><span><Truck/>Free Next-Day Direct-to-Site on Orders &gt; £75</span><span><Headphones/>Priority Pro Desk Support</span></div></aside>
  </div></div>;
}
function ReorderCard({product:p}:{product:Product}){const addItem=useCartStore(s=>s.addItem);const[busy,setBusy]=useState(false);return <article className={styles.product}><div className={styles.productTop}><Link href={`/p/${p.slug}`} aria-label={p.name}><ProductImage src={p.image} categorySlug={p.categorySlug} className={styles.image}/></Link><div><small>{p.sku}</small><h3><Link href={`/p/${p.slug}`}>{p.name}</Link></h3><p><span>★</span> {p.rating.toFixed(1)} ({p.reviewCount} jobsite logs)</p></div></div><dl>{p.specs.slice(0,3).map(s=><div key={s.label}><dt>{s.label}</dt><dd>{s.value}</dd></div>)}</dl><div className={styles.stockRow}>{p.compareAtIncVat && <s>{formatPrice(p.compareAtIncVat)}</s>}<small>{p.stockCount ?? "Available"} in Hub</small></div><div className={styles.price}><strong>{formatPrice(p.priceIncVat)}</strong><small>ex. VAT: {formatPrice(p.priceIncVat/(1+p.vatRate))}</small></div><button disabled={busy||!p.defaultVariantId||p.stock==="out-of-stock"} onClick={async()=>{if(!p.defaultVariantId)return;setBusy(true);try{await addItem(p.defaultVariantId,1);toast.success(`Added ${p.name} to cart`);}catch{toast.error("Could not add this product. Try again.");}finally{setBusy(false);}}}><ShoppingCart size={14}/>{busy?"Adding…":"1-Click Reorder"}</button></article>;}
