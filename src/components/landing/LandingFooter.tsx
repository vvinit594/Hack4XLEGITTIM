import { BrandLogo } from "@/components/brand/BrandLogo"
import { LandingBrandTitle } from "@/components/landing/LandingBrandTitle"

export function LandingFooter() {
  return (
    <footer className="border-t border-slate-200/90 bg-white py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-center sm:flex-row sm:text-left sm:px-6 lg:px-8">
        <div className="text-muted-foreground flex flex-col items-center gap-3 text-sm sm:flex-row sm:items-start">
          <BrandLogo
            size="sm"
            className="max-h-10 max-w-[100px] shrink-0 object-contain object-left sm:max-w-[120px]"
          />
          <div className="max-w-md text-center sm:text-left">
            <LandingBrandTitle
              size="sm"
              showTagline={false}
              className="text-center sm:text-left"
            />
            <p className="mt-2 text-pretty">
              Ward intelligence for modern hospitals.
            </p>
          </div>
        </div>
        <p className="text-muted-foreground text-xs sm:text-sm">
          © {new Date().getFullYear()} Hospi-Track. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
