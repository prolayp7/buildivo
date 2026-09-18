import { cookies } from "next/headers";
import { apiBase, backendErrorMessage, sessionJson } from "@/lib/customer-session";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, context: RouteParams) {
  const token = (await cookies()).get("buildivo.access")?.value;
  if (!token) return sessionJson({ message: "Please sign in to update this address." }, 401);
  const { id } = await context.params;
  if (!/^\d+$/.test(id)) return sessionJson({ message: "Invalid address ID." }, 400);
  let input;
  try { input = await req.json(); } catch { return sessionJson({ message: "Invalid request" }, 400); }
  try {
    const response = await fetch(`${apiBase()}/addresses/${id}`, { method: "PATCH", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(input), cache: "no-store", signal: AbortSignal.timeout(15000) });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) return sessionJson({ message: backendErrorMessage(body, "Could not update this address.") }, response.status);
    return sessionJson({ item: body.data });
  } catch {
    return sessionJson({ message: "Addresses are temporarily unavailable. Please try again." }, 503);
  }
}

export async function DELETE(req: Request, context: RouteParams) {
  const token = (await cookies()).get("buildivo.access")?.value;
  if (!token) return sessionJson({ message: "Please sign in to remove this address." }, 401);
  const { id } = await context.params;
  if (!/^\d+$/.test(id)) return sessionJson({ message: "Invalid address ID." }, 400);
  try {
    const response = await fetch(`${apiBase()}/addresses/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` }, cache: "no-store", signal: AbortSignal.timeout(15000) });
    if (response.status === 204) return new Response(null, { status: 204 });
    const body = await response.json().catch(() => ({}));
    return sessionJson({ message: backendErrorMessage(body, "Could not remove this address.") }, response.status);
  } catch {
    return sessionJson({ message: "Addresses are temporarily unavailable. Please try again." }, 503);
  }
}
