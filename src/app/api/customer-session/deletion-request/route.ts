import { backendErrorMessage, sessionFetch, sessionJson as json } from "@/lib/customer-session";

export async function GET() {
  try {
    const response = await sessionFetch("me/deletion-request");
    if (!response) return json({ message: "Please sign in." }, 401);
    const text = await response.text();
    const body = text ? JSON.parse(text) : null;
    if (!response.ok) return json({ message: backendErrorMessage(body ?? {}, "Could not load your deletion request.") }, response.status);
    return json({ request: body && typeof body === "object" && "data" in body ? body.data : body });
  } catch { return json({ message: "Your account is temporarily unavailable." }, 503); }
}

export async function POST(req: Request) {
  if (req.headers.get("origin") !== new URL(req.url).origin) return json({ message: "Invalid request origin" }, 403);
  try {
    const response = await sessionFetch("me/deletion-request", { method: "POST", body: "{}" });
    if (!response) return json({ message: "Please sign in." }, 401);
    const body = await response.json().catch(() => ({}));
    if (!response.ok) return json({ message: backendErrorMessage(body, "Your deletion request could not be submitted.") }, response.status);
    return json(body.data ?? body);
  } catch { return json({ message: "Your account is temporarily unavailable." }, 503); }
}
