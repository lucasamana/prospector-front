"use client"

import { Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Spinner } from "@/components/form-controls"

const ITEMS = [
  { label: "Pendiente", color: "#94a3b8" },
  { label: "Procesando", color: "#f59e0b" },
  { label: "Scrapeado", color: "#10b981" },
  { label: "Error", color: "#fb7185" },
  { label: "Seleccionada", color: "#DC2626" },
]

interface MapLegendProps {
  live: boolean
  barrioNombre?: string
  addMode: boolean
  adding: boolean
  onToggleAddMode: () => void
}

export function MapLegend({ live, barrioNombre, addMode, adding, onToggleAddMode }: MapLegendProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <ul className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5" aria-label="Leyenda">
          {ITEMS.map((item) => (
            <li key={item.label} className="flex items-center gap-1.5 text-xs text-zinc-600">
              <span className="size-2 rounded-full" style={{ backgroundColor: item.color }} aria-hidden />
              {item.label}
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap items-center gap-2">
          {live && (
            <span
              role="status"
              className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700"
            >
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-500 opacity-70" />
                <span className="relative inline-flex size-1.5 rounded-full bg-amber-500" />
              </span>
              Actualizando en vivo...
            </span>
          )}
          {barrioNombre && <span className="text-xs font-medium text-zinc-900">{barrioNombre}</span>}
          <button
            type="button"
            onClick={onToggleAddMode}
            disabled={adding}
            aria-pressed={addMode}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-red-600/25 disabled:opacity-60",
              addMode
                ? "border-red-600 bg-red-600 text-white hover:bg-red-700"
                : "border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50",
            )}
          >
            {adding ? (
              <Spinner className="size-3.5" />
            ) : addMode ? (
              <X className="size-3.5" aria-hidden />
            ) : (
              <Plus className="size-3.5" aria-hidden />
            )}
            {addMode ? "Cancelar" : "+ Agregar zona"}
          </button>
        </div>
      </div>

      {addMode && (
        <div
          role="status"
          className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800"
        >
          <span>
            Hacé clic en cualquier punto de Córdoba Capital para sumar ese hexágono
            {barrioNombre ? (
              <>
                {" "}
                a <strong className="font-semibold">{barrioNombre}</strong>
              </>
            ) : (
              " al barrio activo"
            )}
            .
          </span>
        </div>
      )}
    </div>
  )
}