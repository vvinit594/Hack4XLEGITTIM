import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"

import { Toaster } from "@/components/ui/sonner"

import { AuthRoleProvider } from "@/context/AuthRoleContext"

import App from "./App.tsx"
import "./index.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthRoleProvider>
        <App />
        <Toaster position="top-center" richColors closeButton />
      </AuthRoleProvider>
    </BrowserRouter>
  </StrictMode>,
)
