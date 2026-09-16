import type { Metadata } from "next";
import { ComingSoon } from "@/components/layout/coming-soon";

export const metadata: Metadata = { title: "Track Order" };

export default function Page() {
  return <ComingSoon icon="local_shipping" title="Track Order" description="Order tracking isn't wired to a real order system in this prototype." />;
}
