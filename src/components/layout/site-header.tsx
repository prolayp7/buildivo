"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { DepartmentsMenu } from "@/components/layout/departments-menu";
import { MobileNav } from "@/components/layout/mobile-nav";
import { MiniCart } from "@/components/layout/mini-cart";
import { BuildivoLogo } from "@/components/layout/buildivo-logo";
import type { MainMenuItem } from "@/lib/adapters";
import { useCartTotals } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

export function SiteHeader({ departments, mainMenu }: { departments: Category[]; mainMenu: MainMenuItem[] }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { subtotal, count } = useCartTotals();
  const pathname = usePathname();
  const router = useRouter();

  // Category links render as plain tabs; special pages (Deals, Top Brands,
  // etc.) render as the bolder icon+label style already designed for them.
  const categoryLinks = mainMenu.filter((item) => item.href.startsWith("/c/"));
  const pageLinks = mainMenu.filter((item) => !item.href.startsWith("/c/"));

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const query = new FormData(e.currentTarget).get("q");
    if (typeof query === "string" && query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <header className="fixed left-0 right-0 top-0 z-50 flex flex-col">
      <a
        href="#main-content"
        className="sr-only rounded bg-orange-500 px-4 py-2 text-text-inverse focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60]"
      >
        Skip to content
      </a>

      <div className="hidden h-9 bg-graphite-800 text-text-inverse sm:block">
        <div className="mx-auto flex h-full max-w-[1600px] items-center justify-between px-margin-desktop text-label-sm font-label-sm">
          <div className="flex items-center gap-space-sm overflow-hidden text-ellipsis whitespace-nowrap">
            <span aria-hidden className="inline-block h-2 w-2 rounded-full bg-orange-500" />
            <span className="font-normal text-text-inverse-muted">Free next-day delivery over £75</span>
            <span className="text-graphite-600">·</span>
            <span className="font-medium text-text-inverse">Trade accounts save up to 15%</span>
            <span className="hidden text-graphite-600 md:inline">·</span>
            <span className="hidden font-normal text-text-inverse-muted md:inline">Click &amp; Collect in 30 mins</span>
          </div>
          <div className="hidden items-center gap-space-lg md:flex">
            <Link href="/help" className="flex items-center gap-1 text-text-inverse-muted transition-colors hover:text-text-inverse">
              <span aria-hidden className="material-symbols-outlined text-[14px]">help</span>
              Help Center
            </Link>
            <Link href="/track-order" className="flex items-center gap-1 text-text-inverse-muted transition-colors hover:text-text-inverse">
              <span aria-hidden className="material-symbols-outlined text-[14px]">local_shipping</span>
              Track Order
            </Link>
            <Link href="/branches" className="flex items-center gap-1 text-text-inverse-muted transition-colors hover:text-text-inverse">
              <span aria-hidden className="material-symbols-outlined text-[14px]">store</span>
              Branch Finder
            </Link>
            <span aria-hidden className="h-3 w-px bg-graphite-600" />
            <Link href="/trade" className="flex items-center gap-1 font-semibold text-orange-500 transition-colors hover:text-orange-100">
              <span aria-hidden className="material-symbols-outlined text-[14px]">engineering</span>
              Trade Portal Net 30
            </Link>
          </div>
        </div>
      </div>

      <div className="h-[68px] border-b border-border-default bg-surface-white shadow-[0_1px_3px_rgba(13,23,34,0.06)] sm:h-[76px]">
        <div className="mx-auto flex h-full max-w-[1600px] items-center gap-space-md px-4 sm:gap-space-lg sm:px-margin-desktop">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-graphite-800 lg:hidden"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open menu"
          >
            <span aria-hidden className="material-symbols-outlined text-[26px]">menu</span>
          </button>

          <Link href="/" className="flex shrink-0 items-center">
            <BuildivoLogo height={60} />
          </Link>

          <DepartmentsMenu departments={departments} />

          <form onSubmit={handleSearch} className="hidden max-w-2xl flex-1 md:block" role="search">
            <div className="relative flex w-full items-center">
              <span aria-hidden className="material-symbols-outlined pointer-events-none absolute left-3.5 text-[20px] text-graphite-400">
                search
              </span>
              <label htmlFor="site-search" className="sr-only">
                Search products, SKUs and guides
              </label>
              <input
                id="site-search"
                name="q"
                type="search"
                className="h-11 w-full rounded-lg border border-border-default bg-surface-warm pl-10 pr-24 text-body-sm font-body-sm text-text-primary placeholder:text-text-disabled focus:border-orange-500 focus:bg-surface-white focus:outline-none"
                placeholder="Search 45,000+ power tools, fixings, plumbing, SKUs, MPNs..."
              />
              <button type="submit" className="absolute right-1 rounded bg-orange-500 px-3 py-1.5 text-label-sm font-label-sm font-semibold text-text-inverse hover:bg-orange-600">
                Search
              </button>
            </div>
          </form>

          <button
            type="button"
            className="ml-auto flex h-10 w-10 items-center justify-center rounded-lg text-graphite-800 md:hidden"
            onClick={() => router.push("/search")}
            aria-label="Search"
          >
            <span aria-hidden className="material-symbols-outlined text-[24px]">search</span>
          </button>

          <div className="hidden shrink-0 items-center gap-2 border-l border-border-default pl-2 text-left xl:flex">
            <span aria-hidden className="material-symbols-outlined text-[22px] text-orange-500">near_me</span>
            <div>
              <p className="text-label-sm font-label-sm leading-tight text-text-secondary">
                Deliver to: <span className="font-semibold text-text-primary">SW1A 1AA</span>
              </p>
              <p className="text-label-sm font-label-sm font-medium leading-tight text-success-500">Central London Depot</p>
            </div>
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-space-md md:ml-0">
            <Link href="/trade" className="group hidden flex-col items-center text-text-secondary transition-colors hover:text-text-primary md:flex">
              <span aria-hidden className="material-symbols-outlined text-[22px] group-hover:text-orange-500">badge</span>
              <span className="text-label-sm font-label-sm">Trade</span>
            </Link>
            <Link href="/wishlist" className="group hidden flex-col items-center text-text-secondary transition-colors hover:text-text-primary sm:flex">
              <span aria-hidden className="material-symbols-outlined text-[22px] group-hover:text-orange-500">favorite</span>
              <span className="hidden text-label-sm font-label-sm lg:inline">Saved</span>
            </Link>
            <Link href="/compare" className="group hidden flex-col items-center text-text-secondary transition-colors hover:text-text-primary sm:flex">
              <span aria-hidden className="material-symbols-outlined text-[22px] group-hover:text-orange-500">compare_arrows</span>
              <span className="hidden text-label-sm font-label-sm lg:inline">Compare</span>
            </Link>
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="flex items-center gap-space-sm rounded-lg border border-orange-500/20 bg-orange-50 px-3 py-2 transition-colors hover:bg-orange-100"
              aria-label={`Cart, ${count} items, ${formatPrice(subtotal)}`}
            >
              <span className="relative flex items-center">
                <span aria-hidden className="material-symbols-outlined text-[24px] text-orange-600">shopping_bag</span>
                <span aria-hidden className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold leading-none text-text-inverse">
                  {count}
                </span>
              </span>
              <span className="hidden flex-col text-left md:flex">
                <span className="text-label-sm font-label-sm text-text-secondary">Cart</span>
                <span className="text-label-md font-label-md font-bold leading-none text-orange-700">{formatPrice(subtotal)}</span>
              </span>
            </button>
            <Link href="/account" className="hidden border-l border-border-default pl-2 sm:block" aria-label="Your account">
              <span
                aria-hidden
                className="flex h-8 w-8 items-center justify-center rounded-full bg-graphite-100 text-graphite-700 ring-2 ring-transparent transition-all hover:ring-orange-500"
              >
                <span className="material-symbols-outlined text-[20px]">person</span>
              </span>
            </Link>
          </div>
        </div>
      </div>

      <div className="hidden h-11 border-b border-border-default bg-surface-white lg:block">
        <div className="mx-auto flex h-full max-w-[1600px] items-center px-margin-desktop">
          <nav aria-label="Categories" className="flex h-full min-w-0 flex-1 items-center gap-space-lg overflow-x-auto no-scrollbar">
            {categoryLinks.map((item) => {
              const active = pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex h-full shrink-0 items-center whitespace-nowrap text-label-md font-label-md text-text-secondary transition-colors hover:text-text-primary",
                    active && "border-b-2 border-orange-500 font-bold text-orange-600",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="hidden shrink-0 items-center gap-space-md pl-space-md xl:flex">
            {pageLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-1 whitespace-nowrap text-label-md font-label-md font-semibold text-text-primary hover:underline [&:first-child]:text-orange-600"
              >
                <span aria-hidden className="material-symbols-outlined text-[16px]">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <MobileNav open={mobileNavOpen} onOpenChange={setMobileNavOpen} departments={departments} />
      <MiniCart open={cartOpen} onOpenChange={setCartOpen} />
    </header>
  );
}
