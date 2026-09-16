import type { StockStatus } from "@/types";
import { cn } from "@/lib/utils";

const CONFIG: Record<StockStatus, { label: string; dotClassName: string; textClassName: string }> = {
  "in-stock": { label: "In Stock", dotClassName: "bg-success-500", textClassName: "text-success-500" },
  "low-stock": { label: "Low Stock", dotClassName: "bg-warning-500", textClassName: "text-warning-500" },
  "out-of-stock": { label: "Out of Stock", dotClassName: "bg-error-500", textClassName: "text-error-500" },
  backorder: { label: "Available to Order", dotClassName: "bg-info-500", textClassName: "text-info-500" },
};

interface StockBadgeProps {
  status: StockStatus;
  count?: number;
  className?: string;
}

export function StockBadge({ status, count, className }: StockBadgeProps) {
  const config = CONFIG[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-label-sm font-label-sm font-medium", config.textClassName, className)}>
      <span aria-hidden className={cn("inline-block h-1.5 w-1.5 rounded-full", config.dotClassName)} />
      {config.label}
      {count !== undefined && status !== "out-of-stock" ? ` (${count} available)` : ""}
    </span>
  );
}
