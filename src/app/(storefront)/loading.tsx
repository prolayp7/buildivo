"use client";

import { usePathname } from "next/navigation";

export default function StorefrontLoading() {
  const pathname = usePathname();

  if (pathname === "/") {
    return (
      <div className="min-h-[calc(100vh-156px)] bg-surface-warm" aria-busy="true" aria-label="Loading homepage">
        <div className="animate-pulse motion-reduce:animate-none">
          <section className="w-full bg-surface-white shadow-sm">
            <div className="mx-auto max-w-[1600px] px-4 pb-5 pt-0 sm:px-margin-desktop sm:py-10 lg:py-20">
              <div className="grid grid-cols-1 items-center gap-4 sm:gap-gutter-desktop lg:grid-cols-12">
                <div className="order-2 flex flex-col items-start sm:order-0 lg:col-span-7">
                  <div className="mb-3 h-6 w-44 rounded-full bg-graphite-200" />
                  <div className="mb-3 w-full max-w-xl space-y-2 sm:mb-5">
                    <div className="h-10 w-full rounded bg-graphite-200 sm:h-12" />
                    <div className="h-10 w-3/4 rounded bg-graphite-200 sm:h-12" />
                  </div>
                  <div className="mb-4 w-full max-w-xl space-y-2 sm:mb-6">
                    <div className="h-4 w-full rounded bg-graphite-200" />
                    <div className="h-4 w-4/5 rounded bg-graphite-200" />
                  </div>
                  <div className="mb-4 grid w-full grid-cols-2 gap-2 sm:mb-6 sm:flex sm:w-auto sm:gap-4">
                    <div className="h-11 rounded-xl bg-graphite-200 sm:w-52" />
                    <div className="h-11 rounded-xl bg-graphite-200 sm:w-48" />
                  </div>
                  <div className="hidden w-full gap-2 sm:grid sm:grid-cols-3">
                    {Array.from({ length: 2 }, (_, index) => (
                      <div key={index} className="flex min-h-16 items-center gap-3 rounded-xl bg-surface-warm p-3">
                        <div className="size-10 shrink-0 rounded-lg bg-graphite-200" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 w-3/4 rounded bg-graphite-200" />
                          <div className="h-3 w-1/2 rounded bg-graphite-200" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="relative order-1 sm:order-0 lg:col-span-5">
                  <div className="aspect-video min-h-55 w-full rounded-2xl bg-graphite-200 sm:aspect-5/4 sm:min-h-0" />
                  <div className="absolute bottom-3 left-3 h-14 w-40 rounded-xl bg-surface-white/90 shadow-sm sm:bottom-5 sm:left-5" />
                </div>
              </div>
            </div>
          </section>

          <section className="bg-surface-warm">
            <div className="mx-auto max-w-[1600px] px-4 py-4 sm:px-margin-desktop sm:py-6">
              <div className="flex snap-x snap-mandatory gap-3 overflow-hidden sm:grid sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
                {Array.from({ length: 4 }, (_, index) => (
                  <div key={index} className="flex min-h-16 w-[88%] shrink-0 items-center gap-3 rounded-lg bg-white p-3 sm:w-auto sm:shrink">
                    <div className="size-10 shrink-0 rounded-lg bg-graphite-200" />
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="h-3 w-3/4 rounded bg-graphite-200" />
                      <div className="h-3 w-1/2 rounded bg-graphite-200" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-margin-desktop sm:py-10">
            <div className="mb-3 flex items-center justify-between sm:mb-5">
              <div className="h-6 w-48 rounded bg-graphite-200" />
              <div className="h-4 w-24 rounded bg-graphite-200" />
            </div>
            <div className="flex snap-x snap-proximity gap-2 overflow-hidden sm:grid sm:grid-cols-3 sm:gap-3 lg:grid-cols-5">
              {Array.from({ length: 5 }, (_, index) => (
                <div key={index} className="flex min-h-19 w-43.5 shrink-0 items-center gap-2 rounded-xl border border-border-default bg-surface-white p-3 sm:min-h-33 sm:w-auto sm:flex-col sm:gap-3 sm:p-4">
                  <div className="size-8 rounded-lg bg-graphite-200" />
                  <div className="h-4 w-3/4 rounded bg-graphite-200" />
                  <div className="h-3 w-1/2 rounded bg-graphite-200" />
                </div>
              ))}
            </div>
          </section>

          <section className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-margin-desktop sm:py-10">
            <div className="mb-3 flex items-center justify-between sm:mb-5">
              <div className="h-6 w-44 rounded bg-graphite-200" />
              <div className="h-4 w-28 rounded bg-graphite-200" />
            </div>
            <div className="flex snap-x snap-mandatory gap-2 overflow-hidden sm:grid sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
              {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="w-[80%] shrink-0 rounded-xl border border-border-default bg-surface-white p-3 sm:w-auto sm:shrink">
                  <div className="aspect-square rounded-lg bg-graphite-200" />
                  <div className="mt-3 space-y-2">
                    <div className="h-4 w-full rounded bg-graphite-200" />
                    <div className="h-4 w-2/3 rounded bg-graphite-200" />
                    <div className="h-5 w-1/3 rounded bg-graphite-200" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  }

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
