import { Navigate, Route, Routes } from "react-router-dom"

import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { AdminDashboardPage } from "@/pages/AdminDashboardPage"
import { AdminWardDetailPage } from "@/pages/AdminWardDetailPage"
import { BedBoardPage } from "@/pages/BedBoardPage"
import { PlaceholderPage } from "@/pages/PlaceholderPage"
import { HomePage } from "@/pages/HomePage"
import { DashboardHomePage } from "@/pages/DashboardHomePage"
import { PatientFlowPage } from "@/pages/PatientFlowPage"
import ForecastDashboard from "@/pages/ForecastDashboard"

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/bed-board" element={<Navigate to="/app/bed-board" replace />} />
      <Route path="/app" element={<DashboardLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardHomePage />} />
        <Route path="bed-board" element={<BedBoardPage />} />
        <Route path="admissions" element={<PatientFlowPage />} />
        <Route
          path="forecast"
          element={<ForecastDashboard />}
        />
        <Route path="alerts" element={<PlaceholderPage title="Alerts" />} />
        <Route path="admin">
          <Route index element={<AdminDashboardPage />} />
          <Route path="ward/:id" element={<AdminWardDetailPage />} />
        </Route>
        <Route
          path="settings"
          element={<PlaceholderPage title="Settings" />}
        />
      </Route>
    </Routes>
  )
}
