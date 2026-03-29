import {
  BedDouble,
  LayoutDashboard,
  Package,
  Settings,
  Shield,
  Siren,
  TrendingUp,
  UserRoundPlus,
  type LucideIcon,
} from "lucide-react"

import type { HospitalRole } from "@/types/auth"

export type SidebarNavItem = {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

export function sidebarNavForRole(role: HospitalRole): SidebarNavItem[] {
  const home = `/${role}/dashboard`
  const doctor: SidebarNavItem[] = [
    { to: home, label: "Home", icon: LayoutDashboard, end: true },
    { to: "/app/bed-board", label: "Bed Board", icon: BedDouble },
    { to: "/app/admissions", label: "Patient flow", icon: UserRoundPlus },
    { to: "/app/forecast", label: "Forecast", icon: TrendingUp },
    { to: "/app/outbreak", label: "Outbreak", icon: Siren },
    { to: "/app/admin", label: "Admin view", icon: Shield },
    { to: "/app/settings", label: "Settings", icon: Settings },
  ]
  const nurse: SidebarNavItem[] = [
    { to: home, label: "Home", icon: LayoutDashboard, end: true },
    { to: "/app/bed-board", label: "Bed Board", icon: BedDouble },
    { to: "/app/admissions", label: "Admissions", icon: UserRoundPlus },
    { to: "/app/inventory", label: "Inventory", icon: Package },
    { to: "/app/settings", label: "Settings", icon: Settings },
  ]
  const staff: SidebarNavItem[] = [
    { to: home, label: "Home", icon: LayoutDashboard, end: true },
    { to: "/app/bed-board", label: "Bed Board", icon: BedDouble },
    { to: "/app/admissions", label: "Admissions", icon: UserRoundPlus },
    { to: "/app/inventory", label: "Inventory", icon: Package },
    { to: "/app/settings", label: "Settings", icon: Settings },
  ]
  if (role === "nurse") return nurse
  if (role === "staff") return staff
  return doctor
}

export function firstAppModuleForRole(role: HospitalRole): string {
  if (role === "staff") return "/app/inventory"
  return "/app/bed-board"
}
