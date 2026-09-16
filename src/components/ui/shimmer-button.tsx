import React, { type ComponentPropsWithoutRef, type CSSProperties } from "react"

import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

export interface ShimmerButtonProps extends ComponentPropsWithoutRef<"button"> {
  asChild?: boolean
  shimmerColor?: string
  shimmerSize?: string
  borderRadius?: string
  shimmerDuration?: string
  background?: string
  className?: string
  children?: React.ReactNode
}

export const ShimmerButton = React.forwardRef<
  HTMLButtonElement,
  ShimmerButtonProps
>(
  (
    {
      asChild = false,
      shimmerColor = "#ffffff",
      shimmerSize = "0.05em",
      shimmerDuration = "3s",
      borderRadius = "100px",
      background = "rgba(0, 0, 0, 1)",
      className,
      children,
      ...props
    },
    ref
  ) => {
    const Component = asChild ? Slot.Root : "button"

    return (
      <Component
        style={
          {
            "--spread": "90deg",
            "--shimmer-color": shimmerColor,
            "--radius": borderRadius,
            "--speed": shimmerDuration,
            "--cut": shimmerSize,
            "--bg": background,
          } as CSSProperties
        }
        className={cn(
          "group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden [border-radius:var(--radius)] border border-white/10 px-6 py-3 whitespace-nowrap text-white [background:var(--bg)]",
          "transform-gpu transition-transform duration-150 ease-out active:translate-y-px motion-reduce:transform-none",
          className
        )}
        ref={ref}
        {...props}
      >
        {/* spark container */}
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none -z-30 blur-[2px] motion-reduce:hidden",
            "@container-[size] absolute inset-0 overflow-visible"
          )}
        >
          {/* spark */}
          <span className="animate-shimmer-slide absolute inset-0 aspect-[1] h-[100cqh] rounded-none [mask:none]">
            {/* spark before */}
            <span className="animate-spin-around absolute -inset-full w-auto [translate:0_0] rotate-0 [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))]" />
          </span>
        </span>
        <Slot.Slottable>{children}</Slot.Slottable>

        {/* Highlight */}
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 size-full",

            "rounded-2xl px-4 py-1.5 text-sm font-medium shadow-[inset_0_-8px_10px_#ffffff1f]",

            // transition
            "transform-gpu transition-shadow duration-200 ease-out",

            // on hover
            "group-hover:shadow-[inset_0_-6px_10px_#ffffff3f]",

            // on click
            "group-active:shadow-[inset_0_-10px_10px_#ffffff3f]"
          )}
        />

        {/* backdrop */}
        <span
          aria-hidden="true"
          className={cn(
            "absolute inset-(--cut) -z-20 [border-radius:var(--radius)] [background:var(--bg)]"
          )}
        />
      </Component>
    )
  }
)

ShimmerButton.displayName = "ShimmerButton"
