import type { Metadata } from "next";
import { ComingSoon } from "@/components/layout/coming-soon";

export const metadata: Metadata = { title: "Help Center" };

export default function Page() {
  return <ComingSoon icon="help" title="Help Center" description="Support articles, returns and warranty info aren't built in this pass — contact your account manager for now." />;
}
