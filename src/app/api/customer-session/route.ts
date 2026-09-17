import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const base = () => (process.env.BUILDIVO_API_URL ?? "http://localhost:3000/api/v1").replace(/\/$/, "");
const options = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/" };
async function saveSession(data: { accessToken: string; refreshToken: string }, remember: boolean) {
  const jar = await cookies();
  jar.set("buildivo.access", data.accessToken, { ...options, ...(remember ? { maxAge: 30 * 86400 } : {}) });
  jar.set("buildivo.refresh", data.refreshToken, { ...options, ...(remember ? { maxAge: 30 * 86400 } : {}) });
  jar.set("buildivo.remember", remember ? "1" : "0", { ...options, ...(remember ? { maxAge: 30 * 86400 } : {}) });
}
async function clearSession() { const jar = await cookies(); for (const key of ["buildivo.access", "buildivo.refresh", "buildivo.remember"]) jar.delete(key); }
const json = (data: unknown, status = 200) => NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
export async function POST(req: Request) {
  if (req.headers.get("origin") !== new URL(req.url).origin) return json({ message: "Invalid request origin" }, 403);
  let input;
  try { input = await req.json(); } catch { return json({ message: "Invalid request" }, 400); }
  if (typeof input.email !== "string" || typeof input.password !== "string" || !input.password || input.password.length > 128) return json({ message: "Enter your email and password." }, 400);
  try {
    const response = await fetch(`${base()}/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: input.email.trim(), password: input.password }), cache: "no-store", signal: AbortSignal.timeout(15000) });
    const body = await response.json();
    if (!response.ok) return json({ message: response.status === 401 ? "Incorrect email or password." : "Unable to sign in. Please try again." }, response.status);
    const data = body.data ?? body;
    if (!data.accessToken || !data.refreshToken) return json({ message: "Unable to start your session." }, 502);
    await saveSession(data, input.remember === true);
    return json({ customer: data.customer });
  } catch { return json({ message: "Sign-in is temporarily unavailable. Please try again." }, 503); }
}
export async function GET() {
  const jar = await cookies(); let token = jar.get("buildivo.access")?.value;
  if (!token) return json({ message: "Please sign in." }, 401);
  try {
    const me = () => fetch(`${base()}/me`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store", signal: AbortSignal.timeout(15000) });
    let response = await me();
    if (response.status === 401 && jar.get("buildivo.refresh")?.value) {
      const refresh = await fetch(`${base()}/auth/refresh`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ refreshToken: jar.get("buildivo.refresh")?.value }), cache: "no-store", signal: AbortSignal.timeout(15000) });
      if (refresh.ok) { const body = await refresh.json(); const data = body.data ?? body; token = data.accessToken; await saveSession(data, jar.get("buildivo.remember")?.value === "1"); response = await me(); }
    }
    if (!response.ok) { if(response.status === 401) await clearSession(); return json({ message: "Could not load your account." }, response.status); }
    const body = await response.json(); return json({ customer: body.data ?? body });
  } catch { return json({ message: "Your account is temporarily unavailable." }, 503); }
}
export async function DELETE(req: Request) {
  if (req.headers.get("origin") !== new URL(req.url).origin) return json({ message: "Invalid request origin" }, 403);
  const token = (await cookies()).get("buildivo.refresh")?.value;
  if (token) { try { await fetch(`${base()}/auth/logout`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ refreshToken: token }), signal: AbortSignal.timeout(10000) }); } catch { /* Clear the local session even when the API is unavailable. */ } }
  await clearSession(); return json({ ok: true });
}
