"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { syncWishlist } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface StepIdentityProps {
  email: string;
  onContinue: (email: string) => void;
}

function useCountdown(startSeconds: number) {
  const [seconds, setSeconds] = useState(startSeconds);
  useEffect(() => {
    const id = window.setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => window.clearInterval(id);
  }, []);
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

export function StepIdentity({ email, onContinue }: StepIdentityProps) {
  const [guestEmail, setGuestEmail] = useState(email);
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signingIn, setSigningIn] = useState(false);
  const [signInError, setSignInError] = useState("");

  // A real sign-in: the session cookie it sets makes the order belong to this customer's account.
  async function signIn() {
    setSigningIn(true);
    setSignInError("");
    try {
      const response = await fetch("/api/customer-session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: signInEmail.trim(), password: signInPassword, remember: false }) });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.message || "Unable to sign in. Please try again.");
      void syncWishlist();
      onContinue(body.customer?.email ?? signInEmail.trim());
    } catch (error) {
      setSignInError(error instanceof Error ? error.message : "Unable to sign in. Please try again.");
    } finally {
      setSigningIn(false);
    }
  }
  const countdown = useCountdown(28 * 60 + 42);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="mb-1 flex items-center gap-1 text-label-sm font-label-sm font-semibold uppercase tracking-wide text-orange-600">
            <span aria-hidden className="material-symbols-outlined text-[16px]">bolt</span>
            Fast-Track Checkout
          </p>
          <h1 className="text-headline-lg-mobile font-headline-lg-mobile font-bold text-graphite-900 sm:text-headline-lg sm:font-headline-lg">
            How would you like to continue?
          </h1>
          <p className="mt-1 text-body-md font-body-md text-text-secondary">Choose your preferred access tier. Your high-demand items are reserved for you.</p>
        </div>
        <div className="flex shrink-0 items-center gap-2 rounded-lg bg-orange-50 px-3 py-2 text-orange-700">
          <span aria-hidden className="material-symbols-outlined text-[20px]">timer</span>
          <div>
            <p className="text-label-sm font-label-sm font-semibold uppercase tracking-wide">Cart Locked</p>
            <p className="font-mono text-body-md font-bold">{countdown}</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border-default bg-surface-white p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
              <span className="material-symbols-outlined text-[20px]">bolt</span>
            </span>
            <div>
              <h2 className="text-body-lg font-body-lg font-bold text-graphite-900">Quick Checkout as Guest</h2>
              <p className="text-body-sm font-body-sm text-text-secondary">Instant process with no initial password required. Ideal for urgent jobsite procurement.</p>
            </div>
          </div>
          <span className="hidden shrink-0 rounded-full bg-graphite-100 px-2 py-1 text-label-sm font-label-sm font-semibold text-graphite-700 sm:inline">Instant</span>
        </div>

        <Label htmlFor="guest-email" className="mb-1">
          Work or Dispatch Email Address
        </Label>
        <Input id="guest-email" type="email" placeholder="you@example.com" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} autoComplete="email" />
        <p className="mt-2 flex items-start gap-1.5 text-label-sm font-label-sm text-text-secondary">
          <span aria-hidden className="material-symbols-outlined text-[16px]">info</span>
          We will dispatch your order confirmation, courier tracking updates, and a digital VAT receipt directly to this address.
        </p>

        <div className="mt-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <p className="flex items-center gap-1 text-label-sm font-label-sm text-text-secondary">
            <span aria-hidden className="material-symbols-outlined text-[16px] text-success-500">shield</span>
            GDPR Compliant. Zero commercial spam guarantee.
          </p>
          <Button
            className="bg-orange-500 font-label-lg text-label-lg font-bold hover:bg-orange-600"
            disabled={!guestEmail.includes("@")}
            onClick={() => onContinue(guestEmail)}
          >
            Continue as Guest
            <span aria-hidden className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border-default bg-surface-white p-5">
          <div className="mb-3 flex items-center gap-3">
            <span aria-hidden className="flex h-10 w-10 items-center justify-center rounded-lg bg-graphite-900 text-text-inverse">
              <span className="material-symbols-outlined text-[20px]">login</span>
            </span>
            <div>
              <h2 className="text-body-md font-body-md font-bold text-graphite-900">Already Registered?</h2>
              <p className="text-label-sm font-label-sm text-text-secondary">Sign in to Buildivo Pro</p>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div>
              <Label htmlFor="signin-email" className="mb-1">Email</Label>
              <Input id="signin-email" type="email" placeholder="contractor@trade.co.uk" value={signInEmail} onChange={(e) => setSignInEmail(e.target.value)} autoComplete="email" />
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between">
                <Label htmlFor="signin-password">Password</Label>
                <Link href="/login" className="text-label-sm font-label-sm text-orange-600 hover:underline">Forgot?</Link>
              </div>
              <Input id="signin-password" type="password" value={signInPassword} onChange={(e) => setSignInPassword(e.target.value)} autoComplete="current-password" />
            </div>
            <Button
              variant="secondary"
              className="bg-graphite-900 text-text-inverse hover:bg-graphite-800"
              disabled={!signInEmail || !signInPassword || signingIn}
              onClick={signIn}
            >
              <span aria-hidden className="material-symbols-outlined text-[18px]">key</span>
              {signingIn ? "Signing in…" : "Sign In & Continue"}
            </Button>
            {signInError && <p role="alert" className="text-label-sm font-label-sm text-error-500">{signInError}</p>}
          </div>
        </div>

        <div className="rounded-xl border border-border-default bg-surface-white p-5">
          <div className="mb-3 flex items-center gap-3">
            <span aria-hidden className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
              <span className="material-symbols-outlined text-[20px]">person_add</span>
            </span>
            <div>
              <h2 className="text-body-md font-body-md font-bold text-graphite-900">Create an Account</h2>
              <p className="text-label-sm font-label-sm text-text-secondary">For Builders &amp; Trades</p>
            </div>
          </div>
          <ul className="mb-4 flex flex-col gap-2 text-body-sm font-body-sm text-text-secondary">
            {[
              "Instant 1-click reordering by industrial SKU",
              "Live dispatch tracking & SMS delivery windows",
              "Saved project material lists & fleet tool registries",
              "Instant eligibility review for Trade Net 30 terms",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span aria-hidden className="material-symbols-outlined text-[16px] text-success-500">check_circle</span>
                {item}
              </li>
            ))}
          </ul>
          <Button asChild variant="outline" className="w-full">
            <Link href="/register">
              <span aria-hidden className="material-symbols-outlined text-[18px]">app_registration</span>
              Create an Account
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 rounded-xl border border-border-default bg-surface-white p-4 sm:grid-cols-3">
        {[
          { icon: "lock", title: "256-Bit SSL Layer", caption: "Banking-grade transaction vault" },
          { icon: "privacy_tip", title: "Strict Privacy Pledge", caption: "No data sharing or trade marketing lists" },
          { icon: "cached", title: "30-Day Hassle Returns", caption: "Direct contractor restocking credit" },
        ].map((item) => (
          <div key={item.title} className="flex items-center gap-2">
            <span aria-hidden className="material-symbols-outlined text-[18px] text-orange-600">{item.icon}</span>
            <div>
              <p className="text-label-sm font-label-sm font-semibold text-text-primary">{item.title}</p>
              <p className="text-label-sm font-label-sm text-text-secondary">{item.caption}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
