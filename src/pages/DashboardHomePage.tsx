import { motion, useReducedMotion } from "framer-motion"
import {
  ArrowRight,
  BedDouble,
  Package,
  Siren,
  TrendingUp,
  UserRoundPlus,
} from "lucide-react"
import { Link } from "react-router-dom"

import { AnimatedBorderCard } from "@/components/ui/AnimatedBorderCard"
import { cn } from "@/lib/utils"

const cards = [
  {
    to: "/app/bed-board",
    title: "Bed Board",
    desc: "Live grid, participants, and status control.",
    icon: BedDouble,
    iconClass: "text-indigo-600",
    ctaClass: "text-indigo-600",
  },
  {
    to: "/app/admissions",
    title: "Admissions & flow",
    desc: "Discharges, arrivals, and elective schedule.",
    icon: UserRoundPlus,
    iconClass: "text-emerald-600",
    ctaClass: "text-emerald-600",
  },
  {
    to: "/app/inventory",
    title: "Inventory",
    desc: "Equipment, stock levels, reservations, and shortage alerts.",
    icon: Package,
    iconClass: "text-amber-600",
    ctaClass: "text-amber-600",
  },
  {
    to: "/app/outbreak",
    title: "Outbreak",
    desc: "Disease spikes, clusters, and instant authority notifications.",
    icon: Siren,
    iconClass: "text-red-600",
    ctaClass: "text-red-600",
  },
  {
    to: "/app/forecast",
    title: "Forecast",
    desc: "Capacity outlook (coming soon).",
    icon: TrendingUp,
    iconClass: "text-violet-600",
    ctaClass: "text-violet-600",
  },
] as const

export function DashboardHomePage() {
  const reduceMotion = useReducedMotion()

  return (
    <div className="bg-background flex min-h-0 flex-1 flex-col p-6 lg:p-8">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl text-sm sm:text-base">
          Hospi-Track mission control — pick a workspace or use the sidebar to
          move between modules.
        </p>
      </motion.div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        {cards.map((c, i) => (
          <motion.div
            key={c.to}
            className="h-full min-h-[11rem]"
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: reduceMotion ? 0 : 0.06 * i,
              duration: 0.4,
              ease: [0.22, 1, 0.36, 1] as const,
            }}
          >
            <AnimatedBorderCard className="h-full">
              <Link
                to={c.to}
                className={cn(
                  "group/link flex h-full min-h-0 flex-col outline-none",
                  "focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-card rounded-[0.9375rem]"
                )}
              >
                <c.icon
                  className={cn("size-8 opacity-90", c.iconClass)}
                  aria-hidden
                />
                <h2 className="text-foreground mt-4 text-lg font-bold tracking-tight">
                  {c.title}
                </h2>
                <p className="text-muted-foreground mt-2 flex-1 text-sm leading-relaxed">
                  {c.desc}
                </p>
                <span
                  className={cn(
                    "mt-4 inline-flex items-center gap-1 text-sm font-semibold",
                    c.ctaClass
                  )}
                >
                  Open
                  <ArrowRight className="size-4 transition-transform duration-300 group-hover/link:translate-x-0.5" />
                </span>
              </Link>
            </AnimatedBorderCard>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
