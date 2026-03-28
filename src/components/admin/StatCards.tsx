import { motion } from "framer-motion"
import type { ReactNode } from "react"

import { AnimatedBorderCard } from "@/components/ui/AnimatedBorderCard"
import { cn } from "@/lib/utils"

type StatCardProps = {
  title: string
  value: string | number
  icon: ReactNode
  trend?: string
  trendPositive?: boolean
  gradient: string
}

export function StatCard({
  title,
  value,
  icon,
  trend,
  trendPositive,
  gradient,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full"
    >
      <AnimatedBorderCard className="h-full" innerClassName="p-0 overflow-hidden">
        <div className="relative overflow-hidden p-6">
          <div
            className={cn(
              "absolute top-0 right-0 h-24 w-24 translate-x-1/2 rounded-full opacity-20 blur-3xl",
              gradient
            )}
          />

          <div className="relative flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                {title}
              </p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold tracking-tight text-slate-900">
                  {value}
                </h3>
                {trend && (
                  <span
                    className={cn(
                      "rounded-md px-1.5 py-0.5 text-[10px] font-bold",
                      trendPositive
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-red-50 text-red-600"
                    )}
                  >
                    {trend}
                  </span>
                )}
              </div>
            </div>
            <div
              className={cn(
                "rounded-xl p-3 text-white shadow-lg",
                gradient
              )}
            >
              {icon}
            </div>
          </div>
        </div>
      </AnimatedBorderCard>
    </motion.div>
  )
}

export function StatBar({ stats }: { stats: StatCardProps[] }) {
  return (
    <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, i) => (
        <StatCard key={i} {...stat} />
      ))}
    </div>
  )
}
