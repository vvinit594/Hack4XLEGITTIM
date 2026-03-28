import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { Outlet, useLocation } from "react-router-dom"

import { AppSidebar } from "@/components/layout/AppSidebar"

export function DashboardLayout() {
  const location = useLocation()
  const reduceMotion = useReducedMotion()

  return (
    <div className="bg-slate-50 flex h-svh overflow-hidden">
      <AppSidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="flex min-h-0 flex-1 flex-col overflow-y-auto"
          >
            <Outlet context={{ embedded: true }} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
