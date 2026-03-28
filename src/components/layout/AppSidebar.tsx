import { motion, useReducedMotion } from "framer-motion"
import {
  Activity,
  BarChart2,
  BedDouble,
  Bell,
  LayoutDashboard,
  Settings,
  Shield,
  UserRoundPlus,
  type LucideIcon,
} from "lucide-react"
import { NavLink } from "react-router-dom"

import { cn } from "@/lib/utils"

const NAV: {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}[] = [
  {
    to: "/app/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    end: true,
  },
  { to: "/app/bed-board", label: "Bed Board", icon: BedDouble },
  { to: "/app/admissions", label: "Admissions", icon: UserRoundPlus },
  { to: "/app/forecast", label: "AI Forecast", icon: BarChart2 },
  { to: "/app/alerts", label: "Alerts", icon: Bell },
  { to: "/app/admin", label: "Admin View", icon: Shield },
  { to: "/app/settings", label: "Settings", icon: Settings },
]

export function AppSidebar() {
  const reduceMotion = useReducedMotion()

  return (
    <aside className="border-border/80 bg-card flex h-svh w-[260px] shrink-0 flex-col border-r shadow-sm">
      <div className="border-border/60 flex items-center gap-2.5 border-b px-4 py-5">
        <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-500/25">
          <Activity className="size-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-foreground truncate text-sm font-bold tracking-tight">
            Hospi-Track
          </p>
          <p className="text-muted-foreground truncate text-xs">
            Real-time operations
          </p>
        </div>
      </div>

      <nav
        className="flex flex-1 flex-col gap-1 overflow-y-auto p-3"
        aria-label="App navigation"
      >
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end === true}
            className="relative block rounded-xl outline-none"
          >
            {({ isActive }) => (
              <motion.div
                className="relative flex items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5"
                whileHover={
                  reduceMotion
                    ? undefined
                    : { x: 2, transition: { duration: 0.2 } }
                }
              >
                {isActive ? (
                  <motion.div
                    layoutId="sidebar-active-pill"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 shadow-md shadow-indigo-500/25"
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 400, damping: 32 }
                    }
                  />
                ) : (
                  <div className="hover:bg-muted/80 absolute inset-0 rounded-xl transition-colors duration-200" />
                )}
                <motion.span
                  className="relative z-10"
                  whileHover={
                    reduceMotion ? undefined : { scale: 1.08, rotate: -2 }
                  }
                  transition={{ type: "spring", stiffness: 500, damping: 22 }}
                >
                  <Icon
                    className={cn(
                      "size-5",
                      isActive ? "text-white" : "text-slate-600"
                    )}
                    aria-hidden
                  />
                </motion.span>
                <span
                  className={cn(
                    "relative z-10 text-sm font-semibold",
                    isActive ? "text-white" : "text-slate-700"
                  )}
                >
                  {label}
                </span>
              </motion.div>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-border/60 text-muted-foreground border-t p-4 text-xs">
        <p className="font-medium text-slate-600">Ward A — General</p>
        <p className="mt-0.5">Mission control</p>
      </div>
    </aside>
  )
}
