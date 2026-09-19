import { backendErrorMessage, sessionFetch, sessionJson as json } from "@/lib/customer-session";

export async function POST(req: Request) {
  if (req.headers.get("origin") !== new URL(req.url).origin) return json({ message: "Invalid request origin" }, 403);
  let input;
  try { input = await req.json(); } catch { return json({ message: "Invalid request" }, 400); }
  if (typeof input.currentPassword !== "string" || typeof input.newPassword !== "string") return json({ message: "Enter your current and new password." }, 400);
  try {
    const response = await sessionFetch("me/password", { method: "POST", body: JSON.stringify({ currentPassword: input.currentPassword, newPassword: input.newPassword }) });
    if (!response) return json({ message: "Please sign in." }, 401);
    const body = await response.json().catch(() => ({}));
    if (!response.ok) return json({ message: backendErrorMessage(body, "Could not change your password.") }, response.status);
    return json({ ok: true });
  } catch { return json({ message: "Your account is temporarily unavailable." }, 503); }
}
