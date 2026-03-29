import { Link } from "react-router-dom"

import { BrandLogo } from "@/components/brand/BrandLogo"
import { LandingBrandTitle } from "@/components/landing/LandingBrandTitle"
import { useAuthRole } from "@/context/AuthRoleContext"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
}

export function LandingNav({ className }: { className?: string }) {
  const { isAuthenticated, role, openRoleModal } = useAuthRole()

  const links = [
    { kind: "section" as const, id: "features", label: "Features" },
    { kind: "section" as const, id: "how-it-works", label: "How it works" },
    ...(isAuthenticated && role
      ? ([
          {
            kind: "page" as const,
            to: `/${role}/dashboard`,
            label: "Dashboard",
          },
        ] as const)
      : ([
          {
            kind: "modal" as const,
            label: "Dashboard",
          },
        ] as const)),
  ] as const

  return (
    <header
      className={cn(
        "border-border/60 bg-background/70 supports-[backdrop-filter]:bg-background/55 fixed top-0 right-0 left-0 z-50 border-b backdrop-blur-xl",
        className
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <a
          href="#top"
          className="text-foreground flex min-w-0 items-center gap-2.5 sm:gap-3"
          onClick={(e) => {
            e.preventDefault()
            window.scrollTo({ top: 0, behavior: "smooth" })
          }}
        >
          <BrandLogo
            size="md"
            className="max-h-9 max-w-[100px] shrink-0 object-contain object-left sm:max-h-10 sm:max-w-[120px]"
          />
          <LandingBrandTitle size="md" showTagline className="min-w-0" />
        </a>
        <nav
          className="text-muted-foreground hidden items-center gap-1 text-sm font-medium md:flex"
          aria-label="Primary"
        >
          {links.map((l) =>
            l.kind === "page" ? (
              <Link
                key={l.to}
                to={l.to}
                className="hover:text-foreground rounded-lg px-3 py-2 transition-colors duration-300 ease-in-out"
              >
                {l.label}
              </Link>
            ) : l.kind === "modal" ? (
              <button
                key="dashboard-modal"
                type="button"
                onClick={openRoleModal}
                className="hover:text-foreground rounded-lg px-3 py-2 transition-colors duration-300 ease-in-out"
              >
                {l.label}
              </button>
            ) : (
              <button
                key={l.id}
                type="button"
                onClick={() => scrollToSection(l.id)}
                className="hover:text-foreground rounded-lg px-3 py-2 transition-colors duration-300 ease-in-out"
              >
                {l.label}
              </button>
            )
          )}
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="hidden sm:inline-flex"
            onClick={() => scrollToSection("cta")}
          >
            Request demo
          </Button>
          {isAuthenticated && role ? (
            <Button
              asChild
              size="sm"
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-500/25 transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-lg hover:shadow-indigo-500/30"
            >
              <Link to={`/${role}/dashboard`}>View dashboard</Link>
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-500/25 transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-lg hover:shadow-indigo-500/30"
              onClick={openRoleModal}
            >
              View dashboard
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
