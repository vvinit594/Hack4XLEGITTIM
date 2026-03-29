import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Link, useOutletContext } from "react-router-dom"
import { ArrowLeft, Loader2, Wifi, WifiOff } from "lucide-react"

import { BrandLogo } from "@/components/brand/BrandLogo"
import { BedDetailModal } from "@/components/bed-board/BedDetailModal"
import { BedGrid } from "@/components/bed-board/BedGrid"
import { ParticipantListPanel } from "@/components/bed-board/ParticipantListPanel"
import { StatusModal } from "@/components/bed-board/StatusModal"
import { Button } from "@/components/ui/button"
import { useRealtimeBeds } from "@/hooks/useRealtimeBeds"
import { participantsFromBeds } from "@/lib/participants"
import { cn } from "@/lib/utils"
import type { BedWithPatient, ParticipantListItem } from "@/types/bed"

function ConnectionPill({
  isMock,
  state,
}: {
  isMock: boolean
  state: string
}) {
  if (isMock) {
    return null
  }
  if (state === "reconnecting") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/90 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-900">
        <Loader2 className="size-3.5 animate-spin" aria-hidden />
        Reconnecting…
      </span>
    )
  }
  if (state === "error") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200/90 bg-red-50 px-3 py-1 text-xs font-medium text-red-900">
        <WifiOff className="size-3.5" aria-hidden />
        Connection error
      </span>
    )
  }
  if (state === "connected") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/90 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-900">
        <Wifi className="size-3.5" aria-hidden />
        Live
      </span>
    )
  }
  return (
    <span className="text-muted-foreground inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium">
      <Loader2 className="size-3.5 animate-spin" aria-hidden />
      Connecting…
    </span>
  )
}

type MobileTab = "participants" | "beds"

type BedBoardOutletContext = { embedded?: boolean }

function GenderLegend() {
  return (
    <div className="text-muted-foreground flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-slate-200/80 bg-white/70 px-6 py-4 text-xs font-medium backdrop-blur-sm">
      <span className="flex items-center gap-2">
        <span
          className="size-2.5 shrink-0 rounded-full bg-sky-500 shadow-sm"
          aria-hidden
        />
        Male
      </span>
      <span className="flex items-center gap-2">
        <span
          className="size-2.5 shrink-0 rounded-full bg-pink-400 shadow-sm"
          aria-hidden
        />
        Female
      </span>
      <span className="flex items-center gap-2">
        <span
          className="size-2.5 shrink-0 rounded-full bg-amber-400 shadow-sm"
          aria-hidden
        />
        Available bed
      </span>
    </div>
  )
}

export function BedBoardPage() {
  const { embedded = false } =
    useOutletContext<BedBoardOutletContext | undefined>() ?? {}

  const {
    beds,
    waitingParticipants,
    loading,
    error,
    isMock,
    connectionState,
    updateBedStatus,
  } = useRealtimeBeds()

  const participants = useMemo(
    () => participantsFromBeds(beds, waitingParticipants),
    [beds, waitingParticipants]
  )

  const [selectedBedId, setSelectedBedId] = useState<string | null>(null)
  const [selectedParticipantId, setSelectedParticipantId] = useState<
    string | null
  >(null)
  const [mobileTab, setMobileTab] = useState<MobileTab>("participants")

  const [detailBed, setDetailBed] = useState<BedWithPatient | null>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)

  const [statusBed, setStatusBed] = useState<BedWithPatient | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  const bedNodes = useRef(new Map<string, HTMLElement>())
  const participantNodes = useRef(new Map<string, HTMLElement>())

  const registerBedNode = useCallback((id: string, el: HTMLElement | null) => {
    if (el) bedNodes.current.set(id, el)
    else bedNodes.current.delete(id)
  }, [])

  const registerParticipantNode = useCallback(
    (id: string, el: HTMLElement | null) => {
      if (el) participantNodes.current.set(id, el)
      else participantNodes.current.delete(id)
    },
    []
  )

  useEffect(() => {
    if (!selectedBedId) return
    let inner = 0
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => {
        bedNodes.current
          .get(selectedBedId)
          ?.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "nearest",
          })
      })
    })
    return () => {
      cancelAnimationFrame(outer)
      cancelAnimationFrame(inner)
    }
  }, [selectedBedId])

  useEffect(() => {
    if (!selectedParticipantId) return
    let inner = 0
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => {
        participantNodes.current
          .get(selectedParticipantId)
          ?.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "nearest",
          })
      })
    })
    return () => {
      cancelAnimationFrame(outer)
      cancelAnimationFrame(inner)
    }
  }, [selectedParticipantId])

  const handleParticipantClick = useCallback((p: ParticipantListItem) => {
    setSelectedParticipantId(p.id)
    setSelectedBedId(p.bed_id)
    if (p.bed_id) setMobileTab("beds")
  }, [])

  const handleBedClick = useCallback((bed: BedWithPatient) => {
    setSelectedBedId(bed.id)
    setSelectedParticipantId(bed.patient?.id ?? null)
    setDetailBed(bed)
    setDetailModalOpen(true)
    if (bed.patient) setMobileTab("participants")
  }, [])

  const handleEditStatusFromDetail = useCallback((bed: BedWithPatient) => {
    setStatusBed(bed)
    setSheetOpen(true)
  }, [])

  return (
    <div
      className={cn(
        "bg-background flex flex-col",
        embedded ? "min-h-0 flex-1" : "min-h-svh"
      )}
    >
      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(99,102,241,0.08),transparent_50%),radial-gradient(ellipse_at_80%_100%,rgba(59,130,246,0.06),transparent_45%)]"
        aria-hidden
      />

      <header className="border-border/60 bg-background/80 sticky top-0 z-40 border-b backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5 lg:px-6">
          <div className="flex min-w-0 items-center gap-3">
            {!embedded ? (
              <Button
                variant="ghost"
                size="icon-sm"
                className="shrink-0 rounded-xl"
                asChild
              >
                <Link to="/" aria-label="Back to home">
                  <ArrowLeft className="size-4" />
                </Link>
              </Button>
            ) : null}
            <div className="flex min-w-0 items-center gap-2">
              <span className="flex h-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200/90 bg-white px-1.5 shadow-sm">
                <BrandLogo size="xs" className="max-h-7 max-w-[88px]" />
              </span>
              <div className="min-w-0">
                <h1 className="text-foreground truncate text-lg font-bold tracking-tight sm:text-xl">
                  Bed Board
                </h1>
                <p className="text-muted-foreground truncate text-xs sm:text-sm">
                  Hospi-Track · real-time ward view
                </p>
              </div>
            </div>
          </div>
          <ConnectionPill isMock={isMock} state={connectionState} />
        </div>
      </header>

      <main className="relative flex min-h-0 flex-1 flex-col">
        {error && !isMock ? (
          <div
            className="bg-destructive/10 text-destructive mx-4 mt-4 rounded-xl border border-red-200/80 px-4 py-3 text-sm font-medium sm:mx-5"
            role="alert"
          >
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="text-muted-foreground flex flex-1 flex-col items-center justify-center gap-3 py-24">
            <Loader2 className="text-indigo-500 size-10 animate-spin" />
            <p className="text-sm font-medium">Loading beds…</p>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
            <div
              className="bg-background/95 flex shrink-0 border-b border-slate-200/90 p-2 lg:hidden"
              role="tablist"
              aria-label="Board panels"
            >
              <button
                type="button"
                role="tab"
                aria-selected={mobileTab === "participants"}
                className={cn(
                  "flex-1 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors duration-200",
                  mobileTab === "participants"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25"
                    : "text-muted-foreground hover:bg-slate-100"
                )}
                onClick={() => setMobileTab("participants")}
              >
                Participants
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mobileTab === "beds"}
                className={cn(
                  "flex-1 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors duration-200",
                  mobileTab === "beds"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25"
                    : "text-muted-foreground hover:bg-slate-100"
                )}
                onClick={() => setMobileTab("beds")}
              >
                Beds
              </button>
            </div>

            <div
              className={cn(
                "flex min-h-0 min-w-0 flex-1 flex-col lg:flex-row",
                "pb-6 lg:pb-0"
              )}
            >
              <div
                className={cn(
                  "flex min-h-0 min-w-0 lg:shrink-0",
                  mobileTab !== "participants" && "hidden",
                  "lg:flex"
                )}
              >
                <ParticipantListPanel
                  participants={participants}
                  selectedParticipantId={selectedParticipantId}
                  onSelectParticipant={handleParticipantClick}
                  registerNode={registerParticipantNode}
                />
              </div>

              <div
                className={cn(
                  "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden",
                  mobileTab !== "beds" && "hidden",
                  "lg:flex"
                )}
              >
                <GenderLegend />
                <div className="min-h-0 flex-1 overflow-y-auto">
                  <BedGrid
                    beds={beds}
                    selectedBedId={selectedBedId}
                    registerBedNode={registerBedNode}
                    onSelectBed={handleBedClick}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <BedDetailModal
        bed={detailBed}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        onEditStatus={handleEditStatusFromDetail}
      />

      <StatusModal
        bed={statusBed}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onConfirm={updateBedStatus}
      />
    </div>
  )
}
