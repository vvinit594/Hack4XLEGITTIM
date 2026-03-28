import { motion, useReducedMotion } from "framer-motion"

export function PlaceholderPage({ title }: { title: string }) {
  const reduceMotion = useReducedMotion()

  return (
    <div className="bg-background flex min-h-0 flex-1 flex-col p-6 lg:p-8">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="border-border/80 bg-card mx-auto max-w-lg rounded-2xl border p-8 text-center shadow-sm"
      >
        <h1 className="text-foreground text-xl font-bold tracking-tight">
          {title}
        </h1>
        <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
          This module is not wired yet. Use the sidebar to explore Bed Board and
          Admissions.
        </p>
      </motion.div>
    </div>
  )
}
