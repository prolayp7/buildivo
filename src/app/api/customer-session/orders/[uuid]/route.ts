import { sessionFetch, sessionJson as json } from "@/lib/customer-session";
import { API_ORIGIN } from "@/lib/api";
import { resolveMediaUrl } from "@/lib/adapters";

export async function GET(_req: Request, context: { params: Promise<{ uuid: string }> }) {
  const { uuid } = await context.params;
  if (!/^[0-9a-f-]{36}$/i.test(uuid)) return json({ message: "Invalid order." }, 400);
  try {
    const response = await sessionFetch(`orders/${uuid}`);
    if (!response) return json({ message: "Please sign in." }, 401);
    if (!response.ok) return json({ message: response.status === 404 ? "Order not found." : "Could not load this order." }, response.status);
    const body = await response.json();
    const order = body.data ?? body;
    const history = Array.isArray(order.statusHistory)
      ? order.statusHistory.flatMap((entry: unknown) => {
        if (!entry || typeof entry !== "object") return [];
        const { toStatus, createdAt } = entry as { toStatus?: unknown; createdAt?: unknown };
        return typeof toStatus === "string" && typeof createdAt === "string" ? [{ toStatus, createdAt }] : [];
      })
      : [];
    const shipment = Array.isArray(order.shipments) ? order.shipments[0] : undefined;
    return json({
      history,
      order: {
        uuid: order.uuid, orderNumber: order.orderNumber, email: order.email, status: order.status, paymentStatus: order.paymentStatus, placedAt: order.placedAt,
        shippingFullName: order.shippingFullName, shippingCompanyName: order.shippingCompanyName,
        shippingLine1: order.shippingLine1, shippingLine2: order.shippingLine2, shippingCity: order.shippingCity, shippingPostcode: order.shippingPostcode,
        shippingMethodTitle: order.shippingMethod?.title ?? null,
        trackingCarrier: order.trackingCarrier ?? shipment?.carrier ?? null, trackingNumber: order.trackingNumber ?? shipment?.trackingNumber ?? null,
        trackingUrl: order.trackingUrl ?? shipment?.trackingUrl ?? null,
        subtotal: order.subtotal, discountTotal: order.discountTotal, shippingCharge: order.shippingCharge, vatTotal: order.vatTotal,
        giftCardDiscount: order.giftCardDiscount, total: order.total, couponCode: order.couponCode,
        items: (order.items ?? []).map((item: Record<string, unknown>) => ({
          id: item.id, productVariantId: item.productVariantId, titleSnapshot: item.titleSnapshot, variantTitleSnapshot: item.variantTitleSnapshot,
          skuSnapshot: item.skuSnapshot, imageUrl: resolveMediaUrl(API_ORIGIN, item.imageUrl as string | null), quantity: item.quantity, unitPrice: item.unitPrice, subtotal: item.subtotal, vatAmount: item.vatAmount,
          returnEligible: item.returnEligible, returnDeadline: item.returnDeadline, returnItems: item.returnItems ?? [],
        })),
      },
    });
  } catch { return json({ message: "Orders are temporarily unavailable." }, 503); }
}
