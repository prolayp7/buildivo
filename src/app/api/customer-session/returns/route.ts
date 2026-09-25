import { backendErrorMessage, sessionFetch, sessionJson as json } from "@/lib/customer-session";

// Requests a return for one item of the signed-in customer's own delivered order.
export async function POST(req: Request) {
  if (req.headers.get("origin") !== new URL(req.url).origin) return json({ message: "Invalid request origin" }, 403);
  let input: { orderItemId?: unknown; reason?: unknown; comment?: unknown };
  try { input = await req.json(); } catch { return json({ message: "Invalid request" }, 400); }
  if (!Number.isInteger(input.orderItemId) || typeof input.reason !== "string" || !input.reason.trim()) return json({ message: "Choose a reason for the return." }, 400);
  const comment = typeof input.comment === "string" ? input.comment.trim().slice(0, 2000) : undefined;
  try {
    const response = await sessionFetch("returns", { method: "POST", body: JSON.stringify({ orderItemId: input.orderItemId, reason: input.reason.trim().slice(0, 500), comment: comment || undefined }) });
    if (!response) return json({ message: "Please sign in." }, 401);
    const body = await response.json().catch(() => ({}));
    if (!response.ok) return json({ message: backendErrorMessage(body, "The return could not be requested.") }, response.status);
    return json({ returnStatus: (body.data ?? body).returnStatus }, 201);
  } catch {
    return json({ message: "Returns are temporarily unavailable. Please try again." }, 503);
  }
}
