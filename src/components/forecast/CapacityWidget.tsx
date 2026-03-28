import { motion } from "framer-motion"

import { AnimatedBorderCard } from "@/components/ui/AnimatedBorderCard"
import { cn } from "@/lib/utils"

import { GaugeBar } from "./GaugeBar"

type CapacityForecastData = {
  forecast_4h: number
  forecast_8h: number
  pct_4h: number
  pct_8h: number
  risk_level: "safe" | "warning" | "critical"
}

type CapacityWidgetProps = {
  data: CapacityForecastData
}

export function CapacityWidget({ data }: CapacityWidgetProps) {
  const isCritical = data.pct_4h >= 90 || data.pct_8h >= 90

  return (
    <AnimatedBorderCard radius="3xl" innerClassName="p-0 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{
          opacity: 1,
          y: 0,
          boxShadow: isCritical
            ? "0 20px 50px -12px rgba(239, 68, 68, 0.18)"
            : "0 10px 25px -5px rgba(0, 0, 0, 0.04)",
        }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "relative overflow-hidden bg-card p-6 transition-all duration-500 sm:p-10",
          isCritical && "ring-1 ring-red-100/60"
        )}
      >
        <div
          className={cn(
            "absolute top-0 right-0 h-1/3 w-1/3 translate-x-1/2 rounded-full blur-3xl transition-colors duration-1000",
            isCritical ? "bg-red-50/70" : "bg-blue-50/50"
          )}
        />

        <div className="relative flex flex-col items-stretch gap-12 lg:flex-row lg:gap-20">
          <GaugeBar
            value={data.pct_4h}
            absoluteValue={data.forecast_4h}
            label="4h Forecast"
          />

          <div className="my-4 hidden w-px self-stretch bg-gradient-to-b from-transparent via-slate-200 to-transparent opacity-70 lg:block" />

          <GaugeBar
            value={data.pct_8h}
            absoluteValue={data.forecast_8h}
            label="8h Forecast"
          />
        </div>
      </motion.div>
    </AnimatedBorderCard>
  )
}
