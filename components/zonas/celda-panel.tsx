"use client"

import { useState } from "react"
import { ArrowRight, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { ESTADO_CELDA_LABEL, formatDateTime } from "@/lib/format"
import type { CeldaMapa, EstadoCelda, ExtraerZonaPayload } from "@/lib/types"
import { NativeSelect, Spinner, fieldClass } from "@/components/form-controls"

const RUBROS = ["cafe", "barberia", "restaurante", "gimnasio", "kiosco", "ferreteria"]

const ESTADO_STYLES: Record<EstadoCelda, string> = {
  pendiente: "border-zinc-200 bg-zinc-50 text-zinc-600",
  procesando: "border-amber-200 bg-amber-50 text-amber-700",
  scrapeado: "border-emerald-200 bg-emerald-50 text-emerald-700",
  error: "border-rose-200 bg-rose-50 text-rose-700",
}

interface CeldaPanelProps {
  celda: CeldaMapa
  onClose: () => void
  onExtraer: (celda: CeldaMapa, payload: ExtraerZonaPayload) => Promise<void>
  onViewLeads: (h3: string) => void
}

export function CeldaPanel({ celda, onClose, onExtraer, onViewLeads }: CeldaPanelProps) {
  const [rubro, setRubro] = useState("")
  const [maxResults, setMaxResults] = useState("40")
  const [radius, setRadius] = useState("0.2")
  const [submitting, setSubmitting] = useState(false)
  const procesando = celda.estado === "procesando"
  const busy = procesando || submitting

  async function submit() {
    setSubmitting(true)
    try {
      await onExtraer(celda, { rubro: rubro.trim() || null, max_results: Number(maxResults), radius_km: Number(radius) })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-col gap-1.5">
          <p className="truncate font-mono text-xs text-zinc-500">{celda.h3_index}</p>
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium", ESTADO_STYLES[celda.estado])}>
              {procesando && <span className="size-1.5 animate-pulse rounded-full bg-amber-500" aria-hidden />}
              {ESTADO_CELDA_LABEL[celda.estado]}
            </span>
            <span className="text-sm font-medium text-zinc-950 tabular-nums">
              {celda.leads_count} {celda.leads_count === 1 ? "lead" : "leads"}
            </span>
          </div>
          {celda.ultimo_scraping && (
            <p className="text-xs text-zinc-500">Último relevamiento: {formatDateTime(celda.ultimo_scraping)}</p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar panel"
          className="grid size-8 shrink-0 place-items-center rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={`rubro-${celda.h3_index}`} className="text-xs font-medium text-zinc-600">
          Rubro
        </label>
        <input
          id={`rubro-${celda.h3_index}`}
          value={rubro}
          onChange={(e) => setRubro(e.target.value)}
          placeholder="Ej: cafe, barberia — vacío = general"
          className={fieldClass}
        />
        <div className="flex flex-wrap gap-1.5">
          {RUBROS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRubro(rubro === r ? "" : r)}
              aria-pressed={rubro === r}
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                rubro === r ? "border-red-200 bg-red-50 text-red-700" : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50",
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <NativeSelect label="Máx. resultados" visibleLabel value={maxResults} onChange={setMaxResults}>
          <option value="20">20</option>
          <option value="40">40</option>
          <option value="80">80</option>
        </NativeSelect>
        <NativeSelect label="Radio (km)" visibleLabel value={radius} onChange={setRadius}>
          <option value="0.15">0.15</option>
          <option value="0.2">0.2</option>
          <option value="0.3">0.3</option>
        </NativeSelect>
      </div>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={submit}
          disabled={busy}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-medium text-white transition-colors hover:bg-red-700 focus-visible:ring-3 focus-visible:ring-red-600/30 outline-none disabled:opacity-60"
        >
          {busy && <Spinner />}
          {procesando ? "Procesando zona…" : "Extraer comercios de esta zona"}
        </button>
        {celda.leads_count > 0 && (
          <button
            type="button"
            onClick={() => onViewLeads(celda.h3_index)}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
          >
            Ver leads de esta zona ({celda.leads_count})
            <ArrowRight className="size-4" aria-hidden />
          </button>
        )}
      </div>
    </div>
  )
}
