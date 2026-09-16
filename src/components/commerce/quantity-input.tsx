"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuantityInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label: string;
  className?: string;
}

export function QuantityInput({ value, onChange, min = 1, max = 999, label, className }: QuantityInputProps) {
  return (
    <div className={cn("inline-flex items-center rounded-lg border border-border-default", className)}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-11 w-11 rounded-r-none"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        aria-label={`Decrease ${label} quantity`}
      >
        <span aria-hidden className="material-symbols-outlined text-[18px]">
          remove
        </span>
      </Button>
      <input
        type="number"
        inputMode="numeric"
        className="h-11 w-12 [appearance:textfield] border-x border-border-default text-center text-body-md font-body-md tabular-nums focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        value={value}
        min={min}
        max={max}
        aria-label={`${label} quantity`}
        onChange={(e) => {
          const next = Number(e.target.value);
          if (!Number.isNaN(next)) onChange(Math.min(max, Math.max(min, next)));
        }}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-11 w-11 rounded-l-none"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        aria-label={`Increase ${label} quantity`}
      >
        <span aria-hidden className="material-symbols-outlined text-[18px]">
          add
        </span>
      </Button>
    </div>
  );
}
