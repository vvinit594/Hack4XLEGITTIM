import type { BedStatus } from "@/types/bed"

export const STATUS_LABEL: Record<BedStatus, string> = {
  available: "Available",
  occupied: "Occupied",
  cleaning: "Cleaning",
  reserved: "Reserved",
}

export const TILE_STATUS_STYLES: Record<
  BedStatus,
  { ring: string; bg: string; accent: string; dot: string }
> = {
  available: {
    ring: "ring-emerald-200/90",
    bg: "from-emerald-100/45 via-emerald-50/30 to-white",
    accent: "text-emerald-800",
    dot: "bg-emerald-500",
  },
  occupied: {
    ring: "ring-blue-200/90",
    bg: "from-blue-100/40 via-blue-50/35 to-white",
    accent: "text-blue-900",
    dot: "bg-blue-500",
  },
  cleaning: {
    ring: "ring-amber-200/90",
    bg: "from-amber-100/45 via-amber-50/30 to-white",
    accent: "text-amber-900",
    dot: "bg-amber-500",
  },
  reserved: {
    ring: "ring-violet-200/90",
    bg: "from-violet-100/40 via-violet-50/35 to-white",
    accent: "text-violet-900",
    dot: "bg-violet-500",
  },
}

export const MODAL_STATUS_BUTTON: Record<
  BedStatus,
  { label: string; className: string }
> = {
  available: {
    label: "Available",
    className:
      "border-emerald-200 bg-emerald-50/90 text-emerald-900 hover:bg-emerald-100 hover:shadow-lg hover:shadow-emerald-500/15",
  },
  occupied: {
    label: "Occupied",
    className:
      "border-blue-200 bg-blue-50/90 text-blue-900 hover:bg-blue-100 hover:shadow-lg hover:shadow-blue-500/15",
  },
  cleaning: {
    label: "Cleaning",
    className:
      "border-amber-200 bg-amber-50/90 text-amber-900 hover:bg-amber-100 hover:shadow-lg hover:shadow-amber-500/15",
  },
  reserved: {
    label: "Reserved",
    className:
      "border-violet-200 bg-violet-50/90 text-violet-900 hover:bg-violet-100 hover:shadow-lg hover:shadow-violet-500/15",
  },
}
