import { motion, useReducedMotion } from "framer-motion"
import { ArrowRight, BedDouble, TrendingUp, UserRoundPlus } from "lucide-react"
import { Link } from "react-router-dom"

import { cn } from "@/lib/utils"

const cards = [
  {
    to: "/app/bed-board",
    title: "Bed Board",
    desc: "Live grid, participants, and status control.",
    icon: BedDouble,
    className:
      "from-indigo-600/10 to-blue-600/5 border-indigo-200/60 hover:border-indigo-300",
  },
  {
    to: "/app/admissions",
    title: "Admissions & flow",
    desc: "Discharges, arrivals, and elective schedule.",
    icon: UserRoundPlus,
    className:
      "from-emerald-600/10 to-teal-600/5 border-emerald-200/60 hover:border-emerald-300",
  },
  {
    to: "/app/forecast",
    title: "Forecast",
    desc: "Capacity outlook (coming soon).",
    icon: TrendingUp,
    className:
      "from-violet-600/10 to-purple-600/5 border-violet-200/60 hover:border-violet-300",
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

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c, i) => (
          <motion.div
            key={c.to}
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: reduceMotion ? 0 : 0.06 * i,
              duration: 0.4,
              ease: [0.22, 1, 0.36, 1] as const,
            }}
          >
            <Link
              to={c.to}
              className={cn(
                "group border-border/80 bg-gradient-to-br flex h-full flex-col rounded-2xl border p-5 shadow-sm transition-all duration-300",
                "hover:-translate-y-1 hover:shadow-lg",
                c.className
              )}
            >
              <c.icon className="text-foreground size-8 opacity-80" aria-hidden />
              <h2 className="text-foreground mt-4 text-lg font-bold tracking-tight">
                {c.title}
              </h2>
              <p className="text-muted-foreground mt-2 flex-1 text-sm leading-relaxed">
                {c.desc}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-indigo-600">
                Open
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
