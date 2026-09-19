import { sessionFetch, sessionJson as json } from "@/lib/customer-session";

// Streams the invoice PDF the API renders on demand for a paid order.
export async function GET(_req: Request, context: { params: Promise<{ uuid: string }> }) {
  const { uuid } = await context.params;
  if (!/^[0-9a-f-]{36}$/i.test(uuid)) return json({ message: "Invalid order." }, 400);
  try {
    const response = await sessionFetch(`orders/${uuid}/invoice`);
    if (!response) return json({ message: "Please sign in." }, 401);
    if (!response.ok) return json({ message: response.status === 409 ? "An invoice is available once the order has been paid." : "Could not generate the invoice." }, response.status);
    return new Response(await response.arrayBuffer(), {
      headers: { "Content-Type": "application/pdf", "Content-Disposition": response.headers.get("content-disposition") ?? "attachment; filename=invoice.pdf", "Cache-Control": "no-store" },
    });
  } catch { return json({ message: "The invoice is temporarily unavailable." }, 503); }
}
