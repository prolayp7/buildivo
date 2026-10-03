import type { Metadata } from "next";
import { OrderDetail } from "@/components/account/order-detail";

export const metadata: Metadata = { title: "Order details" };

export default async function Page({ params }: { params: Promise<{ uuid: string }> }) {
  const { uuid } = await params;
  return <OrderDetail uuid={uuid} />;
}
