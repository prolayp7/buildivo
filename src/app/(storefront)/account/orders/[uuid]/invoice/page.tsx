import type { Metadata } from "next";
import { InvoiceView } from "@/components/account/invoice-view";
import { fetchGeneralSettings } from "@/lib/api";

export const metadata: Metadata = { title: "Invoice" };

export default async function Page({ params }: { params: Promise<{ uuid: string }> }) {
  const { uuid } = await params;
  return <InvoiceView uuid={uuid} settings={await fetchGeneralSettings()} />;
}
