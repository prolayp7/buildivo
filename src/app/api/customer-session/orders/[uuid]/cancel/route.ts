import { backendErrorMessage, sessionFetch, sessionJson as json } from "@/lib/customer-session";

// Cancels one of the signed-in customer's own orders (the API refuses anything already packed or shipped).
export async function PATCH(req: Request, context: { params: Promise<{ uuid: string }> }) {
  if (req.headers.get("origin") !== new URL(req.url).origin) return json({ message: "Invalid request origin" }, 403);
  const { uuid } = await context.params;
  if (!/^[0-9a-f-]{36}$/i.test(uuid)) return json({ message: "Invalid order." }, 400);
  let input: { reason?: unknown } = {};
  try { input = await req.json(); } catch { /* the reason is optional */ }
  const reason = typeof input.reason === "string" ? input.reason.trim().slice(0, 500) : undefined;
  try {
    const response = await sessionFetch(`orders/${uuid}/cancel`, { method: "PATCH", body: JSON.stringify({ reason: reason || undefined }) });
    if (!response) return json({ message: "Please sign in." }, 401);
    const body = await response.json().catch(() => ({}));
    if (!response.ok) return json({ message: backendErrorMessage(body, "This order could not be cancelled.") }, response.status);
    return json({ status: (body.data ?? body).status });
  } catch {
    return json({ message: "Orders are temporarily unavailable. Please try again." }, 503);
  }
}
