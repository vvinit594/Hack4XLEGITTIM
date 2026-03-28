import { motion, useReducedMotion } from "framer-motion"
import { Link } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import { HeroDashboardPreview } from "./HeroDashboardPreview"

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
}

export function HeroSection() {
  const reduceMotion = useReducedMotion()

  return (
    <section
      id="top"
      className="relative overflow-hidden pt-24 pb-16 sm:pt-28 sm:pb-24 lg:pt-32 lg:pb-28"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[#F8FAFC]"
        aria-hidden
      />
      <div
        className="bg-primary/5 pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute top-20 -right-24 h-72 w-72 rounded-full bg-indigo-400/25 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-24 -left-20 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-14">
          <div>
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <Badge
                variant="secondary"
                className="mb-5 rounded-full border border-indigo-200/80 bg-indigo-50/90 px-3 py-1 text-xs font-medium text-indigo-700 shadow-sm"
              >
                Healthcare intelligence
              </Badge>
              <h1 className="text-foreground text-4xl leading-[1.08] font-bold tracking-tight sm:text-5xl lg:text-[3.25rem]">
                Real-Time Hospital Ward Intelligence
              </h1>
              <p className="text-muted-foreground mt-5 max-w-xl text-lg leading-relaxed sm:text-xl">
                Monitor bed occupancy, patient flow, and capacity forecasts —
                all in one intelligent dashboard.
              </p>
            </motion.div>

            <motion.div
              className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4"
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.12,
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <motion.div
                whileHover={
                  reduceMotion ? undefined : { scale: 1.03, y: -1 }
                }
                whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
              >
                <Button
                  asChild
                  size="lg"
                  className="h-12 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 px-7 text-base font-semibold text-white shadow-lg shadow-indigo-500/30 transition-shadow duration-300 ease-in-out hover:shadow-xl hover:shadow-indigo-500/35"
                >
                  <Link to="/app/dashboard">View dashboard</Link>
                </Button>
              </motion.div>
              <motion.div
                whileHover={
                  reduceMotion ? undefined : { scale: 1.02, y: -1 }
                }
                whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
              >
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="h-12 rounded-2xl border-slate-200/90 bg-white/80 px-7 text-base font-semibold shadow-sm backdrop-blur-sm transition-all duration-300 ease-in-out hover:border-indigo-200 hover:bg-white hover:shadow-md"
                  onClick={() => scrollTo("cta")}
                >
                  Request demo
                </Button>
              </motion.div>
            </motion.div>
          </div>

          <motion.div
            className="relative mx-auto w-full max-w-lg lg:mx-0 lg:max-w-none"
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.18,
              duration: 0.55,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <HeroDashboardPreview />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
