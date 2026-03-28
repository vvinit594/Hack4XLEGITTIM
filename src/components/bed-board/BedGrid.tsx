import { useMemo } from "react"
import type { BedWithPatient } from "@/types/bed"

import { BedTile } from "./BedTile"

type BedGridProps = {
  beds: BedWithPatient[]
  selectedBedId: string | null
  registerBedNode: (bedId: string, node: HTMLElement | null) => void
  onSelectBed: (bed: BedWithPatient) => void
}

// Extract section from bed code (e.g., "A" from "A-01")
function extractSection(bedCode: string): string {
  return bedCode.split("-")[0] || "Unknown"
}

// Group beds by section
function groupBedsBySection(beds: BedWithPatient[]) {
  const grouped = new Map<string, BedWithPatient[]>()

  beds.forEach((bed) => {
    const section = extractSection(bed.code)
    if (!grouped.has(section)) {
      grouped.set(section, [])
    }
    grouped.get(section)!.push(bed)
  })

  // Sort sections alphabetically and sort beds within each section
  return Array.from(grouped.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([section, sectionBeds]) => ({
      section,
      beds: sectionBeds.sort((a, b) => a.code.localeCompare(b.code)),
    }))
}

export function BedGrid({
  beds,
  selectedBedId,
  registerBedNode,
  onSelectBed,
}: BedGridProps) {
  const groupedBeds = useMemo(() => groupBedsBySection(beds), [beds])

  return (
    <div className="space-y-6 px-4 py-4 sm:px-5 lg:px-6">
      {groupedBeds.map(({ section, beds: sectionBeds }) => (
        <div key={section}>
          {/* Section Header */}
          <div className="mb-3 flex items-center gap-2">
            <h2 className="text-sm font-semibold text-foreground tracking-tight">
              Section {section}
            </h2>
            <span className="text-xs text-muted-foreground font-medium">
              ({sectionBeds.length} beds)
            </span>
          </div>

          {/* Beds Grid */}
          <div
            className="grid gap-2 sm:gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 xl:grid-cols-7"
            role="list"
            aria-label={`Section ${section} beds`}
          >
            {sectionBeds.map((bed, index) => (
              <div
                key={bed.id}
                ref={(el) => {
                  registerBedNode(bed.id, el)
                }}
                className="min-w-0 scroll-mt-28 h-[120px]"
                role="listitem"
              >
                <BedTile
                  bed={bed}
                  index={index}
                  isSelected={selectedBedId === bed.id}
                  onSelect={onSelectBed}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
