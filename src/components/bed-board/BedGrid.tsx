import type { BedWithPatient } from "@/types/bed"

import { BedTile } from "./BedTile"

type BedGridProps = {
  beds: BedWithPatient[]
  selectedBedId: string | null
  registerBedNode: (bedId: string, node: HTMLElement | null) => void
  onSelectBed: (bed: BedWithPatient) => void
  onEditBedStatus: (bed: BedWithPatient) => void
}

export function BedGrid({
  beds,
  selectedBedId,
  registerBedNode,
  onSelectBed,
  onEditBedStatus,
}: BedGridProps) {
  return (
    <div
      className="grid min-h-0 grid-cols-1 gap-6 px-6 py-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4 lg:gap-8 xl:grid-cols-5"
      role="list"
      aria-label="Hospital beds"
    >
      {beds.map((bed, index) => (
        <div
          key={bed.id}
          ref={(el) => {
            registerBedNode(bed.id, el)
          }}
          className="min-h-[200px] min-w-0 scroll-mt-28"
          role="listitem"
        >
          <BedTile
            bed={bed}
            index={index}
            isSelected={selectedBedId === bed.id}
            onSelect={onSelectBed}
            onEditStatus={onEditBedStatus}
          />
        </div>
      ))}
    </div>
  )
}
