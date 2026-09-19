import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const apiBase = () => (process.env.BUILDIVO_API_URL ?? "http://localhost:3000/api/v1").replace(/\/$/, "");

const options = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/" };

export async function saveSession(data: { accessToken: string; refreshToken: string }, remember: boolean) {
  const jar = await cookies();
  jar.set("buildivo.access", data.accessToken, { ...options, ...(remember ? { maxAge: 30 * 86400 } : {}) });
  jar.set("buildivo.refresh", data.refreshToken, { ...options, ...(remember ? { maxAge: 30 * 86400 } : {}) });
  jar.set("buildivo.remember", remember ? "1" : "0", { ...options, ...(remember ? { maxAge: 30 * 86400 } : {}) });
}

export async function clearSession() {
  const jar = await cookies();
  for (const key of ["buildivo.access", "buildivo.refresh", "buildivo.remember"]) jar.delete(key);
}

export function sessionJson(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

// The API always wraps errors as {error:{code,message}} - surface that real
// message instead of a generic one, so e.g. "verify your email" and "account
// suspended" reach the user instead of being flattened into one string.
export function backendErrorMessage(body: unknown, fallback: string): string {
  if (body && typeof body === "object" && "error" in body) {
    const message = (body as { error?: { message?: unknown } }).error?.message;
    if (typeof message === "string") return message;
  }
  return fallback;
}

/** Calls the API as the signed-in customer (httpOnly cookie token), transparently
 * refreshing an expired access token once. Returns the raw API response, or null when there is no session. */
export async function sessionFetch(path: string, init: RequestInit = {}): Promise<Response | null> {
  const jar = await cookies();
  let token = jar.get("buildivo.access")?.value;
  const refreshToken = jar.get("buildivo.refresh")?.value;
  if (!token && !refreshToken) return null;
  const call = (bearer: string | undefined) => {
    const headers = new Headers(init.headers);
    if (bearer) headers.set("Authorization", `Bearer ${bearer}`);
    if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
    return fetch(`${apiBase()}/${path.replace(/^\//, "")}`, { ...init, headers, cache: "no-store", signal: AbortSignal.timeout(20000) });
  };
  let response = token ? await call(token) : null;
  if ((!response || response.status === 401) && refreshToken) {
    const refresh = await fetch(`${apiBase()}/auth/refresh`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ refreshToken }), cache: "no-store", signal: AbortSignal.timeout(15000) });
    if (refresh.ok) {
      const body = await refresh.json();
      const data = body.data ?? body;
      token = data.accessToken;
      await saveSession(data, jar.get("buildivo.remember")?.value === "1");
      response = await call(token);
    } else if (!response) return null;
  }
  return response;
}
