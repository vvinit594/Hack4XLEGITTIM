import { Navigate, Outlet, useParams } from "react-router-dom"

import { useAuthRole } from "@/context/AuthRoleContext"
import { isHospitalRole } from "@/types/auth"

export function RequireAuthRoleMatch() {
  const { userRole } = useParams<{ userRole: string }>()
  const { isAuthenticated, role } = useAuthRole()

  if (!isAuthenticated || !role) {
    return <Navigate to="/?enter=1" replace />
  }
  if (!userRole || !isHospitalRole(userRole) || userRole !== role) {
    return <Navigate to={`/${role}/dashboard`} replace />
  }

  return <Outlet />
}
