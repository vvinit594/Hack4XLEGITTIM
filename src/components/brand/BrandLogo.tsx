import { cn } from "@/lib/utils"

export const BRAND_LOGO_SRC = "/hlogo.png"

type BrandLogoSize = "xs" | "sm" | "md" | "lg"

const heightClass: Record<BrandLogoSize, string> = {
  xs: "h-6",
  sm: "h-8",
  md: "h-9",
  lg: "h-11",
}

type BrandLogoProps = {
  size?: BrandLogoSize
  className?: string
}

/** Site wordmark / logo — `public/hlogo.png` */
export function BrandLogo({ size = "md", className }: BrandLogoProps) {
  return (
    <img
      src={BRAND_LOGO_SRC}
      alt="Hospi-Track"
      className={cn(
        "w-auto max-w-[min(100%,220px)] shrink-0 object-contain object-left",
        heightClass[size],
        className
      )}
      decoding="async"
    />
  )
}
