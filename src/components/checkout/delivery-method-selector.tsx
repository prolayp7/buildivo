"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DELIVERY_METHODS } from "@/lib/checkout";
import { formatPrice } from "@/lib/format";
import type { DeliveryMethodId } from "@/types";
import { cn } from "@/lib/utils";

interface DeliveryMethodSelectorProps {
  value: DeliveryMethodId;
  onChange: (value: DeliveryMethodId) => void;
}

export function DeliveryMethodSelector({ value, onChange }: DeliveryMethodSelectorProps) {
  return (
    <RadioGroup value={value} onValueChange={(v) => onChange(v as DeliveryMethodId)} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {DELIVERY_METHODS.map((method) => (
        <label
          key={method.id}
          htmlFor={`delivery-${method.id}`}
          className={cn(
            "flex cursor-pointer flex-col gap-1 rounded-xl border p-4 transition-colors",
            value === method.id ? "border-orange-500 bg-orange-50" : "border-border-default bg-surface-white",
          )}
        >
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-body-sm font-body-sm font-semibold text-text-primary">
              <span aria-hidden className="material-symbols-outlined text-[18px] text-graphite-600">{method.icon}</span>
              {method.label}
            </span>
            <RadioGroupItem value={method.id} id={`delivery-${method.id}`} />
          </div>
          <span className="text-label-sm font-label-sm font-bold text-success-500">{method.price === 0 ? "FREE" : formatPrice(method.price)}</span>
          <span className="text-label-sm font-label-sm text-text-secondary">{method.eta}</span>
        </label>
      ))}
    </RadioGroup>
  );
}
