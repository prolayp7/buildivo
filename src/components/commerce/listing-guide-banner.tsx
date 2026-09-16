import Link from "next/link";

export function ListingGuideBanner() {
  return (
    <aside aria-label="Buildivo engineering field guide" className="relative col-span-full isolate overflow-hidden rounded-2xl bg-[#0b141b] p-5 shadow-[0_3px_8px_rgb(0_0_0/0.12)] sm:p-6">
      <div aria-hidden="true" className="pointer-events-none absolute -inset-y-10 right-0 -z-10 w-1/3 skew-x-12 bg-[#241c16]" />
      <div className="flex flex-col items-start gap-5 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 max-w-[650px]">
          <span className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-[#304454] bg-[#192a38] px-2.5 py-1 text-[10px] leading-3 font-semibold text-orange-500">
            <span aria-hidden="true" className="material-symbols-outlined text-[13px]">menu_book</span>
            Buildivo Engineering Field Guide
          </span>
          <h2 className="mb-2 text-[18px] leading-6 font-bold tracking-tight text-white">How to Choose the Right Cordless Drill for Jobsite vs Home Workshop</h2>
          <p className="max-w-[620px] text-[12px] leading-5 text-text-inverse-muted">Compare torque requirements (Nm), percussion BPM for engineering brick vs aerated block, and battery cooling architecture. Learn how a brushless motor extends runtime by 40% when driving 100mm timber-lock structural fasteners.</p>
        </div>
        <Link href="/guides" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-3 rounded-xl bg-orange-500 px-5 py-3 text-[12px] font-bold text-white transition-colors hover:bg-orange-600 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-500">
          Read Full Technical Guide
          <span aria-hidden="true" className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </Link>
      </div>
    </aside>
  );
}
