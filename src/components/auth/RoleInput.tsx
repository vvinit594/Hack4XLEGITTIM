import { motion, useReducedMotion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { demoIdPlaceholder } from "@/lib/auth-role"
import type { HospitalRole } from "@/types/auth"

type RoleInputProps = {
  role: HospitalRole
  value: string
  onChange: (v: string) => void
  error: string | null
  onSubmit: () => void
  onBack: () => void
}

const ROLE_LABEL: Record<HospitalRole, string> = {
  doctor: "Doctor",
  nurse: "Nurse",
  staff: "Staff",
}

export function RoleInput({
  role,
  value,
  onChange,
  error,
  onSubmit,
  onBack,
}: RoleInputProps) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={reduceMotion ? undefined : { opacity: 0, x: -12 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-4"
    >
      <div>
        <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
          Unique ID
        </p>
        <p className="text-foreground mt-1 text-sm font-medium text-slate-900">
          Signed in as:{" "}
          <span className="text-indigo-600">{ROLE_LABEL[role]}</span>
        </p>
      </div>
      <div>
        <label htmlFor="demo-role-id" className="sr-only">
          Demo unique identifier
        </label>
        <input
          id="demo-role-id"
          type="text"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSubmit()
          }}
          placeholder={demoIdPlaceholder(role)}
          className="border-input bg-background focus-visible:ring-ring h-11 w-full rounded-xl border px-4 text-sm outline-none transition-shadow focus-visible:ring-2"
        />
        {error ? (
          <p className="mt-2 text-sm font-medium text-red-600" role="alert">
            {error}
          </p>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2 pt-1">
        <Button
          type="button"
          variant="outline"
          className="rounded-xl"
          onClick={onBack}
        >
          Back
        </Button>
        <motion.div
          className="flex-1 min-w-[8rem]"
          whileTap={reduceMotion ? undefined : { scale: 0.98 }}
        >
          <Button
            type="button"
            className="h-11 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 font-semibold text-white shadow-md shadow-indigo-500/25"
            onClick={onSubmit}
          >
            Enter dashboard
          </Button>
        </motion.div>
      </div>
    </motion.div>
  )
}
