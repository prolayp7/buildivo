import { backendErrorMessage, sessionFetch, sessionJson as json } from "@/lib/customer-session";

// Return detail, returnable items of an order, private evidence photos (GET) and cancel (POST).
async function forward(req: Request, context: { params: Promise<{ path: string[] }> }) {
  if (req.method === "POST" && req.headers.get("origin") !== new URL(req.url).origin) return json({ message: "Invalid request origin" }, 403);
  const { path } = await context.params;
  try {
    const response = await sessionFetch(`returns/${path.map(encodeURIComponent).join("/")}`, { method: req.method });
    if (!response) return json({ message: "Please sign in." }, 401);
    const type = response.headers.get("content-type") ?? "";
    if (response.ok && type.startsWith("image/")) return new Response(response.body, { headers: { "Content-Type": type, "Cache-Control": "private, no-store" } });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) return json({ message: backendErrorMessage(body, "This return could not be loaded.") }, response.status);
    return json(body.data ?? body);
  } catch {
    return json({ message: "Returns are temporarily unavailable. Please try again." }, 503);
  }
}

export { forward as GET, forward as POST };
