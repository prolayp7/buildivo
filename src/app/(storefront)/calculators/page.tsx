import type { Metadata } from "next";
import { MaterialsCalculator } from "@/components/calculators/materials-calculator";
import { fetchCalculatorProducts } from "@/lib/api";

export const metadata: Metadata = {
  title: "Material Calculator",
  description: "Work out how much tile adhesive, paint or flooring you need for your project, and add it straight to your basket.",
  alternates: { canonical: "/calculators" },
};

export default async function CalculatorsPage() {
  const products = await fetchCalculatorProducts();
  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 py-10 sm:px-8">
      <h1 className="text-3xl font-bold">Material Calculator</h1>
      <p className="mt-2 text-text-secondary">Enter the area you need to cover and we&apos;ll work out how much to buy.</p>
      <MaterialsCalculator products={products} />
    </div>
  );
}
