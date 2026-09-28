export default function Loading() {
  return (
    <main id="main-content" className="min-h-screen bg-surface-warm px-4 py-16" aria-busy="true" aria-label="Loading">
      <div className="mx-auto max-w-7xl animate-pulse space-y-6">
        <div className="h-8 w-56 rounded bg-graphite-200" />
        <div className="h-4 w-96 max-w-full rounded bg-graphite-200" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => <div key={index} className="aspect-square rounded-xl bg-graphite-200" />)}
        </div>
      </div>
    </main>
  );
}
