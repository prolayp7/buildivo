import type { Metadata } from "next";
import { TrackOrder } from "@/components/orders/track-order";

export const metadata: Metadata = { title: "Track Order", robots: { index: false, follow: true } };

export default function Page() {
  return <TrackOrder />;
}
