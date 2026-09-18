import { cookies } from "next/headers";
import { apiBase, backendErrorMessage, sessionJson } from "@/lib/customer-session";

export async function PATCH(req: Request, context: { params: Promise<{ uuid: string }> }) {
  const token = (await cookies()).get("buildivo.access")?.value;
  if (!token) return sessionJson({ message: "Please sign in to respond to this quote." }, 401);
  const { uuid } = await context.params;
  try {
    const response = await fetch(`${apiBase()}/quotes/${uuid}/decline`, { method: "PATCH", headers: { Authorization: `Bearer ${token}` }, cache: "no-store", signal: AbortSignal.timeout(15000) });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) return sessionJson({ message: backendErrorMessage(body, "Could not decline this quote.") }, response.status);
    return sessionJson({ item: body.data });
  } catch {
    return sessionJson({ message: "Quote requests are temporarily unavailable. Please try again." }, 503);
  }
}
