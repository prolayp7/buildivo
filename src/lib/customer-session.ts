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
