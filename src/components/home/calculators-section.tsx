import Link from "next/link";
import { TileCalculator } from "@/components/home/tile-calculator";
import type { CalculatorsContent } from "@/lib/api";

type CalculatorLink = {
  slug: string;
  icon: string;
  label: string;
  caption: string;
};

export function CalculatorsSection({ content, calculators }: { content: CalculatorsContent; calculators: CalculatorLink[] }) {
  return (
    <section className="mx-auto w-full max-w-[1600px] px-4 py-10 sm:px-margin-desktop">
      <p className="mb-1 text-label-md font-label-md font-semibold uppercase tracking-wide text-orange-600">{content.eyebrow}</p>
      <h2 className="mb-1 text-headline-lg-mobile font-headline-lg-mobile font-bold text-graphite-900 sm:text-headline-lg sm:font-headline-lg">{content.heading}</h2>
      <p className="mb-8 max-w-[560px] text-body-md font-body-md text-text-secondary">{content.description}</p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TileCalculator />
        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 lg:grid lg:grid-rows-3 lg:gap-4 lg:overflow-visible lg:pb-0">
          {calculators.map((calculator) => (
            <Link
              key={calculator.slug}
              href="/calculators"
              className="flex w-[85%] min-w-[85%] snap-start items-center justify-between gap-4 rounded-2xl bg-surface-white px-5 py-7 shadow-[0_1px_2px_rgb(0_0_0/0.05)] transition-colors hover:bg-orange-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-500 lg:min-h-32 lg:w-auto lg:min-w-0"
            >
              <div className="flex min-w-0 items-center gap-4">
                <span aria-hidden className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-container-low text-graphite-900">
                  <span className="material-symbols-outlined text-[20px]">{calculator.icon}</span>
                </span>
                <div>
                  <p className="text-[18px] leading-6 font-bold text-graphite-900">{calculator.label}</p>
                  <p className="text-[14px] leading-5 text-text-secondary">{calculator.caption}</p>
                </div>
              </div>
              <span aria-hidden className="material-symbols-outlined shrink-0 text-[20px] text-graphite-400">arrow_forward</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}