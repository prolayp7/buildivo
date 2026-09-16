import type { Metadata } from "next";
import { ComingSoon } from "@/components/layout/coming-soon";

export const metadata: Metadata = { title: "Deals & Clearance" };

export default function Page() {
  return <ComingSoon icon="local_fire_department" title="Deals & Clearance" description="A dedicated deals feed isn't built in this pass." />;
}
