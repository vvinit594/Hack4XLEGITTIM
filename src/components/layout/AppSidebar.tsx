import { motion, useReducedMotion } from "framer-motion"
import { LogOut } from "lucide-react"
import { NavLink } from "react-router-dom"

import { BrandLogo } from "@/components/brand/BrandLogo"
import { Button } from "@/components/ui/button"
import { useAuthRole } from "@/context/AuthRoleContext"
import { sidebarNavForRole } from "@/lib/role-sidebar"
import { cn } from "@/lib/utils"

export function AppSidebar() {
  const reduceMotion = useReducedMotion()
  const { role, logout } = useAuthRole()
  const nav = role ? sidebarNavForRole(role) : []

  return (
    <aside className="border-border/80 bg-card flex h-svh w-[260px] shrink-0 flex-col border-r shadow-sm">
      <div className="border-border/60 flex items-center gap-2.5 border-b px-4 py-5">
        <BrandLogo size="lg" className="max-h-10 max-w-[140px]" />
        <div className="min-w-0">
          <p className="text-foreground truncate text-sm font-bold tracking-tight">
            Hospi-Track
          </p>
          <p className="text-muted-foreground truncate text-xs capitalize">
            {role ? `${role} session` : "Operations"}
          </p>
        </div>
      </div>

      <nav
        className="flex flex-1 flex-col gap-1 overflow-y-auto p-3"
        aria-label="App navigation"
      >
        {nav.map(({ to, label, icon: Icon, end }) => (
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

      <div className="border-border/60 space-y-2 border-t p-4">
        <p className="text-muted-foreground text-xs">
          <span className="font-medium text-slate-600">Ward A — General</span>
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full justify-center gap-2 rounded-xl text-xs"
          onClick={logout}
        >
          <LogOut className="size-3.5" />
          Exit session
        </Button>
      </div>
    </aside>
  )
}
