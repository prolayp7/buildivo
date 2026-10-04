import { backendErrorMessage, isSameOriginRequest, sessionFetch, sessionJson as json } from "@/lib/customer-session";

// The signed-in customer's return requests.
export async function GET() {
  try {
    const response = await sessionFetch("returns");
    if (!response) return json({ message: "Please sign in." }, 401);
    const body = await response.json().catch(() => ({}));
    if (!response.ok) return json({ message: backendErrorMessage(body, "Could not load your returns.") }, response.status);
    return json({ items: body.data ?? [] });
  } catch {
    return json({ message: "Returns are temporarily unavailable. Please try again." }, 503);
  }
}

// Creates a return: multipart with the details as JSON ("data") and each item's photos as evidence_<index>.
export async function POST(req: Request) {
  if (!isSameOriginRequest(req)) return json({ message: "Invalid request origin" }, 403);
  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.startsWith("multipart/form-data")) return json({ message: "Invalid request" }, 400);
  try {
    const response = await sessionFetch("returns", { method: "POST", headers: { "Content-Type": contentType }, body: await req.arrayBuffer() });
    if (!response) return json({ message: "Please sign in." }, 401);
    const body = await response.json().catch(() => ({}));
    if (!response.ok) return json({ message: backendErrorMessage(body, "The return could not be requested.") }, response.status);
    return json(body.data ?? body, 201);
  } catch {
    return json({ message: "Returns are temporarily unavailable. Please try again." }, 503);
  }
}
