import type { Metadata } from "next";
import { ComingSoon } from "@/components/layout/coming-soon";

export const metadata: Metadata = { title: "Trade Portal" };

export default function Page() {
  return <ComingSoon icon="engineering" title="Trade Portal" description="Net 30 trade accounts, RFQ tooling and bulk quoting aren't built in this pass — this prototype focuses on the retail storefront screens with real Stitch designs." />;
}
