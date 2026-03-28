import { Navigate } from "react-router-dom"

import { useAuthRole } from "@/context/AuthRoleContext"

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthRole()
  if (!isAuthenticated) {
    return <Navigate to="/?enter=1" replace />
  }
  return <>{children}</>
}
