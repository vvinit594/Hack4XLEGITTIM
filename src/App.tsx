import { Navigate, Route, Routes } from "react-router-dom"

import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { BedBoardPage } from "@/pages/BedBoardPage"
import { CapacityForecastPage } from "@/pages/CapacityForecastPage"
import { DashboardHomePage } from "@/pages/DashboardHomePage"
import { HomePage } from "@/pages/HomePage"
import { PatientFlowPage } from "@/pages/PatientFlowPage"
import { PlaceholderPage } from "@/pages/PlaceholderPage"

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
          element={<CapacityForecastPage />}
        />
        <Route path="alerts" element={<PlaceholderPage title="Alerts" />} />
        <Route
          path="admin"
          element={<PlaceholderPage title="Admin view" />}
        />
        <Route
          path="settings"
          element={<PlaceholderPage title="Settings" />}
        />
      </Route>
    </Routes>
  )
}
