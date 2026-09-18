import { apiBase, backendErrorMessage, saveSession, sessionJson as json } from "@/lib/customer-session";

export async function POST(req: Request) {
  if (req.headers.get("origin") !== new URL(req.url).origin) return json({ message: "Invalid request origin" }, 403);
  let input;
  try { input = await req.json(); } catch { return json({ message: "Invalid request" }, 400); }
  if (typeof input.email !== "string" || typeof input.code !== "string" || !input.code) return json({ message: "Enter the code sent to your email." }, 400);
  try {
    const response = await fetch(`${apiBase()}/auth/otp/verify`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: input.email.trim(), purpose: "email_verification", code: input.code.trim() }), cache: "no-store", signal: AbortSignal.timeout(15000) });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) return json({ message: backendErrorMessage(body, "That code is invalid or has expired.") }, response.status);
    const data = body.data ?? body;
    if (!data.accessToken || !data.refreshToken) return json({ message: "Verification succeeded, but we couldn't start your session. Please sign in." }, 502);
    await saveSession(data, true);
    return json({ customer: data.customer });
  } catch { return json({ message: "Verification is temporarily unavailable. Please try again." }, 503); }
}
