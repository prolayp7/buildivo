import type { Metadata } from "next";
import { ComingSoon } from "@/components/layout/coming-soon";

export const metadata: Metadata = { title: "Material Calculators" };

export default function Page() {
  return <ComingSoon icon="calculate" title="Material Calculators" description="The homepage ships one working Tile & Adhesive calculator. The rest of the calculator suite isn't built in this pass." />;
}
