"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { FREE_DELIVERY_THRESHOLD } from "@/lib/checkout";

function useCountdown(startSeconds: number) {
  const [seconds, setSeconds] = useState(startSeconds);
  useEffect(() => {
    const id = window.setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => window.clearInterval(id);
  }, []);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${String(m).padStart(2, "0")}m`;
}

export function FreeDeliveryProgress({ subtotal }: { subtotal: number }) {
  const unlocked = subtotal >= FREE_DELIVERY_THRESHOLD;
  const pct = Math.min(100, Math.round((subtotal / FREE_DELIVERY_THRESHOLD) * 100));
  const remaining = FREE_DELIVERY_THRESHOLD - subtotal;
  const countdown = useCountdown(3 * 3600 + 18 * 60);

  return (
    <div className="rounded-xl border border-success-500/30 bg-success-100 p-4">
      <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <span aria-hidden className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-success-500 text-text-inverse">
            <span className="material-symbols-outlined text-[18px]">local_shipping</span>
          </span>
          <div>
            <p className="flex items-center gap-2 text-body-sm font-body-sm font-semibold text-success-500">
              {unlocked ? "You qualify for FREE Next-Day Courier Delivery!" : `Add ${formatPrice(remaining)} more for FREE Next-Day Delivery`}
              {unlocked && <span className="rounded-full bg-success-500 px-2 py-0.5 text-label-sm font-label-sm font-bold text-text-inverse">UNLOCKED</span>}
            </p>
            {unlocked && (
              <p className="text-label-sm font-label-sm text-success-500">
                Order within <span className="font-semibold">{countdown}</span> for guaranteed tomorrow dispatch to SW1A 1AA.
              </p>
            )}
          </div>
        </div>
        <Link href="/help" className="shrink-0 text-label-sm font-label-sm font-semibold text-success-500 underline">
          Delivery &amp; Fulfilment Terms
        </Link>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-success-500/20">
        <div className="h-full rounded-full bg-success-500 transition-all" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-1.5 flex items-center justify-between text-label-sm font-label-sm text-success-500">
        <span>{unlocked ? `${formatPrice(FREE_DELIVERY_THRESHOLD)} threshold reached` : `${formatPrice(subtotal)} of ${formatPrice(FREE_DELIVERY_THRESHOLD)}`}</span>
        <span>Subtotal {formatPrice(subtotal)} inc. VAT</span>
      </div>
    </div>
  );
}
