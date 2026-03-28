import { useMemo } from "react"
import { motion, useReducedMotion } from "framer-motion"

import { cn } from "@/lib/utils"
import type { OutbreakChartData } from "@/types/outbreak"

type DiseaseChartProps = {
  data: OutbreakChartData
  className?: string
}

const W = 560
const H = 220
const PAD = { t: 16, r: 16, b: 36, l: 44 }
const IW = W - PAD.l - PAD.r
const IH = H - PAD.t - PAD.b

export function DiseaseChart({ data, className }: DiseaseChartProps) {
  const reduceMotion = useReducedMotion()

  const { paths, maxY } = useMemo(() => {
    const allVals = data.series.flatMap((s) => s.values)
    const max = Math.max(...allVals, 1)
    const n = data.hourLabels.length
    const stepX = n > 1 ? IW / (n - 1) : IW

    const toXY = (i: number, v: number) => {
      const x = PAD.l + i * stepX
      const y = PAD.t + IH - (v / max) * IH
      return { x, y }
    }

    const seriesPaths = data.series.map((s) => {
      const pts = s.values.map((v, i) => toXY(i, v))
      const d = pts
        .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
        .join(" ")
      return { ...s, d, pts }
    })

    return { paths: seriesPaths, maxY: max }
  }, [data])

  return (
    <div
      className={cn(
        "border-border/80 bg-card rounded-2xl border p-4 shadow-sm sm:p-6",
        className
      )}
    >
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Cases over time
          </h3>
          <p className="text-muted-foreground text-xs">
            Multi-disease comparison (rolling window)
          </p>
        </div>
        <ul className="flex flex-wrap gap-3 text-xs font-medium">
          {data.series.map((s) => (
            <li key={s.id} className="flex items-center gap-1.5">
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: s.color }}
              />
              <span className="text-slate-700">{s.label}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto min-w-[320px] w-full max-w-full"
          role="img"
          aria-label="Disease case trends chart"
        >
          <defs>
            <linearGradient id="gridFade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(148 163 184)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="rgb(148 163 184)" stopOpacity="0.06" />
            </linearGradient>
          </defs>

          {[0, 0.25, 0.5, 0.75, 1].map((t) => {
            const y = PAD.t + IH * (1 - t)
            return (
              <line
                key={t}
                x1={PAD.l}
                x2={W - PAD.r}
                y1={y}
                y2={y}
                stroke="url(#gridFade)"
                strokeWidth={1}
              />
            )
          })}

          <text
            x={PAD.l - 8}
            y={PAD.t + 4}
            textAnchor="end"
            fill="#94a3b8"
            style={{ fontSize: 10, fontWeight: 500 }}
          >
            {maxY}
          </text>
          <text
            x={PAD.l - 8}
            y={PAD.t + IH}
            textAnchor="end"
            fill="#94a3b8"
            style={{ fontSize: 10, fontWeight: 500 }}
          >
            0
          </text>

          {paths.map((s, si) => (
            <motion.path
              key={s.id}
              d={s.d}
              fill="none"
              stroke={s.color}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{
                pathLength: { duration: 1.1, delay: 0.08 * si, ease: "easeOut" },
                opacity: { duration: 0.35, delay: 0.08 * si },
              }}
            />
          ))}

          {data.hourLabels.map((label, i) => {
            const stepX = data.hourLabels.length > 1 ? IW / (data.hourLabels.length - 1) : IW
            const x = PAD.l + i * stepX
            return (
              <text
                key={label}
                x={x}
                y={H - 10}
                textAnchor="middle"
                fill="#64748b"
                style={{ fontSize: 10, fontWeight: 600 }}
              >
                {label}
              </text>
            )
          })}
        </svg>
      </div>

      <p className="text-muted-foreground mt-3 text-xs italic">
        Typhoid trending sharply; Dengue stable relative to prior interval.
      </p>
    </div>
  )
}
