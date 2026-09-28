export default function StorefrontLoading() {
  return (
    <div className="min-h-[calc(100vh-156px)] bg-surface-warm px-4 py-12" aria-busy="true" aria-label="Loading storefront">
      <div className="mx-auto max-w-7xl animate-pulse space-y-6">
        <div className="h-10 w-72 rounded bg-graphite-200" />
        <div className="h-4 w-full max-w-xl rounded bg-graphite-200" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => <div key={index} className="aspect-[4/5] rounded-xl bg-graphite-200" />)}
        </div>
      </div>
    </div>
  );
}
