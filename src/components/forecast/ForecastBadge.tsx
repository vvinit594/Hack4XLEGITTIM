import { motion } from "framer-motion"
import { AlertCircle } from "lucide-react"

import { AnimatedBorderCard } from "@/components/ui/AnimatedBorderCard"
import { cn } from "@/lib/utils"

type ForecastBadgeProps = {
  pct4h: number
  pct8h: number
}

export function ForecastBadge({ pct4h, pct8h }: ForecastBadgeProps) {
  if (pct4h < 90 && pct8h < 90) return null

  const primary4h = pct4h >= 90
  const label = primary4h ? "4 Hours" : "8 Hours"
  const pct = primary4h ? pct4h : pct8h

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      className="mb-6 flex justify-center"
    >
      <AnimatedBorderCard
        radius="full"
        className="h-auto min-h-0 w-fit hover:scale-100 focus-within:scale-100"
        innerClassName="bg-transparent p-0 shadow-none group-hover:shadow-none group-focus-within:shadow-none"
      >
        <motion.div
          animate={{
            scale: [1, 1.02, 1],
            boxShadow: [
              "0 0 0 0px rgba(239, 68, 68, 0)",
              "0 0 0 4px rgba(239, 68, 68, 0.2)",
              "0 0 0 0px rgba(239, 68, 68, 0)",
            ],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-4 py-2",
            "border border-red-200 bg-red-50 text-red-700",
            "shadow-sm shadow-red-100"
          )}
        >
          <AlertCircle className="size-4 animate-pulse" />
          <span className="text-sm font-bold tracking-tight">
            ⚠️ Capacity crunch in {label} ({Math.round(pct)}%)
          </span>
        </motion.div>
      </AnimatedBorderCard>
    </motion.div>
  )
}
