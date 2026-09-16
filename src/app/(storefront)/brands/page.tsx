import type { Metadata } from "next";
import { ComingSoon } from "@/components/layout/coming-soon";

export const metadata: Metadata = { title: "Top Brands" };

export default function Page() {
  return <ComingSoon icon="star" title="Top Brands" description="A brand directory isn't built in this pass." />;
}
