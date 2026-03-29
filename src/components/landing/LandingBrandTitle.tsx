import { cn } from "@/lib/utils"

type LandingBrandTitleProps = {
  size?: "sm" | "md"
  /** Nav shows official tagline; footer often uses its own subtitle instead */
  showTagline?: boolean
  className?: string
}

/** Wordmark for marketing / landing only — matches HOSPI-TRACK brand colors */
export function LandingBrandTitle({
  size = "md",
  showTagline = true,
  className,
}: LandingBrandTitleProps) {
  const titleClass =
    size === "sm"
      ? "text-base font-extrabold tracking-tight sm:text-lg"
      : "text-lg font-extrabold tracking-tight sm:text-xl"

  const tagClass =
    size === "sm"
      ? "mt-0.5 text-[9px] font-semibold tracking-[0.18em] text-slate-600 uppercase sm:text-[10px]"
      : "mt-0.5 text-[10px] font-semibold tracking-[0.2em] text-slate-600 uppercase sm:text-[11px]"

  return (
    <div className={cn("min-w-0 text-left", className)}>
      <div className={titleClass}>
        <span className="text-teal-700">Hospi</span>
        <span className="text-slate-800">-</span>
        <span className="text-orange-500">Track</span>
      </div>
      {showTagline ? (
        <p className={tagClass}>Ward intelligence platform</p>
      ) : null}
    </div>
  )
}
