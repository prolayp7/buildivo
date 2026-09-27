"use client";

import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { useFreeDeliveryThreshold } from "@/lib/use-free-delivery";

/** Progress towards the free-delivery threshold set in the admin's shipping methods; hidden when there is no such offer. */
export function FreeDeliveryProgress({ subtotal }: { subtotal: number }) {
  const threshold = useFreeDeliveryThreshold();
  if (threshold === null) return null;
  const unlocked = subtotal >= threshold;
  const pct = Math.min(100, Math.round((subtotal / threshold) * 100));
  const remaining = threshold - subtotal;

  return (
    <div className="rounded-xl border border-success-500/30 bg-success-100 p-4">
      <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <span aria-hidden className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-success-500 text-text-inverse">
            <span className="material-symbols-outlined text-[18px]">local_shipping</span>
          </span>
          <p className="flex items-center gap-2 text-body-sm font-body-sm font-semibold text-success-500">
            {unlocked ? "You qualify for FREE delivery!" : `Add ${formatPrice(remaining)} more for FREE delivery`}
            {unlocked && <span className="rounded-full bg-success-500 px-2 py-0.5 text-label-sm font-label-sm font-bold text-text-inverse">UNLOCKED</span>}
          </p>
        </div>
        <Link href="/help" className="shrink-0 text-label-sm font-label-sm font-semibold text-success-500 underline">
          Delivery information
        </Link>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-success-500/20">
        <div className="h-full rounded-full bg-success-500 transition-all" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-1.5 flex items-center justify-between text-label-sm font-label-sm text-success-500">
        <span>{unlocked ? `${formatPrice(threshold)} threshold reached` : `${formatPrice(subtotal)} of ${formatPrice(threshold)}`}</span>
        <span>Subtotal {formatPrice(subtotal)} inc. VAT</span>
      </div>
    </div>
  );
}
