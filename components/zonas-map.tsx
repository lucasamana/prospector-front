"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { ESTADO_CELDA_LABEL } from "@/lib/format"
import type { CeldaMapa, EstadoCelda } from "@/lib/types"

const CORDOBA: L.LatLngTuple = [-31.4201, -64.1888]

const STYLES: Record<EstadoCelda, L.PathOptions> = {
  pendiente: { color: "#94a3b8", weight: 1, opacity: 0.7, fillColor: "#cbd5e1", fillOpacity: 0.12 },
  procesando: { color: "#f59e0b", weight: 2, opacity: 1, dashArray: "6 4", fillColor: "#f59e0b", fillOpacity: 0.25 },
  scrapeado: { color: "#10b981", weight: 1.5, opacity: 0.85, fillColor: "#10b981", fillOpacity: 0.2 },
  error: { color: "#9f1239", weight: 2, opacity: 1, dashArray: "4 4", fillColor: "#fb7185", fillOpacity: 0.22 },
}
const SELECTED: L.PathOptions = { color: "#DC2626", weight: 3, opacity: 1, dashArray: undefined, fillColor: "#DC2626", fillOpacity: 0.18 }

function styleFor(celda: CeldaMapa, selected: boolean): L.PathOptions {
  return selected ? SELECTED : { dashArray: undefined, ...STYLES[celda.estado] }
}

export interface ZonasMapProps {
  barrioId: number | null
  celdas: CeldaMapa[]
  selectedH3: string | null
  onSelect: (h3: string) => void
}

export default function ZonasMap({ barrioId, celdas, selectedH3, onSelect }: ZonasMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const groupRef = useRef<L.FeatureGroup | null>(null)
  const fittedBarrioRef = useRef<number | null>(null)
  const onSelectRef = useRef(onSelect)

  useEffect(() => {
    onSelectRef.current = onSelect
  }, [onSelect])

  useEffect(() => {
    if (!containerRef.current) return
    const map = L.map(containerRef.current, { center: CORDOBA, zoom: 14, zoomControl: true, scrollWheelZoom: true })
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      className: "zona-tiles",
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map)
    const group = L.featureGroup().addTo(map)
    mapRef.current = map
    groupRef.current = group

    const ro = new ResizeObserver(() => map.invalidateSize())
    ro.observe(containerRef.current)

    return () => {
      ro.disconnect()
      map.remove()
      mapRef.current = null
      groupRef.current = null
      fittedBarrioRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    const group = groupRef.current
    if (!map || !group) return
    group.clearLayers()

    for (const celda of celdas) {
      if (!celda.poligono_json?.length) continue
      const selected = celda.h3_index === selectedH3
      const base = styleFor(celda, selected)
      const polygon = L.polygon(celda.poligono_json, { ...base, className: "zona-hex" })
      polygon.bindTooltip(
        `${ESTADO_CELDA_LABEL[celda.estado]} · ${celda.leads_count} ${celda.leads_count === 1 ? "lead" : "leads"}`,
        { sticky: true, direction: "top", offset: [0, -8] },
      )
      polygon.on("mouseover", () => {
        if (selected) return
        const hoverFill = celda.estado === "pendiente" ? 0.25 : Math.min((base.fillOpacity ?? 0.2) + 0.1, 0.4)
        polygon.setStyle({ fillOpacity: hoverFill })
      })
      polygon.on("mouseout", () => polygon.setStyle({ fillOpacity: base.fillOpacity }))
      polygon.on("click", () => onSelectRef.current(celda.h3_index))
      polygon.addTo(group)
      if (selected) polygon.bringToFront()
    }

    if (barrioId !== null && fittedBarrioRef.current !== barrioId && celdas.length > 0) {
      const bounds = group.getBounds()
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [28, 28] })
        fittedBarrioRef.current = barrioId
      }
    }
  }, [celdas, selectedH3, barrioId])

  return <div ref={containerRef} className="size-full" role="application" aria-label="Mapa de celdas hexagonales de Córdoba" />
}
