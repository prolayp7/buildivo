import type { Metadata } from "next";
import { ComingSoon } from "@/components/layout/coming-soon";

export const metadata: Metadata = { title: "Search" };

export default function Page() {
  return <ComingSoon icon="search" title="Search" description="Search results aren't wired to the catalog yet in this prototype — try browsing a department instead." />;
}
