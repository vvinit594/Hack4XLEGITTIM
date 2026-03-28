import { CtaSection } from "@/components/landing/CtaSection"
import { DashboardPreviewSection } from "@/components/landing/DashboardPreviewSection"
import { FeaturesSection } from "@/components/landing/FeaturesSection"
import { HeroSection } from "@/components/landing/HeroSection"
import { HowItWorksSection } from "@/components/landing/HowItWorksSection"
import { LandingFooter } from "@/components/landing/LandingFooter"
import { LandingNav } from "@/components/landing/LandingNav"

export function HomePage() {
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
