import { Route, Routes } from "react-router-dom"

import { HomePage } from "@/pages/HomePage"
import ForecastDashboard from "@/pages/ForecastDashboard"

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/forecast" element={<ForecastDashboard />} />
    </Routes>
  )
}
