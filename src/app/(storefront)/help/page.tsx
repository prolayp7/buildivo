import type { Metadata } from "next";
import { HelpSupportCenter } from "@/components/help/help-support-center";
import { fetchFaqCategories, fetchGeneralSettings } from "@/lib/api";

export const metadata: Metadata = {
  title: "Help & Support",
  description: "Find help with Buildivo orders, delivery, returns, payments, and products.",
  alternates: { canonical: "/help" },
};

export default async function HelpPage() {
  const [categories, settings] = await Promise.all([fetchFaqCategories(), fetchGeneralSettings()]);
  return <HelpSupportCenter categories={categories} supportEmail={settings.supportEmail?.trim() ?? ""} supportPhone={settings.supportPhone1?.trim() ?? ""} />;
}
