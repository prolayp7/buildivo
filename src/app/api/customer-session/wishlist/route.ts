import { sessionFetch, sessionJson } from "@/lib/customer-session";

// Mirrors the browser wishlist (a list of product ids) to the signed-in customer's account.
// A guest is not an error: GET answers { signedIn: false } so the client can skip syncing quietly.
export async function GET() {
  try {
    const response = await sessionFetch("wishlist");
    if (!response || response.status === 401) return sessionJson({ signedIn: false });
    if (!response.ok) return sessionJson({ message: "Your saved items are temporarily unavailable." }, 503);
    const body = await response.json();
    const items = (body.data?.items ?? []) as { productVariant: { product: { id: number } } }[];
    return sessionJson({ signedIn: true, productIds: [...new Set(items.map((item) => item.productVariant.product.id))] });
  } catch {
    return sessionJson({ message: "Your saved items are temporarily unavailable." }, 503);
  }
}

export async function POST(req: Request) {
  if (req.headers.get("origin") !== new URL(req.url).origin) return sessionJson({ message: "Invalid request origin" }, 403);
  let input: { productId?: unknown; saved?: unknown };
  try { input = await req.json(); } catch { return sessionJson({ message: "Invalid request" }, 400); }
  if (!Number.isInteger(input.productId) || (input.productId as number) < 1 || typeof input.saved !== "boolean") return sessionJson({ message: "Invalid request" }, 400);
  try {
    const response = await sessionFetch(`wishlist/products/${input.productId}`, { method: input.saved ? "POST" : "DELETE" });
    if (!response) return sessionJson({ message: "Please sign in." }, 401);
    return sessionJson({ ok: response.ok }, response.ok ? 200 : response.status);
  } catch {
    return sessionJson({ message: "Your saved items are temporarily unavailable." }, 503);
  }
}
