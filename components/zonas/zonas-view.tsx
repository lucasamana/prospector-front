"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import useSWR from "swr"
import { toast } from "sonner"
import { api, ApiError } from "@/lib/api"
import { useBarrios, revalidateLeadsAndBarrios } from "@/lib/hooks"
import type { CeldaMapa, EstadoCelda, ExtraerZonaPayload } from "@/lib/types"
import { BarriosSidebar } from "./barrios-sidebar"
import { MapLegend } from "./map-legend"
import { CeldaPanel } from "./celda-panel"

const ZonasMap = dynamic(() => import("@/components/zonas-map"), {
  ssr: false,
  loading: () => (
    <div className="grid size-full place-items-center bg-zinc-50">
      <div className="flex flex-col items-center gap-2 text-sm text-zinc-400">
        <span className="size-6 animate-spin rounded-full border-2 border-zinc-300 border-r-transparent" aria-hidden />
        Cargando mapa…
      </div>
    </div>
  ),
})

const POLL_MS = 5000
const hasProcesando = (celdas?: CeldaMapa[]) => !!celdas?.some((c) => c.estado === "procesando")

export function ZonasView({ onViewLeads }: { onViewLeads: (h3: string) => void }) {
  const [chosenBarrioId, setChosenBarrioId] = useState<number | null>(null)
  const [selectedH3, setSelectedH3] = useState<string | null>(null)
  const [polling, setPolling] = useState(false)

  const { data: barrios, isLoading: loadingBarrios } = useBarrios(polling ? POLL_MS : 0)
  const barrioId = chosenBarrioId ?? barrios?.[0]?.id ?? null

  const celdasKey = barrioId !== null ? (["celdas", barrioId] as const) : null
  const { data: celdas, mutate: mutateCeldas } = useSWR(celdasKey, ([, id]) => api.listCeldas(id), {
    refreshInterval: (latest) => (hasProcesando(latest) ? POLL_MS : 0),
    keepPreviousData: false,
  })

  const processing = hasProcesando(celdas)
  useEffect(() => {
    setPolling(processing)
  }, [processing])

  const prevRef = useRef<{ barrioId: number | null; estados: Map<string, EstadoCelda> }>({ barrioId: null, estados: new Map() })
  useEffect(() => {
    if (!celdas) return
    const prev = prevRef.current
    const sameBarrio = prev.barrioId === barrioId
    let changed = false
    if (sameBarrio) {
      for (const c of celdas) {
        if (prev.estados.get(c.h3_index) !== "procesando") continue
        if (c.estado === "scrapeado") {
          changed = true
          toast.success("Zona relevada", {
            description: `${c.leads_count} ${c.leads_count === 1 ? "comercio encontrado" : "comercios encontrados"}`,
          })
        } else if (c.estado === "error") {
          changed = true
          toast.error("La extracción de la zona falló", { description: c.h3_index })
        }
      }
    }
    prevRef.current = { barrioId, estados: new Map(celdas.map((c) => [c.h3_index, c.estado])) }
    if (changed) revalidateLeadsAndBarrios()
  }, [celdas, barrioId])

  const selectedCelda = celdas?.find((c) => c.h3_index === selectedH3) ?? null
  const barrio = barrios?.find((b) => b.id === barrioId) ?? null

  const selectBarrio = (id: number) => {
    setChosenBarrioId(id)
    setSelectedH3(null)
  }

  const handleSelect = useCallback((h3: string) => setSelectedH3(h3), [])

  async function extraer(celda: CeldaMapa, payload: ExtraerZonaPayload) {
    const markProcesando = (list?: CeldaMapa[]) =>
      list?.map((c) => (c.h3_index === celda.h3_index ? { ...c, estado: "procesando" as const } : c))
    try {
      await mutateCeldas(
        async (current) => {
          await api.extraerZona(celda.h3_index, payload)
          return markProcesando(current)
        },
        { optimisticData: (current) => markProcesando(current) ?? [], rollbackOnError: true, revalidate: false },
      )
      setPolling(true)
      toast("Extracción iniciada", {
        description: payload.rubro ? `Buscando "${payload.rubro}" en la zona…` : "Buscando comercios en la zona…",
      })
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        toast.warning("Esta zona ya se está procesando")
        mutateCeldas()
      } else {
        toast.error("No se pudo iniciar la extracción", { description: (err as Error).message })
      }
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-balance">Mapa de Zonas</h1>
        <p className="text-sm text-zinc-500">Elegí un barrio, tocá un hexágono y extraé los comercios de esa zona.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[300px_1fr] lg:gap-6">
        <BarriosSidebar barrios={barrios} loading={loadingBarrios} selectedId={barrioId} onSelect={selectBarrio} />

        <div className="flex min-w-0 flex-col gap-3">
          <MapLegend live={processing} barrioNombre={barrio?.nombre} />
          <div className="relative z-0 h-[480px] overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 md:h-[640px]">
            <ZonasMap barrioId={barrioId} celdas={celdas ?? []} selectedH3={selectedH3} onSelect={handleSelect} />
            {selectedCelda && (
              <div className="absolute top-4 right-4 z-[400] hidden w-80 rounded-2xl border border-zinc-200 bg-white/90 p-4 shadow-lg backdrop-blur-md md:block">
                <CeldaPanel
                  key={selectedCelda.h3_index}
                  celda={selectedCelda}
                  onClose={() => setSelectedH3(null)}
                  onExtraer={extraer}
                  onViewLeads={onViewLeads}
                />
              </div>
            )}
          </div>
          {selectedCelda ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 md:hidden">
              <CeldaPanel
                key={selectedCelda.h3_index}
                celda={selectedCelda}
                onClose={() => setSelectedH3(null)}
                onExtraer={extraer}
                onViewLeads={onViewLeads}
              />
            </div>
          ) : (
            <p className="text-center text-xs text-zinc-400 md:hidden">Tocá un hexágono para ver sus acciones.</p>
          )}
        </div>
      </div>
    </div>
  )
}
