import { motion, useReducedMotion } from "framer-motion"

import { cn } from "@/lib/utils"
import type { ParticipantListItem, PatientGender } from "@/types/bed"

function GenderDot({ gender }: { gender: PatientGender }) {
  if (gender === "male") {
    return (
      <span
        className="size-2.5 shrink-0 rounded-full bg-sky-500 shadow-sm"
        title="Male"
        aria-label="Male"
      />
    )
  }
  if (gender === "female") {
    return (
      <span
        className="size-2.5 shrink-0 rounded-full bg-pink-400 shadow-sm"
        title="Female"
        aria-label="Female"
      />
    )
  }
  if (gender === "other") {
    return (
      <span
        className="border-muted-foreground/40 size-2.5 shrink-0 rounded-full border-2 border-dashed"
        title="Other"
        aria-label="Other"
      />
    )
  }
  return (
    <span
      className="bg-muted-foreground/30 size-2.5 shrink-0 rounded-full"
      title="Not specified"
      aria-label="Gender not specified"
    />
  )
}

function genderLabel(g: PatientGender) {
  if (g === "male") return "Male"
  if (g === "female") return "Female"
  if (g === "other") return "Other"
  return "—"
}

type ParticipantListPanelProps = {
  participants: ParticipantListItem[]
  selectedParticipantId: string | null
  onSelectParticipant: (p: ParticipantListItem) => void
  registerNode: (id: string, node: HTMLElement | null) => void
}

export function ParticipantListPanel({
  participants,
  selectedParticipantId,
  onSelectParticipant,
  registerNode,
}: ParticipantListPanelProps) {
  const reduceMotion = useReducedMotion()

  return (
    <aside className="border-border/80 bg-card/50 flex min-h-0 w-full min-w-0 flex-col border-b lg:w-[min(100%,360px)] lg:shrink-0 lg:border-r lg:border-b-0">
      <div className="border-border/60 border-b px-6 py-4">
        <h2 className="text-foreground text-base font-bold tracking-tight">
          Participants
        </h2>
        <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
          Select to focus the linked bed in the grid.
        </p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <ul className="flex flex-col gap-4" role="list">
          {participants.map((p, index) => {
            const isSelected = selectedParticipantId === p.id
            return (
              <li key={p.id} role="listitem" className="min-h-[8.5rem]">
                <motion.button
                  type="button"
                  ref={(el) => {
                    registerNode(p.id, el)
                  }}
                  layout
                  initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    ...(isSelected && !reduceMotion
                      ? {
                          boxShadow: [
                            "0 0 0px rgba(59, 130, 246, 0)",
                            "0 0 15px rgba(59, 130, 246, 0.3)",
                            "0 0 0px rgba(59, 130, 246, 0)",
                          ],
                        }
                      : { boxShadow: "none" }),
                  }}
                  transition={{
                    delay: reduceMotion ? 0 : 0.035 * index,
                    duration: 0.35,
                    ease: [0.22, 1, 0.36, 1] as const,
                    ...(isSelected && !reduceMotion
                      ? {
                          boxShadow: {
                            duration: 1,
                            repeat: Infinity,
                            ease: "easeInOut" as const,
                          },
                        }
                      : {}),
                  }}
                  whileHover={
                    reduceMotion
                      ? undefined
                      : { 
                          y: -2, 
                          transition: { duration: 0.2, ease: "easeOut" } 
                        }
                  }
                  whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                  onClick={() => onSelectParticipant(p)}
                  className={cn(
                    "flex h-full min-h-[8.5rem] w-full flex-col rounded-xl border p-5 text-left transition-all duration-300 ease-in-out",
                    "border-gray-200 bg-white shadow-sm",
                    "hover:border-blue-400 hover:shadow-md",
                    isSelected && "border-blue-500 bg-blue-50/50 ring-2 ring-blue-200 shadow-md",
                    "focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="text-foreground text-sm font-semibold leading-snug tracking-tight">
                        {p.full_name}
                      </p>
                      <p className="text-muted-foreground font-mono text-xs">
                        {p.patient_code}
                      </p>
                    </div>
                    <GenderDot gender={p.gender} />
                  </div>
                  <div className="bg-border/40 my-3 h-px w-full shrink-0" aria-hidden />
                  <div className="text-muted-foreground flex flex-1 flex-col justify-end space-y-2 text-xs leading-relaxed">
                    <p>
                      <span className="text-foreground/70 font-medium">
                        Gender
                      </span>
                      <span className="text-muted-foreground"> · </span>
                      {genderLabel(p.gender)}
                    </p>
                    <p>
                      <span className="text-foreground/70 font-medium">
                        Condition
                      </span>
                      <span className="mt-0.5 block text-muted-foreground">
                        {p.condition_category ?? "—"}
                      </span>
                    </p>
                    <p>
                      <span className="text-foreground/70 font-medium">
                        Bed
                      </span>
                      <span className="mt-0.5 block">
                        {p.bed_code ? (
                          <span className="text-foreground font-semibold">
                            {p.bed_code}
                          </span>
                        ) : (
                          <span className="font-medium text-amber-700">
                            Unassigned
                          </span>
                        )}
                      </span>
                    </p>
                  </div>
                </motion.button>
              </li>
            )
          })}
        </ul>
      </div>
    </aside>
  )
}
