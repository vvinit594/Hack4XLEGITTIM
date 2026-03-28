import { motion, useReducedMotion } from "framer-motion"
import {
  Activity,
  BarChart3,
  BellRing,
  BedDouble,
  GitBranch,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

const features = [
  {
    title: "Live Bed Tracking",
    description:
      "See every bed’s status at a glance — available, occupied, isolation, and turnover in real time.",
    icon: BedDouble,
    iconWrap: "bg-emerald-500/12 text-emerald-600",
  },
  {
    title: "Patient Flow Management",
    description:
      "Follow admissions, transfers, and movement across the ward without digging through spreadsheets.",
    icon: GitBranch,
    iconWrap: "bg-indigo-500/12 text-indigo-600",
  },
  {
    title: "Discharge Monitoring",
    description:
      "Spot pending discharges early, reduce bottlenecks, and keep the next patient moving smoothly.",
    icon: Activity,
    iconWrap: "bg-blue-500/12 text-blue-600",
  },
  {
    title: "Capacity Forecast",
    description:
      "Short-term projections help you staff and allocate beds before pressure hits the floor.",
    icon: BarChart3,
    iconWrap: "bg-violet-500/12 text-violet-600",
  },
  {
    title: "Smart Alerts",
    description:
      "Configurable alerts for overcrowding, wait risk, and critical bed states — only what matters.",
    icon: BellRing,
    iconWrap: "bg-amber-500/12 text-amber-600",
  },
] as const

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  },
}

export function FeaturesSection() {
  const reduceMotion = useReducedMotion()

  return (
    <section
      id="features"
      className="scroll-mt-20 border-t border-slate-200/80 bg-[#F8FAFC] py-20 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <h2 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
            Built for busy wards
          </h2>
          <p className="text-muted-foreground mt-3 text-base leading-relaxed sm:text-lg">
            Everything your team needs to run the floor with clarity — not
            clutter.
          </p>
        </motion.div>

        <motion.div
          className="mt-12 grid grid-cols-1 items-stretch justify-items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8"
          variants={reduceMotion ? undefined : container}
          initial={reduceMotion ? false : "hidden"}
          whileInView={reduceMotion ? undefined : "show"}
          viewport={{ once: true, margin: "-60px" }}
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={reduceMotion ? undefined : item}
              whileHover={
                reduceMotion
                  ? undefined
                  : { y: -6, transition: { duration: 0.3, ease: "easeOut" } }
              }
              className="flex h-full min-h-0"
            >
              <Card
                className={cn(
                  "border-border/80 h-full w-full min-w-0 rounded-2xl border bg-white shadow-sm transition-all duration-300 ease-in-out",
                  "hover:border-indigo-200/80 hover:shadow-lg hover:shadow-indigo-500/10"
                )}
              >
                <CardContent className="flex h-full flex-col gap-4 pt-2 pb-6">
                  <motion.span
                    className={cn(
                      "flex size-11 shrink-0 items-center justify-center rounded-xl",
                      f.iconWrap
                    )}
                    whileHover={
                      reduceMotion ? undefined : { scale: 1.08, rotate: -3 }
                    }
                    transition={{ type: "spring", stiffness: 400, damping: 18 }}
                  >
                    <f.icon className="size-5" aria-hidden />
                  </motion.span>
                  <CardTitle className="text-lg font-semibold tracking-tight">
                    {f.title}
                  </CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    {f.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
