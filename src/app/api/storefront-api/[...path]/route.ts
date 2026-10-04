import { NextRequest, NextResponse } from "next/server";
import { apiBase, isSameOriginRequest } from "@/lib/customer-session";

type Context = { params: Promise<{ path: string[] }> };

function isAllowedRequest(method: string, path: string[]) {
  const key = path.join("/");
  const slug = /^[A-Za-z0-9][A-Za-z0-9-]*$/;

  if (method === "GET") {
    return ["brands", "calculators/materials", "calculators/products", "payments/methods", "products", "products/compare", "shipping-methods", "shipping-methods/free-delivery-threshold"].includes(key)
      || (path.length === 3 && path[0] === "products" && slug.test(path[1]) && ["frequently-bought-together", "recommendations"].includes(path[2]));
  }

  if (method !== "POST") return false;
  return ["auth/otp/send", "auth/register", "orders/track", "payments/attempts"].includes(key)
    || (path.length === 3 && path[0] === "products" && slug.test(path[1]) && path[2] === "questions")
    || (path.length === 4 && path[0] === "payments" && path[1] === "attempts" && slug.test(path[2]) && path[3] === "capture");
}

async function proxy(request: NextRequest, { params }: Context) {
  const { path } = await params;
  if (!isAllowedRequest(request.method, path)) {
    return NextResponse.json({ message: "Unsupported storefront request." }, { status: 404 });
  }
  if (request.method !== "GET" && !isSameOriginRequest(request)) {
    return NextResponse.json({ message: "Invalid request origin." }, { status: 403 });
  }

  const endpoint = `${apiBase()}/${path.map((segment) => encodeURIComponent(segment)).join("/")}${request.nextUrl.search}`;
  const headers = new Headers();
  for (const name of ["content-type", "idempotency-key"]) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }

  try {
    const response = await fetch(endpoint, {
      method: request.method,
      headers,
      ...(request.method === "POST" ? { body: await request.arrayBuffer() } : {}),
      cache: "no-store",
      signal: AbortSignal.timeout(20000),
    });
    return new Response(response.body, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") ?? "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ message: "Storefront service is temporarily unavailable." }, { status: 503 });
  }
}

export const GET = proxy;
export const POST = proxy;