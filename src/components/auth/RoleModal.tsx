import { useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { Briefcase, Stethoscope, Syringe } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { validateDemoId } from "@/lib/auth-role"
import type { HospitalRole } from "@/types/auth"

import { RoleCard } from "./RoleCard"
import { RoleInput } from "./RoleInput"

type RoleModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (role: HospitalRole, demoId: string) => void
}

const ROLES: {
  role: HospitalRole
  title: string
  description: string
  icon: typeof Stethoscope
  theme: { iconBg: string; selectedRing: string }
}[] = [
  {
    role: "doctor",
    title: "Doctor",
    description: "Clinical decisions, forecasts, outbreak response.",
    icon: Stethoscope,
    theme: {
      iconBg: "bg-gradient-to-br from-indigo-600 to-violet-600 shadow-indigo-500/30",
      selectedRing: "ring-2 ring-indigo-400 ring-offset-2",
    },
  },
  {
    role: "nurse",
    title: "Nurse",
    description: "Bed status, assignments, admissions workflow.",
    icon: Syringe,
    theme: {
      iconBg: "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/30",
      selectedRing: "ring-2 ring-emerald-400 ring-offset-2",
    },
  },
  {
    role: "staff",
    title: "Staff",
    description: "Inventory, equipment, logistics & support.",
    icon: Briefcase,
    theme: {
      iconBg: "bg-gradient-to-br from-orange-500 to-amber-600 shadow-orange-500/30",
      selectedRing: "ring-2 ring-orange-400 ring-offset-2",
    },
  },
]

export function RoleModal({ open, onOpenChange, onSuccess }: RoleModalProps) {
  const reduceMotion = useReducedMotion()
  const [step, setStep] = useState<1 | 2>(1)
  const [selectedRole, setSelectedRole] = useState<HospitalRole | null>(null)
  const [idValue, setIdValue] = useState("")
  const [error, setError] = useState<string | null>(null)

  const reset = () => {
    setStep(1)
    setSelectedRole(null)
    setIdValue("")
    setError(null)
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) reset()
    onOpenChange(next)
  }

  const submitId = () => {
    if (!selectedRole) return
    if (!validateDemoId(selectedRole, idValue)) {
      setError("Invalid ID. Please try again.")
      return
    }
    setError(null)
    onSuccess(selectedRole, idValue.trim())
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto sm:max-w-lg"
        showCloseButton
      >
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">
            {step === 1 ? "Select your role" : "Verify your ID"}
          </DialogTitle>
          <DialogDescription>
            {step === 1
              ? "Choose how you work in Hospi-Track. Demo access uses a simple unique ID — no password."
              : "Enter the demo ID issued for your role to open your workspace."}
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="roles"
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="grid gap-3 sm:gap-4"
            >
              {ROLES.map((r) => (
                <RoleCard
                  key={r.role}
                  title={r.title}
                  description={r.description}
                  icon={r.icon}
                  theme={r.theme}
                  selected={selectedRole === r.role}
                  onSelect={() => {
                    setSelectedRole(r.role)
                    setStep(2)
                    setIdValue("")
                    setError(null)
                  }}
                />
              ))}
            </motion.div>
          ) : selectedRole ? (
            <RoleInput
              key="id"
              role={selectedRole}
              value={idValue}
              onChange={(v) => {
                setIdValue(v)
                setError(null)
              }}
              error={error}
              onSubmit={submitId}
              onBack={() => {
                setStep(1)
                setIdValue("")
                setError(null)
              }}
            />
          ) : null}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
