import { Activity } from "lucide-react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const links = [
  { kind: "section" as const, id: "features", label: "Features" },
  { kind: "section" as const, id: "how-it-works", label: "How it works" },
  { kind: "page" as const, to: "/app/dashboard", label: "Dashboard" },
]

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
}

export function LandingNav({ className }: { className?: string }) {
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
          className="text-foreground flex items-center gap-2 font-semibold tracking-tight"
          onClick={(e) => {
            e.preventDefault()
            window.scrollTo({ top: 0, behavior: "smooth" })
          }}
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-500/25">
            <Activity className="size-4" aria-hidden />
          </span>
          <span className="hidden sm:inline">Hospi-Track</span>
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
          <Button
            asChild
            size="sm"
            className="rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-500/25 transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-lg hover:shadow-indigo-500/30"
          >
            <Link to="/app/dashboard">View dashboard</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
