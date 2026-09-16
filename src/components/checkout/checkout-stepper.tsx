import { cn } from "@/lib/utils";

export const CHECKOUT_STEPS = [
  { id: 1, label: "Identity & Sign-in" },
  { id: 2, label: "Contact & Address" },
  { id: 3, label: "Delivery & Fulfilment" },
  { id: 4, label: "Payment Method" },
  { id: 5, label: "Review & Confirm" },
] as const;

export function CheckoutStepper({ current }: { current: number }) {
  return (
    <ol className="flex items-center gap-1 overflow-x-auto py-4 no-scrollbar" aria-label="Checkout progress">
      {CHECKOUT_STEPS.map((step, i) => {
        const state = step.id < current ? "done" : step.id === current ? "active" : "upcoming";
        return (
          <li key={step.id} className="flex shrink-0 items-center gap-1">
            <div className="flex items-center gap-2">
              <span
                aria-hidden
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-label-sm font-label-sm font-bold",
                  state === "done" && "bg-success-500 text-text-inverse",
                  state === "active" && "bg-orange-500 text-text-inverse",
                  state === "upcoming" && "bg-surface-container-low text-text-disabled",
                )}
              >
                {state === "done" ? (
                  <span className="material-symbols-outlined text-[16px]">check</span>
                ) : (
                  step.id
                )}
              </span>
              <span className={cn("whitespace-nowrap text-label-sm font-label-sm", state === "upcoming" ? "text-text-disabled" : "font-semibold text-text-primary")}>
                STEP {step.id}
                <span className="block text-label-md font-label-md">{step.label}</span>
              </span>
            </div>
            {i < CHECKOUT_STEPS.length - 1 && <span aria-hidden className="mx-2 h-px w-8 shrink-0 bg-border-default" />}
          </li>
        );
      })}
    </ol>
  );
}
