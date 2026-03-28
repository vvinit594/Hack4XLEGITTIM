import { useEffect, useState } from "react"
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion"
import { BedDouble, TrendingUp, Users, Zap } from "lucide-react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const statMini = [
  {
    label: "Available beds",
    value: "24",
    trend: "+3 vs AM",
    icon: BedDouble,
    iconBg: "bg-emerald-500/15 text-emerald-600",
  },
  {
    label: "Occupancy",
    value: "87%",
    trend: "↗ 2.1%",
    icon: Users,
    iconBg: "bg-indigo-500/15 text-indigo-600",
  },
  {
    label: "Pending DC",
    value: "6",
    trend: "2 urgent",
    icon: Zap,
    iconBg: "bg-amber-500/15 text-amber-600",
  },
  {
    label: "Forecast 24h",
    value: "94%",
    trend: "capacity",
    icon: TrendingUp,
    iconBg: "bg-blue-500/15 text-blue-600",
  },
] as const

const weekBars = [42, 58, 45, 72, 64, 48, 55]

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-slate-200/80 dark:bg-slate-700/50",
        className
      )}
    />
  )
}

export function HeroDashboardPreview() {
  const reduceMotion = useReducedMotion()
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    const t = window.setTimeout(() => setShowContent(true), 420)
    return () => window.clearTimeout(t)
  }, [])

  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const springX = useSpring(mx, { stiffness: 120, damping: 20 })
  const springY = useSpring(my, { stiffness: 120, damping: 20 })
  const rotateX = useTransform(springY, [-0.5, 0.5], [5, -5])
  const rotateY = useTransform(springX, [-0.5, 0.5], [-5, 5])

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reduceMotion) return
    const el = e.currentTarget
    const r = el.getBoundingClientRect()
    mx.set((e.clientX - r.left) / r.width - 0.5)
    my.set((e.clientY - r.top) / r.height - 0.5)
  }

  function onMouseLeave() {
    mx.set(0)
    my.set(0)
  }

  return (
    <div className="relative" style={{ perspective: 1200 }}>
      <motion.div
        className="relative"
        initial={reduceMotion ? false : { opacity: 0, scale: 0.96, y: 16 }}
        animate={
          reduceMotion
            ? { opacity: 1, scale: 1, y: 0 }
            : { opacity: 1, scale: 1, y: [0, -6, 0] }
        }
        transition={
          reduceMotion
            ? { duration: 0.55, ease: [0.22, 1, 0.36, 1] }
            : {
                opacity: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
                scale: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
                y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
              }
        }
      >
        <motion.div
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
          style={
            reduceMotion
              ? undefined
              : {
                  rotateX,
                  rotateY,
                  transformStyle: "preserve-3d",
                }
          }
          className="border-border/80 bg-white/65 shadow-indigo-500/10 dark:bg-slate-900/50 relative overflow-hidden rounded-2xl border shadow-xl ring-1 ring-slate-900/5 backdrop-blur-xl transition-shadow duration-500 ease-in-out hover:shadow-2xl hover:shadow-indigo-500/15 hover:ring-indigo-200/60"
        >
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-500/[0.06] via-transparent to-blue-500/[0.05]"
            aria-hidden
          />
          <div className="relative p-4 sm:p-5">
            {!showContent ? (
              <div className="grid gap-3">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <SkeletonBlock key={i} className="h-20" />
                  ))}
                </div>
                <div className="grid gap-2 sm:grid-cols-[1.2fr_0.8fr]">
                  <SkeletonBlock className="h-36" />
                  <SkeletonBlock className="h-36" />
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="grid gap-4"
              >
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {statMini.map((s, i) => (
                    <motion.div
                      key={s.label}
                      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: 0.05 * i,
                        duration: 0.4,
                        ease: "easeOut",
                      }}
                    >
                      <Card className="rounded-xl border-slate-200/90 bg-white/90 py-0 shadow-sm ring-0">
                        <CardContent className="px-3 py-3">
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
                              {s.label}
                            </span>
                            <span
                              className={cn(
                                "flex size-8 shrink-0 items-center justify-center rounded-lg",
                                s.iconBg
                              )}
                            >
                              <s.icon className="size-4" aria-hidden />
                            </span>
                          </div>
                          <p className="text-foreground mt-2 text-lg font-semibold tracking-tight">
                            {s.value}
                          </p>
                          <p className="text-muted-foreground mt-0.5 text-xs">
                            {s.trend}
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
                <div className="grid gap-3 sm:grid-cols-[1.15fr_0.85fr]">
                  <Card className="rounded-xl border-slate-200/90 bg-white/90 py-3 shadow-sm">
                    <CardHeader className="px-3 pb-0">
                      <span className="text-foreground text-sm font-medium">
                        Ward throughput
                      </span>
                      <span className="text-muted-foreground text-xs">
                        Last 7 days
                      </span>
                    </CardHeader>
                    <CardContent className="px-3 pt-3">
                      <div className="flex h-28 items-end justify-between gap-1.5 px-1">
                        {weekBars.map((h, i) => {
                          const barH = Math.round((h / 72) * 56)
                          return (
                            <div
                              key={i}
                              className="flex h-full min-h-0 flex-1 flex-col items-center justify-end gap-1"
                            >
                              <motion.div
                                className="w-full max-w-[22px] rounded-t-md bg-gradient-to-t from-indigo-600 to-blue-500 shadow-sm"
                                initial={
                                  reduceMotion
                                    ? { height: barH }
                                    : { height: 0 }
                                }
                                animate={{ height: barH }}
                                transition={{
                                  delay: 0.15 + i * 0.05,
                                  duration: 0.55,
                                  ease: [0.22, 1, 0.36, 1],
                                }}
                                style={{ minHeight: 6 }}
                              />
                              <span className="text-muted-foreground text-[10px] font-medium">
                                {["M", "T", "W", "T", "F", "S", "S"][i]}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="rounded-xl border-slate-200/90 bg-white/90 py-3 shadow-sm">
                    <CardHeader className="px-3 pb-0">
                      <span className="text-foreground text-sm font-medium">
                        Bed mix
                      </span>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-3 px-3 pt-2">
                      <svg
                        viewBox="0 0 120 120"
                        className="size-28 -rotate-90"
                        aria-hidden
                      >
                        <circle
                          cx="60"
                          cy="60"
                          r="44"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="16"
                          className="text-slate-100"
                        />
                        {[
                          { pct: 0.42, color: "text-indigo-500", off: 0 },
                          { pct: 0.28, color: "text-emerald-500", off: 0.42 },
                          { pct: 0.18, color: "text-amber-500", off: 0.7 },
                          { pct: 0.12, color: "text-blue-400", off: 0.88 },
                        ].map((seg, idx) => (
                          <motion.circle
                            key={idx}
                            cx="60"
                            cy="60"
                            r="44"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="16"
                            strokeDasharray={`${seg.pct * 276.5} 276.5`}
                            strokeDashoffset={-seg.off * 276.5}
                            className={seg.color}
                            initial={
                              reduceMotion
                                ? false
                                : { strokeDasharray: "0 276.5" }
                            }
                            animate={{
                              strokeDasharray: `${seg.pct * 276.5} 276.5`,
                            }}
                            transition={{
                              delay: 0.2 + idx * 0.08,
                              duration: 0.6,
                              ease: "easeOut",
                            }}
                          />
                        ))}
                      </svg>
                      <ul className="text-muted-foreground grid w-full grid-cols-2 gap-x-2 gap-y-1 text-[10px]">
                        <li className="flex items-center gap-1.5">
                          <span className="size-1.5 rounded-full bg-indigo-500" />
                          Occupied
                        </li>
                        <li className="flex items-center gap-1.5">
                          <span className="size-1.5 rounded-full bg-emerald-500" />
                          Available
                        </li>
                        <li className="flex items-center gap-1.5">
                          <span className="size-1.5 rounded-full bg-amber-500" />
                          Cleaning
                        </li>
                        <li className="flex items-center gap-1.5">
                          <span className="size-1.5 rounded-full bg-blue-400" />
                          Iso / spec
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
