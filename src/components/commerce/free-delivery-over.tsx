"use client";

import { formatPrice } from "@/lib/format";
import { useFreeDeliveryThreshold } from "@/lib/use-free-delivery";

/** "Free delivery over £X" from the admin's shipping settings; renders nothing when there is no free-delivery offer. */
export function FreeDeliveryOver({ strong = false }: { strong?: boolean }) {
  const threshold = useFreeDeliveryThreshold();
  if (threshold === null) return null;
  return strong ? <><strong>FREE DELIVERY</strong> over {formatPrice(threshold)}</> : <>Free delivery over {formatPrice(threshold)}</>;
}
