import { cookies } from "next/headers";
import { apiBase, backendErrorMessage, sessionJson } from "@/lib/customer-session";

export async function GET() {
  const token = (await cookies()).get("buildivo.access")?.value;
  if (!token) return sessionJson({ message: "Please sign in to view your addresses." }, 401);
  try {
    const response = await fetch(`${apiBase()}/addresses`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store", signal: AbortSignal.timeout(15000) });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) return sessionJson({ message: response.status === 401 ? "Your session expired. Please sign in again." : backendErrorMessage(body, "Could not load your addresses.") }, response.status);
    return sessionJson({ items: body.data ?? [] });
  } catch {
    return sessionJson({ message: "Addresses are temporarily unavailable. Please try again." }, 503);
  }
}

export async function POST(req: Request) {
  const token = (await cookies()).get("buildivo.access")?.value;
  if (!token) return sessionJson({ message: "Please sign in to save an address." }, 401);
  let input;
  try { input = await req.json(); } catch { return sessionJson({ message: "Invalid request" }, 400); }
  try {
    const response = await fetch(`${apiBase()}/addresses`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(input), cache: "no-store", signal: AbortSignal.timeout(15000) });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) return sessionJson({ message: backendErrorMessage(body, "Could not save this address.") }, response.status);
    return sessionJson({ item: body.data }, 201);
  } catch {
    return sessionJson({ message: "Addresses are temporarily unavailable. Please try again." }, 503);
  }
}
