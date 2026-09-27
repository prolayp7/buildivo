import { backendErrorMessage, sessionFetch, sessionJson as json } from "@/lib/customer-session";

type OrderItem = { id: number; productId: number };
type Order = { status: string; placedAt: string; items: OrderItem[] };

// Submits a review for the signed-in customer. If they have bought this product the review is linked to that
// purchase (which is what makes it a "verified buyer" review); otherwise it is an ordinary, unverified review.
// Reviews are held for moderation by the API either way.
export async function POST(req: Request) {
  if (req.headers.get("origin") !== new URL(req.url).origin) return json({ message: "Invalid request origin" }, 403);
  let input: { productId?: unknown; rating?: unknown; title?: unknown; comment?: unknown };
  try { input = await req.json(); } catch { return json({ message: "Invalid request" }, 400); }
  const { productId, rating } = input;
  if (!Number.isInteger(productId) || !Number.isInteger(rating) || (rating as number) < 1 || (rating as number) > 5) return json({ message: "Choose a star rating from 1 to 5." }, 400);
  const title = typeof input.title === "string" ? input.title.trim().slice(0, 160) : undefined;
  const comment = typeof input.comment === "string" ? input.comment.trim().slice(0, 2000) : undefined;

  const submit = (orderItemId?: number) => sessionFetch("reviews", { method: "POST", body: JSON.stringify({ productId, rating, title: title || undefined, comment: comment || undefined, orderItemId }) });
  try {
    const orders = await sessionFetch("orders?perPage=100");
    if (!orders) return json({ message: "Please sign in to write a review." }, 401);
    if (orders.status === 401) return json({ message: "Please sign in to write a review." }, 401);

    const purchases = orders.ok
      ? (((await orders.json().catch(() => ({}))).data ?? []) as Order[])
          .filter((order) => !["CANCELLED", "FAILED"].includes(order.status))
          .sort((a, b) => +new Date(b.placedAt) - +new Date(a.placedAt))
          .flatMap((order) => order.items)
          .filter((item) => item.productId === productId)
          .slice(0, 5)
      : [];

    let sawConflict = false;
    for (const purchase of purchases) {
      const response = await submit(purchase.id);
      if (!response) return json({ message: "Please sign in to write a review." }, 401);
      if (response.status === 409) { sawConflict = true; continue; } // this purchase is already reviewed - try an earlier one
      if (!response.ok) return json({ message: backendErrorMessage(await response.json().catch(() => ({})), "Your review could not be submitted.") }, response.status);
      return json({ verified: true }, 201);
    }
    if (sawConflict) return json({ message: "You've already reviewed this product." }, 409);

    const response = await submit();
    if (!response) return json({ message: "Please sign in to write a review." }, 401);
    if (!response.ok) return json({ message: backendErrorMessage(await response.json().catch(() => ({})), "Your review could not be submitted.") }, response.status);
    return json({ verified: false }, 201);
  } catch {
    return json({ message: "Reviews are temporarily unavailable. Please try again." }, 503);
  }
}
