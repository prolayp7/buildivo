"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { MobileNav } from "./mobile-nav";
import type { Category } from "@/types";

const links = [
  { href: "/", label: "Home", icon: "storefront" },
  { href: null, label: "Categories", icon: "grid_view" },
  { href: "/guides", label: "Guides", icon: "menu_book" },
  { href: "/wishlist", label: "Saved", icon: "bookmark" },
  { href: "/account", label: "Account", icon: "person" },
];

export function MobileBottomNav({ departments }: { departments: Category[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <div className="sm:hidden">
      <Link href="/help" className="fixed right-4 bottom-[calc(80px+env(safe-area-inset-bottom))] z-30 flex min-h-11 items-center gap-2 rounded-full bg-orange-500 px-4 text-xs font-bold text-white shadow-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-500">
        <span aria-hidden className="material-symbols-outlined text-[20px]">support_agent</span>
        Ask Buildivo Expert
      </Link>
      <nav aria-label="Mobile navigation" className="fixed inset-x-0 bottom-0 z-40 h-[calc(72px+env(safe-area-inset-bottom))] grid grid-cols-5 bg-graphite-900 px-2 pt-2 pb-[calc(6px+env(safe-area-inset-bottom))] text-text-inverse-muted">
        {links.map((link) => {
          const active = link.href === null ? open || pathname.startsWith("/c/") : !open && (link.href === "/" ? pathname === "/" : pathname === link.href || pathname.startsWith(`${link.href}/`));
          const className = `relative flex min-h-12 flex-col items-center justify-center gap-1 rounded px-1 text-[11px] focus-visible:outline-2 focus-visible:outline-orange-500 ${active ? "text-orange-500" : "hover:text-white"}`;
          const content = <><span aria-hidden className="material-symbols-outlined text-[22px]">{link.icon}</span>{active && <span aria-hidden className="absolute top-7 h-1 w-1 rounded-full bg-orange-500" />}<span className="mt-1">{link.label}</span></>;
          return link.href ? <Link key={link.label} href={link.href} aria-current={active ? "page" : undefined} className={className}>{content}</Link> : <button key={link.label} type="button" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)} className={className}>{content}</button>;
        })}
      </nav>
      <MobileNav open={open} onOpenChange={setOpen} departments={departments} />
    </div>
  );
}
