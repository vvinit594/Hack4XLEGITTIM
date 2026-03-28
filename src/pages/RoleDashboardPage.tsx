import { motion, useReducedMotion } from "framer-motion"
import {
  ArrowRight,
  BedDouble,
  Bell,
  ClipboardList,
  Microscope,
  Package,
  TrendingUp,
  UserRoundPlus,
} from "lucide-react"
import { Link, useParams } from "react-router-dom"

import { AnimatedBorderCard } from "@/components/ui/AnimatedBorderCard"
import { cn } from "@/lib/utils"
import type { HospitalRole } from "@/types/auth"
import { isHospitalRole } from "@/types/auth"

type DashCard = {
  to: string
  title: string
  desc: string
  icon: typeof BedDouble
  accent: string
}

const DOCTOR_CARDS: DashCard[] = [
  {
    to: "/app/bed-board",
    title: "Bed Board",
    desc: "Live occupancy, participants, and status.",
    icon: BedDouble,
    accent: "text-indigo-600",
  },
  {
    to: "/app/admissions",
    title: "Patient flow",
    desc: "Discharges, arrivals, and queue health.",
    icon: UserRoundPlus,
    accent: "text-violet-600",
  },
  {
    to: "/app/forecast",
    title: "Capacity forecast",
    desc: "Projected load and crunch windows.",
    icon: TrendingUp,
    accent: "text-blue-600",
  },
  {
    to: "/app/outbreak",
    title: "Outbreak intelligence",
    desc: "Syndromic signals and authority routing.",
    icon: Microscope,
    accent: "text-red-600",
  },
]

const NURSE_CARDS: DashCard[] = [
  {
    to: "/app/bed-board",
    title: "Bed Board",
    desc: "Update bed status and assignments.",
    icon: BedDouble,
    accent: "text-emerald-600",
  },
  {
    to: "/app/admissions",
    title: "Admissions",
    desc: "Patient assignments and arrival updates.",
    icon: UserRoundPlus,
    accent: "text-teal-600",
  },
  {
    to: "/app/alerts",
    title: "Alerts",
    desc: "Ward notifications and escalations.",
    icon: Bell,
    accent: "text-emerald-700",
  },
]

const STAFF_CARDS: DashCard[] = [
  {
    to: "/app/inventory",
    title: "Inventory",
    desc: "Equipment, stock, and reservations.",
    icon: Package,
    accent: "text-orange-600",
  },
  {
    to: "/app/alerts",
    title: "Support tasks",
    desc: "Operational alerts and follow-ups.",
    icon: ClipboardList,
    accent: "text-amber-700",
  },
]

const ROLE_COPY: Record<
  HospitalRole,
  { headline: string; sub: string; grid: string }
> = {
  doctor: {
    headline: "Decision-ready overview",
    sub: "Jump into clinical modules tuned for physicians and leads.",
    grid: "sm:grid-cols-2 xl:grid-cols-2",
  },
  nurse: {
    headline: "Shift operations",
    sub: "Beds, patients, and handoffs — fast paths for nursing staff.",
    grid: "sm:grid-cols-2",
  },
  staff: {
    headline: "Logistics hub",
    sub: "Track assets and respond to facility-level requests.",
    grid: "sm:grid-cols-2 max-w-2xl",
  },
}

function cardsForRole(role: HospitalRole): DashCard[] {
  if (role === "nurse") return NURSE_CARDS
  if (role === "staff") return STAFF_CARDS
  return DOCTOR_CARDS
}

export function RoleDashboardPage() {
  const { userRole } = useParams<{ userRole: string }>()
  const reduceMotion = useReducedMotion()

  if (!userRole || !isHospitalRole(userRole)) {
    return (
      <p className="text-muted-foreground text-sm">Invalid role workspace.</p>
    )
  }

  const copy = ROLE_COPY[userRole]
  const cards = cardsForRole(userRole)

  return (
    <div className="mx-auto max-w-5xl">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {copy.headline}
        </h2>
        <p className="text-muted-foreground mt-2 max-w-2xl text-sm sm:text-base">
          {copy.sub}
        </p>
      </motion.div>

      <div className={cn("grid gap-5", copy.grid)}>
        {cards.map((c, i) => (
          <motion.div
            key={c.to}
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: reduceMotion ? 0 : 0.06 * i,
              duration: 0.35,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <AnimatedBorderCard className="h-full min-h-[10rem]">
              <Link
                to={c.to}
                className="group flex h-full min-h-0 flex-col outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-card rounded-[0.9375rem]"
              >
                <c.icon
                  className={cn("size-9 opacity-90", c.accent)}
                  aria-hidden
                />
                <h3 className="text-foreground mt-4 text-lg font-bold tracking-tight">
                  {c.title}
                </h3>
                <p className="text-muted-foreground mt-2 flex-1 text-sm leading-relaxed">
                  {c.desc}
                </p>
                <span
                  className={cn(
                    "mt-4 inline-flex items-center gap-1 text-sm font-semibold",
                    c.accent
                  )}
                >
                  Open
                  <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                </span>
              </Link>
            </AnimatedBorderCard>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
