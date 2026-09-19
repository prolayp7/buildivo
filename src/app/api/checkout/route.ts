import { apiBase, sessionFetch, sessionJson as json } from "@/lib/customer-session";

// Places an order on behalf of the browser so that a signed-in customer's httpOnly
// session cookie can be attached - a direct browser call has no bearer token, which
// would leave the order unlinked from their account.
export async function POST(req: Request) {
  if (req.headers.get("origin") !== new URL(req.url).origin) return json({ message: "Invalid request origin" }, 403);
  const body = await req.text();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const guestToken = req.headers.get("x-guest-token");
  const key = req.headers.get("idempotency-key");
  if (guestToken) headers["X-Guest-Token"] = guestToken;
  if (key) headers["Idempotency-Key"] = key;
  try {
    const response = (await sessionFetch("orders", { method: "POST", body, headers })) ?? (await fetch(`${apiBase()}/orders`, { method: "POST", body, headers, cache: "no-store", signal: AbortSignal.timeout(20000) }));
    return json(await response.json().catch(() => ({})), response.status);
  } catch { return json({ error: { message: "Checkout is temporarily unavailable. Please try again." } }, 503); }
}
