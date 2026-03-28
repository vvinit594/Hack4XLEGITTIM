import { motion, useReducedMotion } from "framer-motion"
import type { LucideIcon } from "lucide-react"

import { AnimatedBorderCard } from "@/components/ui/AnimatedBorderCard"
import { cn } from "@/lib/utils"
type RoleCardProps = {
  title: string
  description: string
  icon: LucideIcon
  theme: {
    iconBg: string
    selectedRing: string
  }
  selected: boolean
  onSelect: () => void
}

export function RoleCard({
  title,
  description,
  icon: Icon,
  theme,
  selected,
  onSelect,
}: RoleCardProps) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      initial={false}
      animate={selected ? { scale: 1.02 } : { scale: 1 }}
      whileHover={
        reduceMotion ? undefined : { scale: selected ? 1.02 : 1.03, y: -2 }
      }
      whileTap={reduceMotion ? undefined : { scale: 0.98 }}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
      aria-label={`Select ${title} role`}
      className={cn(
        "block w-full text-left outline-none",
        "focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
        selected && theme.selectedRing
      )}
    >
      <AnimatedBorderCard
        className={cn(
          "h-full min-h-[7.5rem] transition-shadow",
          selected && "shadow-lg shadow-indigo-500/15"
        )}
        innerClassName="p-0"
      >
        <div
          className={cn(
            "flex h-full flex-col gap-2 p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5",
            selected && "bg-indigo-50/40"
          )}
        >
          <span
            className={cn(
              "flex size-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg",
              theme.iconBg
            )}
          >
            <Icon className="size-6" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-foreground text-base font-bold text-slate-900">
              {title}
            </p>
            <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed sm:text-sm">
              {description}
            </p>
          </div>
        </div>
      </AnimatedBorderCard>
    </motion.button>
  )
}
