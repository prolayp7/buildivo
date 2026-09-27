import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.BUILDIVO_API_URL ?? "http://localhost:3000/api/v1";

function localTargetPath(value: unknown): string | null {
  return typeof value === "string" && /^\/(?:p|c)\/[A-Za-z0-9_%/-]+$/.test(value) ? value : null;
}

function gonePage(targetPath: string | null) {
  const destination = targetPath ?? "/";
  const label = targetPath ? "Browse the related category" : "Browse products";
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex,follow"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Product no longer available</title></head><body style="margin:0;background:#f4f6f9;color:#101827;font:16px/1.5 system-ui,sans-serif"><main style="max-width:640px;margin:12vh auto;padding:32px"><p style="margin:0 0 8px;color:#6b7585;font-size:13px">Buildivo</p><h1 style="margin:0 0 12px;font-size:28px">Product no longer available</h1><p style="margin:0 0 24px;color:#4b5565">This product has been permanently removed.</p><a href="${destination}" style="color:#0950ad;font-weight:600">${label}</a></main></body></html>`;
}

export async function proxy(request: NextRequest) {
  const slug = request.nextUrl.pathname.split("/").filter(Boolean).at(-1);
  if (!slug) return NextResponse.next();

  try {
    const response = await fetch(`${API_BASE.replace(/\/$/, "")}/products/${encodeURIComponent(slug)}/route-resolution`, { cache: "no-store" });
    if (!response.ok) return NextResponse.next();
    const payload = await response.json();
    const resolution = payload.data ?? payload;

    if (resolution.action === "REDIRECT" && (resolution.statusCode === 301 || resolution.statusCode === 302)) {
      const targetPath = localTargetPath(resolution.targetPath);
      if (targetPath) return NextResponse.redirect(new URL(targetPath, request.url), resolution.statusCode);
    }

    if (resolution.action === "GONE") {
      return new NextResponse(gonePage(localTargetPath(resolution.targetPath)), {
        status: 410,
        headers: { "Content-Type": "text/html; charset=utf-8", "X-Robots-Tag": "noindex, follow" },
      });
    }
  } catch {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = { matcher: "/p/:slug" };