import { CalculatorLinksCarousel, type CalculatorLink } from "@/components/home/calculator-links-carousel";
import { TileCalculator } from "@/components/home/tile-calculator";
import type { CalculatorsContent } from "@/lib/api";

export function CalculatorsSection({ content, calculators }: { content: CalculatorsContent; calculators: CalculatorLink[] }) {
  return (
    <section className="mx-auto w-full max-w-[1600px] px-4 py-10 sm:px-margin-desktop">
      <p className="mb-1 text-label-md font-label-md font-semibold uppercase tracking-wide text-orange-600">{content.eyebrow}</p>
      <h2 className="mb-1 text-headline-lg-mobile font-headline-lg-mobile font-bold text-graphite-900 sm:text-headline-lg sm:font-headline-lg">{content.heading}</h2>
      <p className="mb-8 max-w-[560px] text-body-md font-body-md text-text-secondary">{content.description}</p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TileCalculator />
        <CalculatorLinksCarousel calculators={calculators} />
      </div>
    </section>
  );
}