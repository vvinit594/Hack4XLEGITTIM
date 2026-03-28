import { Activity } from "lucide-react"

export function LandingFooter() {
  return (
    <footer className="border-t border-slate-200/90 bg-white py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-center sm:flex-row sm:text-left sm:px-6 lg:px-8">
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <span className="flex size-8 items-center justify-center rounded-lg bg-slate-100 text-indigo-600">
            <Activity className="size-4" aria-hidden />
          </span>
          <div>
            <div className="text-foreground font-semibold">WardWatch AI</div>
            <div>Ward intelligence for modern hospitals.</div>
          </div>
        </div>
        <p className="text-muted-foreground text-xs sm:text-sm">
          © {new Date().getFullYear()} WardWatch AI. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
