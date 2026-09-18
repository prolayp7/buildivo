import { cookies } from "next/headers";
import { apiBase, sessionJson } from "@/lib/customer-session";
import type { AccountOrder } from "@/components/account/order-types";

export async function GET(request: Request) {
  const token = (await cookies()).get("buildivo.access")?.value;
  if (!token) return sessionJson({ message: "Please sign in to view your orders." }, 401);
  const page = Number(new URL(request.url).searchParams.get("page") ?? "1");
  if (!Number.isSafeInteger(page) || page < 1) return sessionJson({ message: "Invalid page." }, 400);
  try {
    const response = await fetch(`${apiBase()}/orders?page=${page}&perPage=100`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) return sessionJson({ message: response.status === 401 ? "Your session expired. Please sign in again." : "Could not load your orders. Please try again." }, response.status);
    const body = await response.json();
    // Return only the fields this panel needs; never forward internal order notes.
    const items = (body.data as AccountOrder[]).map((order) => ({
      uuid: order.uuid, orderNumber: order.orderNumber, status: order.status,
      paymentStatus: order.paymentStatus, placedAt: order.placedAt,
      shippingCompanyName: order.shippingCompanyName, shippingLine1: order.shippingLine1,
      shippingCity: order.shippingCity, shippingPostcode: order.shippingPostcode,
      trackingCarrier: order.trackingCarrier, trackingNumber: order.trackingNumber,
      trackingUrl: order.trackingUrl, subtotal: order.subtotal, vatTotal: order.vatTotal, total: order.total,
      items: order.items.map((item) => ({
        id: item.id, productVariantId: item.productVariantId, titleSnapshot: item.titleSnapshot,
        variantTitleSnapshot: item.variantTitleSnapshot, skuSnapshot: item.skuSnapshot,
        quantity: item.quantity, subtotal: item.subtotal, vatAmount: item.vatAmount,
      })),
    }));
    return sessionJson({ items, meta: body.meta });
  } catch {
    return sessionJson({ message: "Order history is temporarily unavailable. Please try again." }, 503);
  }
}
