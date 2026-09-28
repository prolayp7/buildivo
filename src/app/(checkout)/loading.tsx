export default function CheckoutLoading() {
  return (
    <main className="min-h-screen bg-surface-warm px-4 py-12" aria-busy="true" aria-label="Loading checkout">
      <div className="mx-auto max-w-6xl animate-pulse space-y-6">
        <div className="h-8 w-48 rounded bg-graphite-200" />
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="min-h-96 rounded-xl bg-graphite-200" />
          <div className="min-h-72 rounded-xl bg-graphite-200" />
        </div>
      </div>
    </main>
  );
}
