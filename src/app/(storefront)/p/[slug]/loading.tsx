export default function ProductLoading() {
  return (
    <main id="main-content" className="min-h-screen bg-surface-warm px-4 py-8 sm:px-margin-desktop" aria-busy="true" aria-label="Loading product details">
      <p role="status" className="sr-only">Loading product details</p>
      <div className="mx-auto max-w-[1600px] motion-safe:animate-pulse">
        <div className="mb-6 h-4 w-64 rounded bg-graphite-200" />
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="aspect-square rounded-xl bg-graphite-200" />
          <div className="space-y-5 py-2">
            <div className="h-4 w-32 rounded bg-graphite-200" />
            <div className="h-10 w-full max-w-xl rounded bg-graphite-200" />
            <div className="h-5 w-40 rounded bg-graphite-200" />
            <div className="h-12 w-48 rounded bg-graphite-200" />
            <div className="h-28 w-full rounded bg-graphite-200" />
            <div className="h-12 w-full max-w-sm rounded bg-graphite-200" />
          </div>
        </div>
      </div>
    </main>
  );
}