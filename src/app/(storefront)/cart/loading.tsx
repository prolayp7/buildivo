export default function CartLoading() {
  return (
    <main id="main-content" className="min-h-screen bg-surface-warm px-4 py-8 sm:px-margin-desktop" aria-busy="true" aria-label="Loading your cart">
      <p role="status" className="sr-only">Loading your cart</p>
      <div className="mx-auto max-w-[1600px] motion-safe:animate-pulse">
        <div className="mb-6 h-10 w-48 rounded bg-graphite-200" />
        <div className="grid items-start gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            {Array.from({ length: 3 }, (_, index) => <div key={index} className="flex gap-4 rounded-xl border border-border-default bg-white p-4">
              <div className="size-24 shrink-0 rounded-lg bg-graphite-200" />
              <div className="flex-1 space-y-3 py-1"><div className="h-4 w-24 rounded bg-graphite-200" /><div className="h-5 w-3/4 rounded bg-graphite-200" /><div className="h-4 w-28 rounded bg-graphite-200" /></div>
            </div>)}
          </div>
          <div className="h-72 rounded-xl border border-border-default bg-white p-5">
            <div className="space-y-4"><div className="h-6 w-40 rounded bg-graphite-200" /><div className="h-4 w-full rounded bg-graphite-200" /><div className="h-4 w-3/4 rounded bg-graphite-200" /><div className="mt-8 h-11 w-full rounded bg-graphite-200" /></div>
          </div>
        </div>
      </div>
    </main>
  );
}