"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  indeterminate?: boolean;
  /**
   * CSS color value to use for the Indicator background (e.g. "#fff", "rgb(0 0 0)", "hsl(var(--primary))").
   * When provided, it overrides the default Tailwind bg class via inline style.
   */
  indicatorColor?: string;
  /**
   * Additional class names to apply to the Indicator (e.g. Tailwind classes like "bg-red-500").
   * Note: dynamic Tailwind color classes must be safelisted to avoid purge.
   */
  indicatorClassName?: string;
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(
  (
    {
      className,
      value,
      indeterminate = false,
      indicatorColor,
      indicatorClassName,
      ...props
    },
    ref
  ) => (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-full bg-primary/20",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          "h-full w-full flex-1 transition-all",
          !indicatorColor && "bg-primary",
          indeterminate && "animate-progress origin-left",
          indicatorClassName
        )}
        style={{
          transform: `translateX(-${100 - (value || 0)}%)`,
          ...(indicatorColor ? { backgroundColor: indicatorColor } : {}),
        }}
      />
    </ProgressPrimitive.Root>
  )
);
Progress.displayName = ProgressPrimitive.Root.displayName;

const CircleProgress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, color, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      `relative h-6 w-6 overflow-hidden rounded-full bg-transparent flex justify-center items-center`,
      className
    )}
    {...props}
    style={{
      background: `radial-gradient(closest-side, #1A1A1A 70%, transparent 71% 100%), conic-gradient(${color} ${
        value || 0
      }%, #8c8c8c 0)`,
    }}
  />
));

export { Progress, CircleProgress };
