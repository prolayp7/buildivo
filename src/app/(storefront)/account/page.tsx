import type { Metadata } from "next";
import { AccountSummary } from "@/components/account/account-summary";
export const metadata: Metadata = { title: "Your Account" };
export default function Page() { return <AccountSummary />; }
