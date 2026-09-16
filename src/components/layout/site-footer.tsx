import Link from "next/link";
import Image from "next/image";
import { SocialLinks } from "@/components/layout/social-links";
import type { FooterColumn } from "@/lib/adapters";

const trustBadges = [
  { icon: "lock", title: "256-Bit Encryption", caption: "Military-grade SSL security" },
  { icon: "verified_user", title: "Norton Secured", caption: "Identity theft protection" },
  { icon: "workspace_premium", title: "ISO 9001 Certified", caption: "Quality management" },
  { icon: "handshake", title: "Buildivo Trade Approved", caption: "Official contractor portal" },
  { icon: "cached", title: "30-Day Guarantee", caption: "Hassle-free return policy" },
];

const paymentMethods = ["VISA", "Mastercard", "AMEX", "PayPal", "Apple Pay", "Trade Net 30"];

const policyLinks = [
  { label: "Privacy Policy", href: "/help" },
  { label: "Terms of Trading", href: "/help" },
  { label: "Returns & Restocking", href: "/help" },
  { label: "Modern Slavery Statement", href: "/help" },
];

export function SiteFooter({ columns }: { columns: FooterColumn[] }) {
  return (
    <footer className="bg-graphite-900 text-text-inverse-muted">
      <div className="mx-auto grid max-w-[1600px] grid-cols-2 gap-4 border-b border-graphite-700 px-4 py-6 sm:grid-cols-3 sm:px-margin-desktop lg:grid-cols-5">
        {trustBadges.map((badge) => (
          <div key={badge.title} className="flex items-center gap-2">
            <span aria-hidden className="material-symbols-outlined text-[20px] text-orange-500">
              {badge.icon}
            </span>
            <div>
              <p className="text-label-sm font-label-sm font-semibold text-text-inverse">{badge.title}</p>
              <p className="text-label-sm font-label-sm">{badge.caption}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mx-auto max-w-[1600px] px-4 py-12 sm:px-margin-desktop">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
          {columns.map((col) => (
            <div key={col.title}>
              <h2 className="mb-3 text-body-sm font-body-sm font-bold text-text-inverse">{col.title}</h2>
              <ul className="flex flex-col gap-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-label-sm font-label-sm transition-colors hover:text-text-inverse">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <h2 className="mb-3 text-body-sm font-body-sm font-bold text-text-inverse">About Buildivo</h2>
            <p className="mb-4 text-label-sm font-label-sm">
              Built for tradespeople, contractors and industrial creators. High-performance tools with guaranteed provenance and fast site dispatch.
            </p>
            <div className="mb-4 flex gap-2">
              <span className="rounded bg-graphite-700 px-2 py-1 text-label-sm font-label-sm text-success-500">ISO 9001:2015</span>
              <span className="rounded bg-graphite-700 px-2 py-1 text-label-sm font-label-sm text-info-500">FSC Certified</span>
            </div>
            <SocialLinks />
          </div>
        </div>
      </div>

      <div className="border-t border-graphite-700">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-margin-desktop">
          <div className="flex flex-wrap items-center gap-2 text-label-sm font-label-sm">
            <span className="uppercase tracking-wide text-text-disabled">Accepted Methods:</span>
            {paymentMethods.map((method) => (
              <span
                key={method}
                className={
                  method === "Trade Net 30"
                    ? "rounded bg-orange-500 px-2 py-1 font-semibold text-text-inverse"
                    : "rounded bg-graphite-700 px-2 py-1 text-text-inverse"
                }
              >
                {method}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-4 text-label-sm font-label-sm">
            {policyLinks.map((link) => (
              <Link key={link.label} href={link.href} className="hover:text-text-inverse">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-graphite-700">
        <div className="mx-auto flex max-w-[1600px] flex-col items-center gap-2 px-4 py-4 text-label-sm font-label-sm sm:flex-row sm:justify-between sm:px-margin-desktop">
          <div className="flex items-center gap-2">
            <Image src="/images/buildivo.png" alt="Buildivo" width={20} height={20} className="opacity-80" />
            <span>© 2026 Buildivo Industrial Supply Ltd. Registered in England &amp; Wales #05492019.</span>
          </div>
          <span className="flex items-center gap-1">
            <span aria-hidden className="material-symbols-outlined text-[14px]">shield</span>
            PCI-DSS Level 1 Merchant Certified
          </span>
        </div>
      </div>
    </footer>
  );
}
