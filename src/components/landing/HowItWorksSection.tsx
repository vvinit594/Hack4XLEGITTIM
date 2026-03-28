import { motion, useReducedMotion } from "framer-motion"
import { Brain, RefreshCw, Stethoscope, Zap } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const steps = [
  {
    title: "Staff updates bed status",
    body: "Nurses and clerks log beds from the floor in seconds — no duplicate sheets.",
    icon: RefreshCw,
    accent: "from-emerald-500/15 to-teal-500/10 text-emerald-700",
  },
  {
    title: "System updates instantly",
    body: "Hospi-Track reconciles occupancy, flow, and alerts across the whole dashboard.",
    icon: Zap,
    accent: "from-indigo-500/15 to-blue-500/10 text-indigo-700",
  },
  {
    title: "Doctors get real-time insights",
    body: "Clinicians see what’s full, what’s freeing up, and what’s coming next.",
    icon: Stethoscope,
    accent: "from-blue-500/15 to-violet-500/10 text-blue-800",
  },
] as const

export function HowItWorksSection() {
  const reduceMotion = useReducedMotion()

  return (
    <section
      id="how-it-works"
      className="scroll-mt-20 bg-white py-20 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <div className="text-muted-foreground mb-2 text-sm font-semibold tracking-wide uppercase">
            How it works
          </div>
          <h2 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
            From bedside update to ward-wide clarity
          </h2>
          <p className="text-muted-foreground mt-3 flex items-center justify-center gap-2 text-base sm:text-lg">
            <Brain className="text-indigo-500 size-5 shrink-0" aria-hidden />
            Three calm steps — no heavy training required.
          </p>
        </motion.div>

        <div className="relative mt-14 lg:mt-16">
          <div
            className="absolute top-10 right-[12%] left-[12%] hidden h-0.5 bg-slate-200 lg:block"
            aria-hidden
          >
            <motion.div
              className="h-full origin-left rounded-full bg-gradient-to-r from-indigo-500 to-blue-500"
              initial={reduceMotion ? { scaleX: 1 } : { scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>

          <div className="grid gap-8 lg:grid-cols-3 lg:gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={reduceMotion ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  delay: reduceMotion ? 0 : 0.12 * i,
                  duration: 0.45,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="relative"
              >
                <Card
                  className={cn(
                    "border-border/80 relative z-10 rounded-2xl border bg-[#F8FAFC] shadow-sm transition-all duration-300 ease-in-out",
                    "hover:-translate-y-1 hover:border-indigo-200/90 hover:bg-white hover:shadow-md hover:shadow-indigo-500/10"
                  )}
                >
                  <CardContent className="flex flex-col gap-4 p-6 sm:p-7">
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br shadow-inner",
                          step.accent
                        )}
                      >
                        <step.icon className="size-6" aria-hidden />
                      </span>
                      <span className="text-muted-foreground text-sm font-semibold">
                        Step {i + 1}
                      </span>
                    </div>
                    <h3 className="text-foreground text-lg font-semibold tracking-tight">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {step.body}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
