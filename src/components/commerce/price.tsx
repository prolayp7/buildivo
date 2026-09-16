import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

interface PriceProps {
  priceIncVat: number;
  compareAtIncVat?: number;
  vatRate?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Price({ priceIncVat, compareAtIncVat, vatRate = 0.2, size = "md", className }: PriceProps) {
  const exVat = priceIncVat / (1 + vatRate);
  const sizeClass =
    size === "lg" ? "text-headline-md font-headline-md" : size === "sm" ? "text-body-md font-body-md" : "text-headline-sm font-headline-sm";

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex items-baseline gap-space-sm">
        <span className={cn(sizeClass, "font-bold text-orange-600")}>{formatPrice(priceIncVat)}</span>
        {compareAtIncVat && compareAtIncVat > priceIncVat && (
          <span className="text-label-md font-label-md text-text-disabled line-through">{formatPrice(compareAtIncVat)}</span>
        )}
      </div>
      <span className="text-label-sm font-label-sm text-text-secondary">{formatPrice(exVat)} ex. VAT</span>
    </div>
  );
}
