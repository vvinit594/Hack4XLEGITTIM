import { Cpu, Timer, TrendingUp } from "lucide-react"

import { cn } from "@/lib/utils"

type DetectionLogicPanelProps = {
  threshold: number
  windowLabel: string
  className?: string
}

export function DetectionLogicPanel({
  threshold,
  windowLabel,
  className,
}: DetectionLogicPanelProps) {
  const items = [
    {
      icon: TrendingUp,
      title: "Case volume threshold",
      body: `Flag when confirmed + syndromic cases exceed ${threshold} in the surveillance window.`,
    },
    {
      icon: Timer,
      title: "Time window",
      body: `Engine evaluates ${windowLabel} and optional 12h cross-check to reduce false positives.`,
    },
    {
      icon: Cpu,
      title: "Signal fusion",
      body:
        "Combines triage chief complaints, lab confirmations, and ward clustering before alerting.",
    },
  ] as const

  return (
    <div
      className={cn(
        "border-border/80 bg-slate-50/80 rounded-2xl border p-5 sm:p-6",
        className
      )}
    >
      <h3 className="text-foreground text-sm font-bold tracking-tight text-slate-900">
        Outbreak trigger logic
      </h3>
      <p className="text-muted-foreground mt-1 text-xs">
        Display-only summary of the rules driving banners and risk level.
      </p>
      <ul className="mt-4 space-y-4">
        {items.map(({ icon: Icon, title, body }) => (
          <li key={title} className="flex gap-3">
            <span className="bg-background flex size-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 shadow-sm">
              <Icon className="text-indigo-600 size-4" aria-hidden />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-800">{title}</p>
              <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
                {body}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
