import { sessionFetch, sessionJson as json } from "@/lib/customer-session";

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
    return json({ history });
  } catch { return json({ message: "Orders are temporarily unavailable." }, 503); }
}
