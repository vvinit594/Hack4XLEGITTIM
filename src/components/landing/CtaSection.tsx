import { motion, useReducedMotion } from "framer-motion"

import { Button } from "@/components/ui/button"

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" })
}

export function CtaSection() {
  const reduceMotion = useReducedMotion()

  return (
    <section
      id="cta"
      className="scroll-mt-20 relative overflow-hidden py-20 sm:py-28"
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-800"
        aria-hidden
        animate={
          reduceMotion
            ? undefined
            : {
                backgroundPosition: ["0% 40%", "100% 60%", "0% 40%"],
              }
        }
        transition={
          reduceMotion
            ? undefined
            : { duration: 18, repeat: Infinity, ease: "linear" }
        }
        style={{ backgroundSize: "200% 200%" }}
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_0%,rgba(255,255,255,0.22),transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_100%,rgba(59,130,246,0.35),transparent_50%)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
        <motion.h2
          className="text-3xl font-bold tracking-tight text-white drop-shadow-sm sm:text-4xl"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          Start Managing Smarter
        </motion.h2>
        <motion.p
          className="mt-4 text-base leading-relaxed text-indigo-100 sm:text-lg"
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ delay: 0.06, duration: 0.45, ease: "easeOut" }}
        >
          Bring real-time intelligence to your hospital ward.
        </motion.p>
        <motion.div
          className="mt-10 flex justify-center"
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ delay: 0.12, duration: 0.45, ease: "easeOut" }}
        >
          <motion.div
            animate={
              reduceMotion
                ? undefined
                : {
                    scale: [1, 1.04, 1],
                    boxShadow: [
                      "0 16px 40px -12px rgba(0,0,0,0.35)",
                      "0 20px 50px -10px rgba(99,102,241,0.55)",
                      "0 16px 40px -12px rgba(0,0,0,0.35)",
                    ],
                  }
            }
            transition={
              reduceMotion
                ? undefined
                : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
            }
          >
            <Button
              type="button"
              size="lg"
              className="h-12 rounded-2xl border-0 bg-white px-10 text-base font-semibold text-indigo-700 shadow-xl transition-transform duration-300 ease-in-out hover:scale-[1.03] hover:bg-slate-50"
              onClick={scrollToTop}
            >
              Get started
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
