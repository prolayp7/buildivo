import Link from "next/link";
import type { Category } from "@/types";
import type { SectionHeader } from "@/lib/api";

// Rendered on the server: the page fetches the departments (top-level categories) and passes them in.
export default function ShopByDepartment({ header, departments }: { header: SectionHeader; departments: Category[] }) {
  return (
    <section id="departments" className="mx-auto w-full max-w-[1600px] scroll-mt-40 px-4 py-5 sm:py-10 sm:px-margin-desktop">
        <div className="mb-3 flex items-center justify-between gap-2 sm:mb-space-lg">
          <h2 className="text-[18px] leading-6 font-headline-lg-mobile font-bold text-graphite-900 sm:text-headline-lg sm:font-headline-lg">{header.heading}</h2>
          <Link href={header.linkHref} className="shrink-0 whitespace-nowrap text-[10px] sm:text-label-lg font-label-lg font-semibold text-orange-600 hover:underline">
            {header.linkLabel}
          </Link>
        </div>
        <div aria-label="Departments" className="flex snap-x snap-proximity gap-2 overflow-x-auto overscroll-x-contain pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-3 sm:gap-3 sm:overflow-visible lg:grid-cols-5">
          {departments.map((dept) => (
            <Link
              key={dept.slug}
              href={`/c/${dept.slug}`}
              className="grid min-h-[76px] w-[174px] shrink-0 snap-start grid-cols-[28px_minmax(0,1fr)] content-center items-center gap-x-2 gap-y-1 rounded-xl border border-border-default bg-surface-white p-3 text-left transition-colors hover:border-orange-500 hover:bg-orange-50 focus-visible:outline-2 focus-visible:outline-orange-500 sm:flex sm:w-auto sm:flex-col sm:gap-2 sm:p-4 sm:text-center"
            >
              <span aria-hidden className="material-symbols-outlined row-span-2 text-[24px] sm:text-[28px] text-orange-600">{dept.icon}</span>
              <span className="text-xs leading-4 sm:text-body-sm font-body-sm font-semibold text-text-primary">{dept.name}</span>
              <span className="text-label-sm font-label-sm text-text-secondary">{dept.productCount.toLocaleString()}+ lines</span>
            </Link>
          ))}
        </div>
    </section>
  );
}