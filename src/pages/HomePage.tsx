import { useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

import { useAuthRole } from "@/context/AuthRoleContext"
import { CtaSection } from "@/components/landing/CtaSection"
import { DashboardPreviewSection } from "@/components/landing/DashboardPreviewSection"
import { FeaturesSection } from "@/components/landing/FeaturesSection"
import { HeroSection } from "@/components/landing/HeroSection"
import { HowItWorksSection } from "@/components/landing/HowItWorksSection"
import { LandingFooter } from "@/components/landing/LandingFooter"
import { LandingNav } from "@/components/landing/LandingNav"

export function HomePage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { openRoleModal } = useAuthRole()
  const enter = searchParams.get("enter")

  useEffect(() => {
    if (enter !== "1") return
    openRoleModal()
    navigate("/", { replace: true })
  }, [enter, openRoleModal, navigate])

  return (
    <div className="min-h-svh bg-[#F8FAFC]">
      <LandingNav />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <DashboardPreviewSection />
        <CtaSection />
      </main>
      <LandingFooter />
    </div>
  )
}
