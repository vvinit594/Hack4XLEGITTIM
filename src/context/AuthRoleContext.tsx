import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { useNavigate } from "react-router-dom"

import { RoleModal } from "@/components/auth/RoleModal"
import {
  clearSession,
  readStoredSession,
  writeSession,
} from "@/lib/auth-role"
import type { HospitalRole } from "@/types/auth"

type AuthRoleContextValue = {
  role: HospitalRole | null
  demoId: string | null
  isAuthenticated: boolean
  login: (role: HospitalRole, demoId: string) => void
  logout: () => void
  openRoleModal: () => void
  roleModalOpen: boolean
  setRoleModalOpen: (open: boolean) => void
}

const AuthRoleContext = createContext<AuthRoleContextValue | null>(null)

export function AuthRoleProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const [session, setSession] = useState<{
    role: HospitalRole
    demoId: string
  } | null>(() => readStoredSession())
  const [roleModalOpen, setRoleModalOpen] = useState(false)

  const login = useCallback(
    (role: HospitalRole, demoId: string) => {
      writeSession(role, demoId)
      setSession({ role, demoId: demoId.trim() })
      navigate(`/${role}/dashboard`, { replace: true })
    },
    [navigate]
  )

  const logout = useCallback(() => {
    clearSession()
    setSession(null)
    navigate("/", { replace: true })
  }, [navigate])

  const openRoleModal = useCallback(() => setRoleModalOpen(true), [])

  const value = useMemo<AuthRoleContextValue>(
    () => ({
      role: session?.role ?? null,
      demoId: session?.demoId ?? null,
      isAuthenticated: session !== null,
      login,
      logout,
      openRoleModal,
      roleModalOpen,
      setRoleModalOpen,
    }),
    [session, login, logout, openRoleModal, roleModalOpen]
  )

  return (
    <AuthRoleContext.Provider value={value}>
      {children}
      <RoleModal
        open={roleModalOpen}
        onOpenChange={setRoleModalOpen}
        onSuccess={(role, id) => login(role, id)}
      />
    </AuthRoleContext.Provider>
  )
}

export function useAuthRole(): AuthRoleContextValue {
  const ctx = useContext(AuthRoleContext)
  if (!ctx) {
    throw new Error("useAuthRole must be used within AuthRoleProvider")
  }
  return ctx
}
