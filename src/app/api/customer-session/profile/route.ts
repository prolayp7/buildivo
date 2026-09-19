import { backendErrorMessage, sessionFetch, sessionJson as json } from "@/lib/customer-session";

export async function PATCH(req: Request) {
  if (req.headers.get("origin") !== new URL(req.url).origin) return json({ message: "Invalid request origin" }, 403);
  let input;
  try { input = await req.json(); } catch { return json({ message: "Invalid request" }, 400); }
  const patch = { firstName: input.firstName, lastName: input.lastName, phone: input.phone };
  try {
    const response = await sessionFetch("me", { method: "PATCH", body: JSON.stringify(patch) });
    if (!response) return json({ message: "Please sign in." }, 401);
    const body = await response.json().catch(() => ({}));
    if (!response.ok) return json({ message: backendErrorMessage(body, "Could not update your details.") }, response.status);
    return json({ customer: body.data ?? body });
  } catch { return json({ message: "Your account is temporarily unavailable." }, 503); }
}
