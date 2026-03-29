import { useEffect, useRef } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { Link } from "react-router-dom"

import { useAuthRole } from "@/context/AuthRoleContext"
import { Button } from "@/components/ui/button"

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
}

export function HeroSection() {
  const reduceMotion = useReducedMotion()
  const { isAuthenticated, role, openRoleModal } = useAuthRole()
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const el = videoRef.current
    if (!el) return
    if (reduceMotion) {
      el.pause()
      el.currentTime = 0
    } else {
      void el.play().catch(() => {
        /* autoplay may be blocked; first frame still shows */
      })
    }
  }, [reduceMotion])

  return (
    <section
      id="top"
      className="relative flex min-h-[90vh] w-full items-center justify-center overflow-hidden pt-24 pb-20 text-center sm:pt-28 sm:pb-24"
    >
      <div className="absolute inset-0" aria-hidden>
        <video
          ref={videoRef}
          className="absolute inset-0 size-full scale-105 object-cover object-center"
          muted
          loop
          playsInline
          autoPlay={!reduceMotion}
          preload="auto"
        >
          <source src="/background.mp4" type="video/mp4" />
          <source src="/background.webm" type="video/webm" />
        </video>
        {/* Light white veil — video stays visible */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/28 via-white/14 to-white/22" />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 90% 70% at 50% 40%, rgba(255,255,255,0.42) 0%, rgba(255,255,255,0.12) 52%, rgba(255,255,255,0.04) 100%)",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-6">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center"
        >
          <h1 className="font-playfair text-4xl leading-[1.15] font-semibold tracking-tight text-gray-900 [text-shadow:0_1px_3px_rgba(255,255,255,0.98),0_0_28px_rgba(255,255,255,0.65),0_2px_12px_rgba(255,255,255,0.45)] sm:text-5xl sm:leading-[1.12] md:text-6xl md:font-bold">
            Real-Time Hospital <br />
            Ward Intelligence
          </h1>
          <p className="font-playfair mt-6 max-w-xl text-lg leading-relaxed font-normal text-gray-900 [text-shadow:0_1px_2px_rgba(255,255,255,0.9),0_0_16px_rgba(255,255,255,0.35)] sm:text-xl">
            Monitor bed occupancy, patient flow, and capacity forecasts — all
            in one intelligent dashboard.
          </p>
        </motion.div>

        <motion.div
          className="mt-8 flex flex-wrap items-center justify-center gap-4"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.1,
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <motion.div
            whileHover={reduceMotion ? undefined : { scale: 1.02, y: -1 }}
            whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
          >
            {isAuthenticated && role ? (
              <Button
                asChild
                size="lg"
                className="h-12 rounded-xl bg-blue-600 px-6 text-base font-semibold text-white shadow-lg transition hover:bg-blue-700"
              >
                <Link to={`/${role}/dashboard`}>View dashboard</Link>
              </Button>
            ) : (
              <Button
                type="button"
                size="lg"
                className="h-12 rounded-xl bg-blue-600 px-6 text-base font-semibold text-white shadow-lg transition hover:bg-blue-700"
                onClick={openRoleModal}
              >
                View dashboard
              </Button>
            )}
          </motion.div>
          <motion.div
            whileHover={reduceMotion ? undefined : { scale: 1.02, y: -1 }}
            whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
          >
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="h-12 rounded-xl border border-gray-300/90 bg-white/90 px-6 text-base font-semibold text-gray-900 shadow-md backdrop-blur-sm transition hover:bg-white"
              onClick={() => scrollTo("cta")}
            >
              Request demo
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
