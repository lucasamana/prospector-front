"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import type { BarrioAvance } from "@/lib/types"

interface BarriosSidebarProps {
  barrios: BarrioAvance[] | undefined
  loading: boolean
  selectedId: number | null
  onSelect: (id: number) => void
}

export function BarriosSidebar({ barrios, loading, selectedId, onSelect }: BarriosSidebarProps) {
  const [open, setOpen] = useState(false)
  const selected = barrios?.find((b) => b.id === selectedId)

  return (
    <aside aria-label="Barrios" className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="lista-barrios"
        className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-200/80 bg-white px-4 py-3 text-left lg:hidden"
      >
        <span className="flex flex-col">
          <span className="text-xs text-zinc-500">Barrio</span>
          <span className="font-medium text-zinc-950">{selected?.nombre ?? "Elegí un barrio"}</span>
        </span>
        <ChevronDown className={cn("size-4 text-zinc-500 transition-transform", open && "rotate-180")} aria-hidden />
      </button>

      <h2 className="hidden px-1 text-xs font-medium tracking-wide text-zinc-500 uppercase lg:block">Barrios</h2>

      <ul id="lista-barrios" className={cn("flex-col gap-2 lg:flex", open ? "flex" : "hidden")}>
        {loading && !barrios
          ? Array.from({ length: 5 }).map((_, i) => (
              <li key={i} className="h-[104px] animate-pulse rounded-2xl border border-zinc-200/80 bg-white" />
            ))
          : barrios?.map((b) => (
              <li key={b.id}>
                <BarrioCard
                  barrio={b}
                  active={b.id === selectedId}
                  onClick={() => {
                    onSelect(b.id)
                    setOpen(false)
                  }}
                />
              </li>
            ))}
      </ul>
    </aside>
  )
}

function BarrioCard({ barrio, active, onClick }: { barrio: BarrioAvance; active: boolean; onClick: () => void }) {
  const pct = Math.max(0, Math.min(100, Math.round(barrio.porcentaje_relevado)))
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex w-full flex-col gap-3 rounded-2xl border p-4 text-left transition-colors outline-none focus-visible:ring-3 focus-visible:ring-red-600/20",
        active ? "border-red-200 bg-red-50/40" : "border-zinc-200/80 bg-white hover:bg-zinc-50",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-zinc-950">{barrio.nombre}</span>
        {barrio.celdas_procesando > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
            <span className="size-1.5 animate-pulse rounded-full bg-amber-500" aria-hidden />
            {barrio.celdas_procesando} procesando
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between text-xs text-zinc-500 tabular-nums">
          <span>Relevado</span>
          <span className="font-medium text-zinc-900">
            {pct}% <span className="font-normal text-zinc-400">· {barrio.celdas_scrapeadas}/{barrio.celdas_totales}</span>
          </span>
        </div>
        <div
          className="h-1.5 overflow-hidden rounded-full bg-zinc-100"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Relevamiento de ${barrio.nombre}`}
        >
          <div
            className={cn("h-full rounded-full transition-[width] duration-500", pct >= 100 ? "bg-emerald-500" : "bg-red-600")}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <p className="text-xs text-zinc-500 tabular-nums">
        <span className="font-medium text-zinc-900">{barrio.leads_totales.toLocaleString("es-AR")}</span> leads ·{" "}
        {Math.round(barrio.porcentaje_contactado)}% contactados
      </p>
    </button>
  )
}
