import { NextRequest, NextResponse } from "next/server";
import { apiBase, sessionFetch } from "@/lib/customer-session";

type Context = { params: Promise<{ path: string[] }> };

function allowedMethod(path: string[], method: string) {
  const key = path.join("/");
  if (key === "cart") return method === "GET";
  if (["cart/items", "cart/merge", "cart/coupon/validate"].includes(key)) return method === "POST";
  if (/^cart\/items\/\d+$/.test(key)) return method === "PATCH" || method === "DELETE";
  return /^bundles\/[^/]+\/add-to-cart$/.test(key) && method === "POST";
}

async function proxy(request: NextRequest, { params }: Context) {
  const { path } = await params;
  if (!allowedMethod(path, request.method)) return NextResponse.json({ message: "Unsupported cart request." }, { status: 404 });
  if (request.method !== "GET" && request.headers.get("origin") !== new URL(request.url).origin) {
    return NextResponse.json({ message: "Invalid request origin." }, { status: 403 });
  }

  const upstreamPath = path.map((segment) => encodeURIComponent(segment)).join("/");
  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  const guestToken = request.headers.get("x-guest-token");
  if (contentType) headers.set("content-type", contentType);
  if (guestToken) headers.set("x-guest-token", guestToken);
  const init: RequestInit = {
    method: request.method,
    headers,
    ...(request.method === "GET" ? {} : { body: await request.arrayBuffer() }),
  };

  try {
    const upstream = await sessionFetch(upstreamPath, init) ?? await fetch(`${apiBase()}/${upstreamPath}`, {
      ...init,
      cache: "no-store",
      signal: AbortSignal.timeout(20000),
    });
    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("content-type") ?? "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ message: "Cart service is temporarily unavailable." }, { status: 503 });
  }
}

export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
export const DELETE = proxy;