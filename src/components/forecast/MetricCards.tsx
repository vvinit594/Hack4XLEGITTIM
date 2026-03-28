import { motion } from "framer-motion"
import { BedDouble, UserMinus, UserPlus } from "lucide-react"

import { AnimatedBorderCard } from "@/components/ui/AnimatedBorderCard"
import { cn } from "@/lib/utils"

type MetricCardProps = {
  title: string
  value: string | number
  icon: React.ReactNode
  iconBg: string
}

function MetricCard({ title, value, icon, iconBg }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="h-full"
    >
      <AnimatedBorderCard className="h-full" innerClassName="p-0">
        <div className="flex items-center justify-between p-5">
          <div className="space-y-1">
            <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
              {title}
            </p>
            <p className="text-2xl font-bold tracking-tight text-slate-900">
              {value}
            </p>
          </div>
          <div className={cn("rounded-xl p-2.5 shadow-sm", iconBg)}>{icon}</div>
        </div>
      </AnimatedBorderCard>
    </motion.div>
  )
}

type MetricCardsContainerProps = {
  currentOccupied: number
  expectedDischarges: number
  expectedAdmissions: number
}

export function MetricCardsContainer({
  currentOccupied,
  expectedDischarges,
  expectedAdmissions,
}: MetricCardsContainerProps) {
  return (
    <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
      <MetricCard
        title="Current Occupied"
        value={currentOccupied}
        icon={<BedDouble className="size-5 text-blue-600" />}
        iconBg="border border-blue-100 bg-blue-50/80"
      />
      <MetricCard
        title="Exp. Discharges (4h)"
        value={expectedDischarges}
        icon={<UserMinus className="size-5 text-emerald-600" />}
        iconBg="border border-emerald-100 bg-emerald-50/80"
      />
      <MetricCard
        title="Exp. Admissions (4h)"
        value={expectedAdmissions}
        icon={<UserPlus className="size-5 text-amber-600" />}
        iconBg="border border-amber-100 bg-amber-50/80"
      />
    </div>
  )
}
