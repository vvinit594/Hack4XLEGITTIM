import { motion, useReducedMotion } from "framer-motion"
import { AlertTriangle, Siren } from "lucide-react"

import { cn } from "@/lib/utils"
import type { OutbreakAlertState } from "@/types/outbreak"

type OutbreakBannerProps = {
  alert: OutbreakAlertState
  className?: string
}

export function OutbreakBanner({ alert, className }: OutbreakBannerProps) {
  const reduceMotion = useReducedMotion()

  if (!alert.active) return null

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={cn("relative overflow-hidden rounded-2xl", className)}
      role="alert"
    >
      <div
        className="absolute inset-0 bg-gradient-to-r from-red-600 via-red-500 to-rose-600"
        aria-hidden
      />
      <motion.div
        className="pointer-events-none absolute inset-0 bg-white/10"
        animate={
          reduceMotion
            ? undefined
            : {
                opacity: [0.15, 0.35, 0.15],
                boxShadow: [
                  "0 0 0 0 rgba(255,255,255,0)",
                  "0 0 40px 8px rgba(255,200,200,0.35)",
                  "0 0 0 0 rgba(255,255,255,0)",
                ],
              }
        }
        transition={{
          duration: 2.2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <div className="relative flex flex-col gap-3 p-5 text-white shadow-xl shadow-red-900/25 sm:flex-row sm:items-center sm:gap-6 sm:p-6">
        <motion.span
          className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 shadow-inner backdrop-blur-sm"
          animate={
            reduceMotion
              ? undefined
              : { scale: [1, 1.06, 1] }
          }
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Siren className="size-8 text-white drop-shadow-md" aria-hidden />
        </motion.span>
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2 text-xs font-bold tracking-widest text-red-100 uppercase">
            <AlertTriangle className="size-3.5" aria-hidden />
            Outbreak surveillance — elevated signal
          </p>
          <h2 className="mt-1 text-xl font-extrabold tracking-tight sm:text-2xl">
            Potential outbreak detected: {alert.disease}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-red-50 sm:text-base">
            <span className="font-bold tabular-nums">
              {alert.casesInWindow} cases
            </span>{" "}
            reported in the {alert.windowLabel}. Threshold exceeded (
            <span className="font-semibold tabular-nums">
              {alert.threshold} cases
            </span>
            ). Primary cluster:{" "}
            <span className="font-semibold">{alert.primaryWard}</span>.
          </p>
        </div>
      </div>
    </motion.div>
  )
}
