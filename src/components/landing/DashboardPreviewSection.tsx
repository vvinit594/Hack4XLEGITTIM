import { useEffect, useState } from "react"
import { motion, useReducedMotion } from "framer-motion"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

type BedState = "occupied" | "available" | "cleaning" | "iso" | "alert"

const bedPattern: BedState[] = [
  "occupied",
  "available",
  "occupied",
  "cleaning",
  "available",
  "occupied",
  "iso",
  "occupied",
  "available",
  "alert",
  "occupied",
  "available",
  "cleaning",
  "occupied",
  "available",
  "occupied",
  "available",
  "iso",
  "occupied",
  "cleaning",
]

const bedStyles: Record<BedState, string> = {
  occupied: "bg-indigo-500/90 shadow-indigo-500/25",
  available: "bg-emerald-500/85 shadow-emerald-500/20",
  cleaning: "bg-amber-400/90 shadow-amber-500/20",
  iso: "bg-sky-500/85 shadow-sky-500/20",
  alert: "bg-red-500/90 shadow-red-500/25 ring-2 ring-red-200",
}

const monthBars = [38, 52, 48, 68, 74, 62]

export function DashboardPreviewSection() {
  const reduceMotion = useReducedMotion()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const t = window.setTimeout(() => setMounted(true), 200)
    return () => window.clearTimeout(t)
  }, [])

  return (
    <section
      id="preview"
      className="scroll-mt-20 border-t border-slate-200/80 bg-[#F8FAFC] py-20 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <Badge
            variant="secondary"
            className="mb-3 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium"
          >
            Dashboard preview
          </Badge>
          <h2 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
            One pane for the whole ward
          </h2>
          <p className="text-muted-foreground mt-3 text-base leading-relaxed sm:text-lg">
            Bed tiles, flow analytics, and distribution — the same visual language
            your clinical leaders already expect from premium tools.
          </p>
        </motion.div>

        <motion.div
          className="mt-12"
          initial={reduceMotion ? false : { opacity: 0, scale: 0.97, y: 20 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            whileHover={
              reduceMotion
                ? undefined
                : {
                    scale: 1.01,
                    transition: { duration: 0.35, ease: "easeOut" },
                  }
            }
            className="border-border/80 rounded-3xl border bg-white p-4 shadow-lg shadow-slate-900/5 ring-1 ring-slate-900/[0.04] transition-shadow duration-300 ease-in-out hover:shadow-xl hover:shadow-indigo-500/10 hover:ring-indigo-200/50 sm:p-6 lg:p-8"
          >
            {!mounted ? (
              <div className="grid animate-pulse gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="h-64 rounded-2xl bg-slate-200/80" />
                <div className="grid gap-4">
                  <div className="h-32 rounded-2xl bg-slate-200/80" />
                  <div className="h-32 rounded-2xl bg-slate-200/80" />
                </div>
              </div>
            ) : (
              <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
                <Card className="rounded-2xl border-slate-200/90 bg-[#FAFBFC] shadow-sm ring-0">
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">
                      Live bed grid
                    </CardTitle>
                    <CardDescription>
                      Color-coded tiles mirror ward state in real time.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-5 gap-2 sm:grid-cols-6 sm:gap-2.5">
                      {bedPattern.map((state, i) => (
                        <motion.div
                          key={i}
                          initial={
                            reduceMotion ? false : { opacity: 0, scale: 0.85 }
                          }
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{
                            delay: reduceMotion ? 0 : 0.02 * i,
                            duration: 0.35,
                            ease: "easeOut",
                          }}
                          whileHover={
                            reduceMotion
                              ? undefined
                              : { scale: 1.06, y: -2 }
                          }
                          className={cn(
                            "aspect-square rounded-xl shadow-md ring-1 ring-white/30 transition-colors duration-300",
                            bedStyles[state]
                          )}
                          title={state}
                        />
                      ))}
                    </div>
                    <ul className="text-muted-foreground mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs">
                      <li className="flex items-center gap-1.5">
                        <span className="size-2 rounded-sm bg-indigo-500" />
                        Occupied
                      </li>
                      <li className="flex items-center gap-1.5">
                        <span className="size-2 rounded-sm bg-emerald-500" />
                        Available
                      </li>
                      <li className="flex items-center gap-1.5">
                        <span className="size-2 rounded-sm bg-amber-400" />
                        Cleaning
                      </li>
                      <li className="flex items-center gap-1.5">
                        <span className="size-2 rounded-sm bg-sky-500" />
                        Isolation
                      </li>
                      <li className="flex items-center gap-1.5">
                        <span className="size-2 rounded-sm bg-red-500" />
                        Alert
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <div className="grid gap-6">
                  <Card className="rounded-2xl border-slate-200/90 shadow-sm ring-0">
                    <CardHeader>
                      <CardTitle className="text-base font-semibold">
                        Occupancy trend
                      </CardTitle>
                      <CardDescription>Last 6 months · ward aggregate</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex h-40 items-end justify-between gap-2 px-1">
                        {monthBars.map((h, i) => {
                          const hPx = Math.round((h / 74) * 120)
                          return (
                            <div
                              key={i}
                              className="flex h-full min-h-0 flex-1 flex-col items-center justify-end gap-2"
                            >
                              <motion.div
                                className="w-full max-w-[28px] rounded-t-lg bg-gradient-to-t from-indigo-600 via-indigo-500 to-blue-400 shadow-md shadow-indigo-500/20"
                                initial={
                                  reduceMotion ? { height: hPx } : { height: 0 }
                                }
                                whileInView={{ height: hPx }}
                                viewport={{ once: true }}
                                transition={{
                                  delay: 0.08 * i,
                                  duration: 0.55,
                                  ease: [0.22, 1, 0.36, 1],
                                }}
                                style={{ minHeight: 8 }}
                              />
                              <span className="text-muted-foreground text-[11px] font-medium">
                                {["J", "F", "M", "A", "M", "J"][i]}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl border-slate-200/90 shadow-sm ring-0">
                    <CardHeader>
                      <CardTitle className="text-base font-semibold">
                        Status distribution
                      </CardTitle>
                      <CardDescription>Today · all beds</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between sm:gap-6">
                      <svg
                        viewBox="0 0 140 140"
                        className="size-36 shrink-0 -rotate-90"
                        aria-hidden
                      >
                        <circle
                          cx="70"
                          cy="70"
                          r="52"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="18"
                          className="text-slate-100"
                        />
                        {[
                          { pct: 0.48, color: "text-indigo-500", off: 0 },
                          { pct: 0.22, color: "text-emerald-500", off: 0.48 },
                          { pct: 0.15, color: "text-amber-400", off: 0.7 },
                          { pct: 0.1, color: "text-sky-500", off: 0.85 },
                          { pct: 0.05, color: "text-red-500", off: 0.95 },
                        ].map((seg, idx) => (
                          <motion.circle
                            key={idx}
                            cx="70"
                            cy="70"
                            r="52"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="18"
                            strokeDasharray={`${seg.pct * 326.7} 326.7`}
                            strokeDashoffset={-seg.off * 326.7}
                            className={seg.color}
                            initial={
                              reduceMotion
                                ? false
                                : { strokeDasharray: "0 326.7" }
                            }
                            whileInView={{
                              strokeDasharray: `${seg.pct * 326.7} 326.7`,
                            }}
                            viewport={{ once: true }}
                            transition={{
                              delay: 0.12 + idx * 0.07,
                              duration: 0.65,
                              ease: "easeOut",
                            }}
                          />
                        ))}
                      </svg>
                      <ul className="text-muted-foreground grid w-full max-w-[200px] gap-2 text-xs sm:text-sm">
                        <li className="flex justify-between gap-2">
                          <span className="flex items-center gap-2">
                            <span className="size-2 rounded-full bg-indigo-500" />
                            Occupied
                          </span>
                          <span className="text-foreground font-medium">48%</span>
                        </li>
                        <li className="flex justify-between gap-2">
                          <span className="flex items-center gap-2">
                            <span className="size-2 rounded-full bg-emerald-500" />
                            Available
                          </span>
                          <span className="text-foreground font-medium">22%</span>
                        </li>
                        <li className="flex justify-between gap-2">
                          <span className="flex items-center gap-2">
                            <span className="size-2 rounded-full bg-amber-400" />
                            Cleaning
                          </span>
                          <span className="text-foreground font-medium">15%</span>
                        </li>
                        <li className="flex justify-between gap-2">
                          <span className="flex items-center gap-2">
                            <span className="size-2 rounded-full bg-sky-500" />
                            Isolation
                          </span>
                          <span className="text-foreground font-medium">10%</span>
                        </li>
                        <li className="flex justify-between gap-2">
                          <span className="flex items-center gap-2">
                            <span className="size-2 rounded-full bg-red-500" />
                            Alert
                          </span>
                          <span className="text-foreground font-medium">5%</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
