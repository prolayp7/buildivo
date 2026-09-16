import { cn } from "@/lib/utils";

interface RatingProps {
  value: number;
  count?: number;
  className?: string;
}

export function Rating({ value, count, className }: RatingProps) {
  const rounded = Math.round(value * 2) / 2;
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <span className="sr-only">
        Rated {value} out of 5{count !== undefined ? ` from ${count} reviews` : ""}
      </span>
      <span aria-hidden className="flex items-center text-orange-500">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i + 1 <= rounded;
          const half = !filled && i + 0.5 === rounded;
          return (
            <span key={i} className="material-symbols-outlined text-[16px]" style={half ? { fontVariationSettings: "'FILL' 0" } : undefined}>
              {filled || half ? "star" : "star_outline"}
            </span>
          );
        })}
      </span>
      {count !== undefined && <span aria-hidden className="text-label-sm font-label-sm text-text-secondary">({count})</span>}
    </div>
  );
}
