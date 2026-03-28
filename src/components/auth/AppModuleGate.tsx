import { Navigate, Outlet, useLocation } from "react-router-dom"

import { useAuthRole } from "@/context/AuthRoleContext"
import { canAccessAppPath } from "@/lib/auth-role"

export function AppModuleGate() {
  const { pathname } = useLocation()
  const { role } = useAuthRole()

  if (!role) return null
  if (!canAccessAppPath(role, pathname)) {
    return <Navigate to={`/${role}/dashboard`} replace />
  }
  return <Outlet />
}
