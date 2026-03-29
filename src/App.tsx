import { Navigate, Route, Routes } from "react-router-dom"

import { AppModuleGate } from "@/components/auth/AppModuleGate"
import { RedirectRoleDashboard } from "@/components/auth/RedirectRoleDashboard"
import { RequireAuth } from "@/components/auth/RequireAuth"
import { RequireAuthRoleMatch } from "@/components/auth/RequireAuthRoleMatch"
import PageLoaderWrapper from "@/components/PageLoaderWrapper"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { RoleLayout } from "@/components/layout/RoleLayout"
import { AdminDashboardPage } from "@/pages/AdminDashboardPage"
import { AdminWardDetailPage } from "@/pages/AdminWardDetailPage"
import { BedBoardPage } from "@/pages/BedBoardPage"
import { CapacityForecastPage } from "@/pages/CapacityForecastPage"
import { HomePage } from "@/pages/HomePage"
import { InventoryPage } from "@/pages/InventoryPage"
import { OutbreakPage } from "@/pages/OutbreakPage"
import { PatientFlowPage } from "@/pages/PatientFlowPage"
import { PlaceholderPage } from "@/pages/PlaceholderPage"
import { RoleDashboardPage } from "@/pages/RoleDashboardPage"

function AppShellWithAuth() {
  return (
    <RequireAuth>
      <DashboardLayout />
    </RequireAuth>
  )
}

export default function App() {
  return (
    <PageLoaderWrapper>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/bed-board" element={<Navigate to="/app/bed-board" replace />} />
        <Route
          path="/inventory"
          element={<Navigate to="/app/inventory" replace />}
        />
        <Route
          path="/outbreak"
          element={<Navigate to="/app/outbreak" replace />}
        />
        <Route
          path="/forecast"
          element={<Navigate to="/app/forecast" replace />}
        />

        <Route path="/:userRole" element={<RequireAuthRoleMatch />}>
          <Route element={<RoleLayout />}>
            <Route path="dashboard" element={<RoleDashboardPage />} />
          </Route>
        </Route>

        <Route path="/app" element={<AppShellWithAuth />}>
          <Route element={<AppModuleGate />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<RedirectRoleDashboard />} />
            <Route path="bed-board" element={<BedBoardPage />} />
            <Route path="admissions" element={<PatientFlowPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="outbreak" element={<OutbreakPage />} />
            <Route path="forecast" element={<CapacityForecastPage />} />
            <Route path="admin">
              <Route index element={<AdminDashboardPage />} />
              <Route path="ward/:id" element={<AdminWardDetailPage />} />
            </Route>
            <Route
              path="settings"
              element={<PlaceholderPage title="Settings" />}
            />
          </Route>
        </Route>
      </Routes>
    </PageLoaderWrapper>
  )
}
