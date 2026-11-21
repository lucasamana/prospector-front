"use client"

import { useState } from "react"
import { AlertTriangle, ArrowRight, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { ESTADO_CELDA_LABEL, formatDateTime } from "@/lib/format"
import type { CeldaMapa, EstadoCelda, ExtraerZonaPayload } from "@/lib/types"
import { NativeSelect, Spinner, fieldClass } from "@/components/form-controls"

// Un radio de 200 m cubre exactamente una celda H3 resolución 9.
const H3_RES9_RADIUS_KM = 0.2

// Coincide con RUBROS_OBJETIVO en app/routers/zonas.py
const RUBROS = ["general", "cafe", "barberia", "restaurante", "gimnasio", "kiosco"]

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
  const [submitting, setSubmitting] = useState(false)

  const procesando = celda.estado === "procesando"
  const busy = procesando || submitting
  const pct = Math.max(0, Math.min(100, Math.round(celda.porcentaje_escaneo ?? 0)))

  const rubrosScrapeados = celda.rubros_scrapeados ?? []
  const scrapeadosSet = new Set(rubrosScrapeados.map((r) => r.trim().toLowerCase()))

  async function submit() {
    setSubmitting(true)
    try {
      const cleaned = rubro.trim()
      // En el backend, rubro=null dispara la búsqueda amplia ("comercio", "local") y se registra como "general".
      const rubroPayload = !cleaned || cleaned.toLowerCase() === "general" ? null : cleaned
      await onExtraer(celda, {
        rubro: rubroPayload,
        max_results: Number(maxResults),
        radius_km: H3_RES9_RADIUS_KM,
      })
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
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
                ESTADO_STYLES[celda.estado],
              )}
            >
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

      {/* Progreso de escaneo del hexágono */}
      <div className="flex flex-col gap-2 rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-3">
        <div className="flex items-center justify-between text-xs tabular-nums">
          <span className="font-medium text-zinc-600">Cobertura de la celda</span>
          <span className="font-semibold text-zinc-950">{pct}%</span>
        </div>
        <div
          className="h-1.5 overflow-hidden rounded-full bg-zinc-200/80"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Porcentaje de escaneo de la celda"
        >
          <div
            className={cn("h-full rounded-full transition-[width] duration-500", pct >= 100 ? "bg-emerald-500" : "bg-red-600")}
            style={{ width: `${pct}%` }}
          />
        </div>
        {rubrosScrapeados.length > 0 ? (
          <div className="flex flex-wrap gap-1 pt-0.5">
            {rubrosScrapeados.map((r) => (
              <span
                key={r}
                className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700"
              >
                <Check className="size-3" strokeWidth={2.5} aria-hidden />
                {r}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-[11px] text-zinc-400">Sin pasadas registradas todavía.</p>
        )}
      </div>

      {/* Alerta de saturación */}
      {celda.saturada && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800"
        >
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" aria-hidden />
          <p className="text-pretty">
            Esta celda alcanzó el tope de resultados: probá escanear rubros específicos para no dejar comercios afuera.
          </p>
        </div>
      )}

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
          {RUBROS.map((r) => {
            const done = scrapeadosSet.has(r)
            const selected = rubro.trim().toLowerCase() === r || (r === "general" && rubro === "general")
            return (
              <button
                key={r}
                type="button"
                onClick={() => setRubro(selected ? "" : r)}
                aria-pressed={selected}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                  selected
                    ? "border-red-200 bg-red-50 text-red-700"
                    : done
                      ? "border-emerald-200 bg-emerald-50/70 text-emerald-800 hover:bg-emerald-50"
                      : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50",
                )}
              >
                {done && <Check className="size-3 text-emerald-600" strokeWidth={2.5} aria-hidden />}
                {r}
              </button>
            )
          })}
        </div>
      </div>

      <NativeSelect label="Máx. resultados" visibleLabel value={maxResults} onChange={setMaxResults}>
        <option value="20">20</option>
        <option value="40">40</option>
        <option value="80">80</option>
      </NativeSelect>

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