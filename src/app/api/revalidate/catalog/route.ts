import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { STOREFRONT_CATALOG_CACHE_TAG } from "@/lib/cache-tags";

export async function POST(request: Request) {
  const expected = process.env.STOREFRONT_REVALIDATION_SECRET;
  const received = request.headers.get("x-storefront-revalidation-secret") ?? "";

  if (!expected) return NextResponse.json({ message: "Revalidation is not configured." }, { status: 503 });
  const expectedBytes = Buffer.from(expected);
  const receivedBytes = Buffer.from(received);
  if (expectedBytes.length !== receivedBytes.length || !timingSafeEqual(expectedBytes, receivedBytes)) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  revalidateTag(STOREFRONT_CATALOG_CACHE_TAG, { expire: 0 });
  return NextResponse.json({ revalidated: true });
}