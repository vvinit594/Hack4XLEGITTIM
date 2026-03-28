import { Navigate } from "react-router-dom"

import { useAuthRole } from "@/context/AuthRoleContext"

export function RedirectRoleDashboard() {
  const { role } = useAuthRole()
  if (!role) return <Navigate to="/?enter=1" replace />
  return <Navigate to={`/${role}/dashboard`} replace />
}
