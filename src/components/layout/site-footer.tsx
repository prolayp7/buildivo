import Link from "next/link";
import styles from "./site-footer.module.css";
import Image from "next/image";
import { SocialLinks } from "@/components/layout/social-links";
import type { FooterColumn } from "@/lib/adapters";
import type { FooterSettings } from "@/lib/api";

const chipTone = { success: "text-success-500", info: "text-info-500", neutral: "text-text-inverse" } as const;

// Everything here except the link columns is managed in buildivo-admin (Marketing > Footer); the
// columns come from the admin's footer menu. Without settings (API unreachable) only the columns render.
export function SiteFooter({ columns, settings }: { columns: FooterColumn[]; settings: FooterSettings | null }) {
  const gatewayMethods = settings?.showGateways ? settings.gateways.map((label) => ({ label, highlight: false })) : [];
  const manualMethods = settings?.paymentMethods ?? [];
  const seen = new Set(gatewayMethods.map((method) => method.label.toLowerCase()));
  const methods = [...gatewayMethods, ...manualMethods.filter((method) => !seen.has(method.label.toLowerCase()))];
  const hasAbout = Boolean(settings && (settings.aboutText || settings.certifications.length || Object.values(settings.social).some(Boolean)));
  const copyright = settings?.copyright.replaceAll("{year}", String(new Date().getFullYear())) ?? "";

  return (
    <footer className={`${styles.footer} bg-graphite-900 text-text-inverse-muted`}>
      {settings && settings.trustBadges.length > 0 && (
        <div className={`${styles.trust} mx-auto grid max-w-[1600px] grid-cols-2 gap-4 border-b border-graphite-700 px-4 py-6 sm:grid-cols-3 sm:px-margin-desktop lg:grid-cols-5`}>
          {settings.trustBadges.map((badge) => (
            <div key={badge.title} className="flex items-center gap-2">
              <span aria-hidden className="material-symbols-outlined text-[20px] text-orange-500">
                {badge.icon}
              </span>
              <div>
                <p className="text-label-sm font-label-sm font-semibold text-text-inverse">{badge.title}</p>
                {badge.caption && <p className="text-label-sm font-label-sm">{badge.caption}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className={`${styles.main} mx-auto max-w-[1600px] px-4 py-12 sm:px-margin-desktop`}>
        <div className={`${styles.columns} grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5`}>
          {columns.map((col) => (
            <div key={col.title}>
              <details className={styles.accordion}>
                <summary>{col.title}<span aria-hidden className="material-symbols-outlined">expand_more</span></summary>
                <ul>
                  {col.links.map((link) => <li key={link.label}><Link href={link.href}>{link.label}</Link></li>)}
                </ul>
              </details>
              <div className={styles.desktopColumn}>
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
            </div>
          ))}
          {settings && hasAbout && (
            <div className={styles.about}>
              {settings.aboutHeading && <h2 className="mb-3 text-body-sm font-body-sm font-bold text-text-inverse">{settings.aboutHeading}</h2>}
              {settings.aboutText && <p className="mb-4 text-label-sm font-label-sm">{settings.aboutText}</p>}
              {settings.certifications.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {settings.certifications.map((chip) => (
                    <span key={chip.label} className={`rounded bg-graphite-700 px-2 py-1 text-label-sm font-label-sm ${chipTone[chip.tone]}`}>{chip.label}</span>
                  ))}
                </div>
              )}
              <SocialLinks urls={settings.social} />
            </div>
          )}
        </div>
      </div>

      {settings && (methods.length > 0 || settings.legalLinks.length > 0) && (
        <div className={`${styles.payments} border-t border-graphite-700`}>
          <div className="mx-auto flex max-w-[1600px] flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-margin-desktop">
            {methods.length > 0 ? (
              <div className={`${styles.methods} flex flex-wrap items-center gap-2 text-label-sm font-label-sm`}>
                <span className="uppercase tracking-wide text-text-disabled">Accepted payment methods</span>
                {methods.map((method) => (
                  <span
                    key={method.label}
                    className={method.highlight ? "rounded bg-orange-500 px-2 py-1 font-semibold text-text-inverse" : "rounded bg-graphite-700 px-2 py-1 text-text-inverse"}
                  >
                    {method.label}
                  </span>
                ))}
              </div>
            ) : <span />}
            <div className={`${styles.legal} flex flex-wrap gap-4 text-label-sm font-label-sm`}>
              {settings.legalLinks.map((link) => (
                <Link key={link.label} href={link.href} className="hover:text-text-inverse">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {settings && (copyright || settings.complianceBadge) && (
        <div className={`${styles.copyright} border-t border-graphite-700`}>
          <div className="mx-auto flex max-w-[1600px] flex-col items-center gap-2 px-4 py-4 text-label-sm font-label-sm sm:flex-row sm:justify-between sm:px-margin-desktop">
            <div className="flex items-center gap-2">
              <Image src="/images/buildivo.png" alt="Buildivo" width={20} height={20} className="opacity-80" />
              <span>{copyright}</span>
            </div>
            {settings.complianceBadge && (
              <span className="flex items-center gap-1">
                <span aria-hidden className="material-symbols-outlined text-[14px]">shield</span>
                {settings.complianceBadge}
              </span>
            )}
          </div>
        </div>
      )}
    </footer>
  );
}
