import { Link, Outlet, useParams } from "react-router-dom"
import { LogOut } from "lucide-react"

import { BrandLogo } from "@/components/brand/BrandLogo"
import { Button } from "@/components/ui/button"
import { useAuthRole } from "@/context/AuthRoleContext"
import { firstAppModuleForRole } from "@/lib/role-sidebar"
import type { HospitalRole } from "@/types/auth"
import { isHospitalRole } from "@/types/auth"

const HEADER_THEME: Record<
  HospitalRole,
  { gradient: string; subtitle: string }
> = {
  doctor: {
    gradient:
      "from-indigo-600 via-violet-600 to-blue-700 shadow-indigo-900/20",
    subtitle: "Clinical intelligence · decision workspace",
  },
  nurse: {
    gradient:
      "from-emerald-600 via-teal-600 to-emerald-800 shadow-emerald-900/20",
    subtitle: "Floor operations · assignments & flow",
  },
  staff: {
    gradient:
      "from-orange-500 via-amber-500 to-orange-600 shadow-orange-900/20",
    subtitle: "Logistics · inventory & support",
  },
}

export function RoleLayout() {
  const { userRole } = useParams<{ userRole: string }>()
  const { logout, demoId } = useAuthRole()

  if (!userRole || !isHospitalRole(userRole)) return <Outlet />

  const theme = HEADER_THEME[userRole]
  const modulesHref = firstAppModuleForRole(userRole)

  return (
    <div className="bg-slate-50 flex min-h-svh flex-col">
      <header
        className={`bg-gradient-to-r ${theme.gradient} px-4 py-4 text-white shadow-xl sm:px-6`}
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex shrink-0 items-center justify-center rounded-2xl bg-white/95 px-2 py-1.5 shadow-inner">
              <BrandLogo size="lg" className="max-h-10 max-w-[140px]" />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-bold tracking-widest text-white/80 uppercase">
                Hospi-Track · Role workspace
              </p>
              <h1 className="text-xl font-extrabold tracking-tight capitalize sm:text-2xl">
                {userRole}
              </h1>
              <p className="text-sm text-white/85">{theme.subtitle}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {demoId ? (
              <span className="hidden rounded-lg bg-black/15 px-2.5 py-1 font-mono text-xs text-white/95 sm:inline">
                {demoId}
              </span>
            ) : null}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/15"
              onClick={logout}
            >
              <LogOut className="mr-1.5 size-4" />
              Exit session
            </Button>
            <Button
              asChild
              size="sm"
              className="border-0 bg-white font-semibold text-slate-900 shadow-md hover:bg-white/95"
            >
              <Link to={modulesHref}>Open clinical modules →</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  )
}
