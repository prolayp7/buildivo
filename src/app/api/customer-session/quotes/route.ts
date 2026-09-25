import { cookies } from "next/headers";
import { apiBase, backendErrorMessage, sessionFetch, sessionJson } from "@/lib/customer-session";

export async function GET(request: Request) {
  const token = (await cookies()).get("buildivo.access")?.value;
  if (!token) return sessionJson({ message: "Please sign in to view your quote requests." }, 401);
  const page = Number(new URL(request.url).searchParams.get("page") ?? "1");
  if (!Number.isSafeInteger(page) || page < 1) return sessionJson({ message: "Invalid page." }, 400);
  try {
    const response = await fetch(`${apiBase()}/quotes?page=${page}&perPage=20`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store", signal: AbortSignal.timeout(15000) });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) return sessionJson({ message: response.status === 401 ? "Your session expired. Please sign in again." : backendErrorMessage(body, "Could not load your quote requests.") }, response.status);
    return sessionJson({ items: body.data ?? [], meta: body.meta });
  } catch {
    return sessionJson({ message: "Quote requests are temporarily unavailable. Please try again." }, 503);
  }
}

// Submits a quote request server-side so a signed-in customer's httpOnly session cookie is
// attached and the request shows up in their account; guests fall through unauthenticated.
export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) return sessionJson({ message: "Invalid request origin" }, 403);
  const body = await request.text();
  try {
    let response = await sessionFetch("quotes", { method: "POST", body });
    if (!response || response.status === 401) response = await fetch(`${apiBase()}/quotes`, { method: "POST", body, headers: { "Content-Type": "application/json" }, cache: "no-store", signal: AbortSignal.timeout(20000) });
    return sessionJson(await response.json().catch(() => ({})), response.status);
  } catch {
    return sessionJson({ message: "Quote requests are temporarily unavailable. Please try again." }, 503);
  }
}
