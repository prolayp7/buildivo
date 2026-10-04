import { NextRequest, NextResponse } from "next/server";
import { STOREFRONT_CATALOG_CACHE_TAG, STOREFRONT_CATALOG_REVALIDATE_SECONDS } from "@/lib/cache-tags";

const API_BASE = process.env.BUILDIVO_API_URL ?? "http://localhost:3000/api/v1";

export async function GET(request: NextRequest) {
  const url = `${API_BASE.replace(/\/$/, "")}/products${request.nextUrl.search}`;

  try {
    const response = await fetch(url, {
      next: { revalidate: STOREFRONT_CATALOG_REVALIDATE_SECONDS, tags: [STOREFRONT_CATALOG_CACHE_TAG] },
    });
    const payload = await response.json().catch(() => ({}));
    return NextResponse.json(payload, { status: response.status });
  } catch {
    return NextResponse.json({ message: "Products are temporarily unavailable." }, { status: 503 });
  }
}