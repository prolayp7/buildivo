import type { Metadata } from "next";
import { ComingSoon } from "@/components/layout/coming-soon";

export const metadata: Metadata = { title: "Branch Finder" };

export default function Page() {
  return <ComingSoon icon="store" title="Branch Finder" description="A branch locator isn't built in this pass." />;
}
