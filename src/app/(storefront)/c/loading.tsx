export default function CategoryLoading() {
  return (
    <div className="min-h-[calc(100vh-156px)] bg-surface-warm" aria-busy="true" aria-label="Loading category">
      <div aria-hidden="true" className="animate-pulse motion-reduce:animate-none">
        <div className="border-b border-border-default bg-surface-white">
          <div className="mx-auto flex h-10 max-w-[1600px] items-center gap-2 px-4 sm:px-margin-desktop">
            <div className="h-3 w-10 rounded bg-graphite-200" />
            <div className="h-3 w-2 rounded bg-graphite-200" />
            <div className="h-3 w-36 rounded bg-graphite-200" />
          </div>
        </div>

        <div className="border-b border-border-default bg-surface-white">
          <div className="mx-auto flex min-h-24 max-w-[1600px] flex-wrap items-center gap-3 px-4 py-5 sm:px-margin-desktop">
            <div className="h-8 w-64 max-w-[70%] rounded bg-graphite-200" />
            <div className="h-6 w-32 rounded-full bg-graphite-200" />
          </div>
        </div>

        <div className="border-b border-border-default bg-surface-white">
          <div className="mx-auto flex max-w-[1600px] gap-2 overflow-hidden px-4 py-3 sm:px-margin-desktop">
            {["w-40", "w-32", "w-36"].map((width) => (
              <div key={width} className={`h-9 shrink-0 rounded-full bg-graphite-200 ${width}`} />
            ))}
          </div>
        </div>

        <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-margin-desktop">
          <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
            <aside className="hidden h-fit space-y-6 rounded-xl border border-border-default bg-surface-white p-5 lg:block">
              {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="space-y-3">
                  <div className="h-4 w-28 rounded bg-graphite-200" />
                  {Array.from({ length: 3 }, (_, option) => (
                    <div key={option} className="flex items-center gap-2">
                      <div className="size-4 rounded border border-graphite-200 bg-surface-white" />
                      <div className="h-3 flex-1 rounded bg-graphite-200" />
                    </div>
                  ))}
                </div>
              ))}
            </aside>

            <section className="min-w-0" aria-label="Loading products">
              <div className="mb-4 flex min-h-14 flex-wrap items-center justify-between gap-3 rounded-xl border border-border-default bg-surface-white px-3 py-2">
                <div className="h-4 w-36 rounded bg-graphite-200" />
                <div className="flex items-center gap-3">
                  <div className="h-8 w-20 rounded bg-graphite-200 lg:hidden" />
                  <div className="h-8 w-40 rounded bg-graphite-200" />
                  <div className="hidden h-8 w-20 rounded bg-graphite-200 sm:block" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                {Array.from({ length: 8 }, (_, index) => (
                  <article key={index} className="rounded-xl border border-border-default bg-surface-white p-3">
                    <div className="aspect-square rounded-lg bg-graphite-200" />
                    <div className="mt-3 space-y-2">
                      <div className="h-3 w-2/5 rounded bg-graphite-200" />
                      <div className="h-4 w-full rounded bg-graphite-200" />
                      <div className="h-4 w-4/5 rounded bg-graphite-200" />
                      <div className="mt-4 h-5 w-1/3 rounded bg-graphite-200" />
                      <div className="h-10 rounded-lg bg-graphite-200" />
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}