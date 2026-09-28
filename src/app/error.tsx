"use client";

import Link from "next/link";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <main id="main-content" className="flex min-h-screen items-center justify-center bg-surface-warm px-4 py-16">
      <section className="w-full max-w-lg rounded-xl border border-border-default bg-surface-white p-8 text-center shadow-sm" aria-labelledby="error-title">
        <p className="font-mono text-xs font-semibold uppercase tracking-widest text-orange-700">Temporary service interruption</p>
        <h1 id="error-title" className="mt-3 text-2xl font-bold text-graphite-900">This page could not load</h1>
        <p className="mt-3 text-sm leading-6 text-text-secondary">The storefront hit a temporary problem. Try again, or return to the catalogue while we recover the request.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={() => reset()} className="rounded-lg bg-orange-500 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-600 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-600">Try again</button>
          <Link href="/" className="rounded-lg border border-border-default px-5 py-3 text-sm font-semibold text-graphite-900 hover:bg-orange-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-600">Return home</Link>
        </div>
      </section>
    </main>
  );
}
