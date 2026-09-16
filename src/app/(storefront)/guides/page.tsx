import type { Metadata } from "next";
import { ComingSoon } from "@/components/layout/coming-soon";

export const metadata: Metadata = { title: "DIY Guides" };

export default function Page() {
  return <ComingSoon icon="menu_book" title="DIY Guides" description="Project guides and how-tos aren't built yet in this prototype. This link is a placeholder for the future guides hub." />;
}
