"use client";

import { useState } from "react";
import Link from "next/link";
import type { StorefrontFaqCategory } from "@/lib/api";

const QUICK_ACTIONS = [
  { icon: "local_shipping", title: "Track an order", description: "Check the latest available order updates.", href: "/track-order" },
  { icon: "storefront", title: "Delivery & collection", description: "Find branch and collection information.", href: "/branches" },
  { icon: "assignment_return", title: "Returns & restocking", description: "Review return guidance and next steps.", href: "/returns-and-restocking" },
  { icon: "build", title: "Product & technical support", description: "Browse product help and project guides.", href: "/guides" },
];

const SEARCH_SUGGESTIONS = ["Order tracking", "Returns", "VAT invoice", "Click & collect", "Product compatibility"];

export function HelpSupportCenter({ categories, supportEmail, supportPhone }: { categories: StorefrontFaqCategory[]; supportEmail: string; supportPhone: string }) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const normalizedSearch = search.trim().toLowerCase();
  const visibleCategories = categories
    .filter((category) => selectedCategory === null || category.id === selectedCategory)
    .map((category) => ({ ...category, faqs: category.faqs.filter((faq) => !normalizedSearch || `${faq.question} ${faq.answer}`.toLowerCase().includes(normalizedSearch)) }))
    .filter((category) => category.faqs.length > 0);
  const quickAnswers = categories.flatMap((category) => category.faqs.map((faq) => ({ ...faq, categoryId: category.id }))).slice(0, 4);
  const hasFaqs = categories.some((category) => category.faqs.length > 0);
  const phoneHref = supportPhone.replace(/[^\d+]/g, "");

  return (
    <main className="min-h-screen bg-surface-container-low">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-margin-desktop sm:py-8">
        <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2 text-label-sm font-label-sm text-text-secondary">
          <Link href="/" className="hover:text-orange-700">Home</Link><span aria-hidden>/</span><span aria-current="page" className="font-semibold text-graphite-900">Help &amp; Support</span>
        </nav>

        <header className="rounded-xl border border-border-default bg-white p-5 sm:p-7">
          <p className="mb-2 text-[10px] font-bold uppercase text-orange-700">Buildivo Help Centre</p>
          <h1 className="text-[28px] leading-8 font-bold text-graphite-900 sm:text-[34px] sm:leading-10">Help &amp; Support</h1>
          <p className="mt-2 max-w-2xl text-sm leading-5 text-text-secondary">Find help with orders, delivery, payments, returns, and products.</p>

          <form role="search" onSubmit={(event) => event.preventDefault()} className="mt-5 grid min-w-0 grid-cols-[2.25rem_minmax(0,1fr)_auto] items-center gap-2 rounded-lg border border-border-default bg-white p-1.5 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20">
            <label htmlFor="help-search" className="sr-only">Search help articles</label>
            <span aria-hidden className="material-symbols-outlined flex size-9 shrink-0 translate-y-1 items-center justify-center text-text-secondary">search</span>
            <input id="help-search" type="search" maxLength={120} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search help articles, orders and products" className="h-9 min-w-0 flex-1 border-0 bg-transparent text-sm outline-none placeholder:text-text-disabled" />
            {search && <button type="button" onClick={() => setSearch("")} aria-label="Clear search" className="flex size-9 shrink-0 items-center justify-center rounded-md text-text-secondary hover:bg-surface-container-low"><span aria-hidden className="material-symbols-outlined text-[18px]">close</span></button>}
            <button type="submit" className="inline-flex min-h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md bg-orange-500 px-3 text-xs font-bold text-white hover:bg-orange-600 sm:px-4">Search help <span aria-hidden className="material-symbols-outlined text-[16px]">arrow_forward</span></button>
          </form>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px]">
            <span className="font-semibold text-text-secondary">Try a topic:</span>
            {SEARCH_SUGGESTIONS.map((suggestion) => <button key={suggestion} type="button" onClick={() => setSearch(suggestion)} className="min-h-7 rounded-full border border-border-default bg-surface-container-low px-2.5 text-text-secondary hover:border-orange-400 hover:text-orange-700">{suggestion}</button>)}
          </div>
        </header>

        <section aria-label="Quick help links" className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {QUICK_ACTIONS.map((action) => (
            <Link key={action.title} href={action.href} className="group flex min-h-28 min-w-0 items-start gap-3 rounded-xl border border-border-default bg-white p-4 transition-colors hover:border-orange-400 hover:bg-orange-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 sm:min-h-32 sm:p-5">
              <span aria-hidden className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-700"><span className="material-symbols-outlined text-[20px]">{action.icon}</span></span>
              <span className="min-w-0"><span className="block text-sm font-bold text-graphite-900">{action.title}</span><span className="mt-1 block text-xs leading-4 text-text-secondary">{action.description}</span><span className="mt-3 inline-flex items-center gap-1 text-[10px] font-semibold text-orange-700">Open <span aria-hidden className="material-symbols-outlined text-[14px]">arrow_forward</span></span></span>
            </Link>
          ))}
        </section>

        <div className="mt-6 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-6">
          <section id="faq-list" aria-labelledby="faq-heading" className="min-w-0 rounded-xl border border-border-default bg-white p-4 sm:p-5">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><h2 id="faq-heading" className="text-xl font-bold text-graphite-900">Frequently asked questions</h2><p className="mt-1 text-xs text-text-secondary">Browse topics or search for a specific answer.</p></div>
              {hasFaqs && <span className="text-[10px] text-text-secondary">{categories.reduce((total, category) => total + category.faqs.length, 0)} answers</span>}
            </div>

            {hasFaqs ? <>
              <div role="group" aria-label="Filter FAQs by topic" className="mb-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <button type="button" onClick={() => setSelectedCategory(null)} aria-pressed={selectedCategory === null} className={`min-h-8 shrink-0 rounded-full px-3 text-[11px] font-semibold ${selectedCategory === null ? "bg-orange-500 text-white" : "bg-surface-container-low text-graphite-700 hover:bg-orange-100"}`}>All topics</button>
                {categories.map((category) => <button key={category.id} type="button" onClick={() => setSelectedCategory(category.id)} aria-pressed={selectedCategory === category.id} className={`min-h-8 shrink-0 rounded-full px-3 text-[11px] font-semibold ${selectedCategory === category.id ? "bg-orange-500 text-white" : "bg-surface-container-low text-graphite-700 hover:bg-orange-100"}`}>{category.name}<span className="ml-1.5 opacity-75">{category.faqs.length}</span></button>)}
              </div>
              {visibleCategories.length ? visibleCategories.map((category) => <section key={category.id} id={`faq-category-${category.id}`} aria-label={category.name} className="mb-5 last:mb-0">
                {selectedCategory === null && categories.length > 1 && <h3 className="mb-2 text-xs font-bold uppercase text-text-secondary">{category.name}</h3>}
                <div className="flex flex-col gap-2">{category.faqs.map((faq) => <details key={faq.id} id={`faq-${category.id}-${faq.id}`} open className="group rounded-lg border border-border-default bg-white open:bg-surface-container-low"><summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-3 py-2.5 text-sm font-semibold text-graphite-900 marker:hidden [&::-webkit-details-marker]:hidden"><span className="min-w-0">{faq.question}</span><span aria-hidden className="material-symbols-outlined shrink-0 text-[18px] text-text-secondary transition-transform group-open:rotate-180">expand_more</span></summary><div className="whitespace-pre-line border-t border-border-default px-3 py-3 text-sm leading-6 text-text-secondary">{faq.answer}</div></details>)}</div>
              </section>) : <p role="status" className="rounded-lg bg-surface-container-low p-4 text-sm text-text-secondary">No answers match this search. Try another phrase or topic.</p>}
            </> : <div className="rounded-lg bg-surface-container-low p-4 text-sm leading-6 text-text-secondary"><p>There are no published FAQ answers yet. Use the quick links above for order tracking, branches, returns, and product guides.</p></div>}
          </section>

          <aside aria-label="More ways to get help" className="flex min-w-0 flex-col gap-4">
            <section className="rounded-xl border border-border-default bg-white p-4"><div className="mb-3 flex items-center justify-between gap-2"><h2 className="text-sm font-bold text-graphite-900">Quick answers</h2><span aria-hidden className="material-symbols-outlined text-[18px] text-orange-600">arrow_outward</span></div>
              {quickAnswers.length ? <ul className="flex flex-col divide-y divide-border-default">{quickAnswers.map((faq) => <li key={`${faq.categoryId}-${faq.id}`} className="py-2.5 first:pt-0 last:pb-0"><a href={`#faq-${faq.categoryId}-${faq.id}`} className="flex items-start gap-2 text-xs leading-4 font-semibold text-graphite-900 hover:text-orange-700"><span aria-hidden className="mt-0.5 text-orange-600">›</span><span className="min-w-0">{faq.question}</span></a></li>)}</ul> : <p className="text-xs leading-5 text-text-secondary">Browse the help topics or use the quick links to get started.</p>}
            </section>

            <section className="rounded-xl bg-graphite-900 p-4 text-white"><p className="mb-2 text-[10px] font-bold uppercase text-orange-400">Contact support</p><h2 className="text-base font-bold">Need more help?</h2><p className="mt-1 text-xs leading-5 text-graphite-200">Choose a configured contact channel or open your account for order details.</p>
              <div className="mt-4 flex flex-col gap-2">{supportPhone && <a href={`tel:${phoneHref}`} className="flex min-h-10 items-center gap-2 rounded-lg bg-white/5 px-3 text-xs font-semibold hover:bg-white/10"><span aria-hidden className="material-symbols-outlined text-[17px] text-orange-400">call</span>{supportPhone}</a>}{supportEmail && <a href={`mailto:${supportEmail}`} className="flex min-h-10 min-w-0 items-center gap-2 rounded-lg bg-white/5 px-3 text-xs font-semibold hover:bg-white/10"><span aria-hidden className="material-symbols-outlined text-[17px] text-orange-400">mail</span><span className="truncate">{supportEmail}</span></a>}<Link href="/account/orders" className="flex min-h-10 items-center justify-center gap-2 rounded-lg bg-orange-500 px-3 text-xs font-bold text-white hover:bg-orange-600">Order support <span aria-hidden className="material-symbols-outlined text-[16px]">arrow_forward</span></Link></div>
            </section>

            <section className="rounded-xl border border-border-default bg-white p-4"><h2 className="text-sm font-bold text-graphite-900">Trade and project resources</h2><div className="mt-3 flex flex-col divide-y divide-border-default">{[{label:"Trade accounts",href:"/trade"},{label:"DIY guides",href:"/guides"},{label:"Material calculators",href:"/calculators"},{label:"Blog & trade knowledge",href:"/blog"}].map((link)=><Link key={link.href} href={link.href} className="flex min-h-10 items-center justify-between gap-2 text-xs font-semibold text-text-secondary hover:text-orange-700">{link.label}<span aria-hidden className="material-symbols-outlined text-[16px]">arrow_forward</span></Link>)}</div></section>
          </aside>
        </div>
      </div>
    </main>
  );
}