import { useReducedMotion } from "framer-motion"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

const RADIUS = {
  "2xl": {
    outer: "rounded-2xl",
    clip: "rounded-2xl",
    inner: "rounded-[0.9375rem]",
  },
  "3xl": {
    outer: "rounded-3xl",
    clip: "rounded-3xl",
    inner: "rounded-[calc(1.5rem-2px)]",
  },
  full: {
    outer: "rounded-full",
    clip: "rounded-full",
    inner: "rounded-full",
  },
} as const

type AnimatedBorderCardProps = {
  children: ReactNode
  className?: string
  innerClassName?: string
  /** Default card corners; use `3xl` for hero widgets; `full` for pills/badges */
  radius?: keyof typeof RADIUS
}

export function AnimatedBorderCard({
  children,
  className,
  innerClassName,
  radius = "2xl",
}: AnimatedBorderCardProps) {
  const reduceMotion = useReducedMotion()
  const r = RADIUS[radius]

  return (
    <div
      className={cn(
        "group relative h-full p-[2px] shadow-sm transition-all duration-300 ease-out",
        r.outer,
        "hover:scale-[1.02] hover:shadow-xl hover:shadow-indigo-500/[0.12]",
        "focus-within:scale-[1.02] focus-within:shadow-xl focus-within:shadow-indigo-500/[0.12]",
        className
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0 overflow-hidden",
          r.clip
        )}
        aria-hidden
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={cn(
              "aspect-square w-[min(220%,42rem)] shrink-0 rounded-full",
              "bg-[conic-gradient(from_0deg,#3b82f6,#6366f1,#a855f7,#ec4899,#3b82f6)]",
              "opacity-[0.72] blur-[2.5px] transition-all duration-300",
              "group-hover:opacity-[0.88] group-hover:blur-[3px]",
              "group-focus-within:opacity-[0.88] group-focus-within:blur-[3px]",
              !reduceMotion && "animate-spin-slow"
            )}
          />
        </div>
      </div>

      <div
        className={cn(
          "relative z-10 flex h-full min-h-0 flex-col bg-card p-6 shadow-sm transition-shadow duration-300",
          r.inner,
          "group-hover:shadow-md",
          "group-focus-within:shadow-md",
          innerClassName
        )}
      >
        {children}
      </div>
    </div>
  )
}
