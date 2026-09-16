import type { Metadata } from "next";
import { ComingSoon } from "@/components/layout/coming-soon";

export const metadata: Metadata = { title: "Your Account" };

export default function Page() {
  return <ComingSoon icon="person" title="Your Account" description="Sign-in and account management aren't built in this prototype — this pass focuses on the anonymous storefront journey." />;
}
