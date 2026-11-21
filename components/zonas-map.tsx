"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { ESTADO_CELDA_LABEL } from "@/lib/format"
import type { CeldaMapa, EstadoCelda } from "@/lib/types"

const CORDOBA: L.LatLngTuple = [-31.4201, -64.1888]
const CORDOBA_BOUNDS: L.LatLngBoundsExpression = [
  [-31.54, -64.33],
  [-31.3, -64.05],
]

const STYLES: Record<EstadoCelda, L.PathOptions> = {
  pendiente: { color: "#94a3b8", weight: 1, opacity: 0.7, fillColor: "#cbd5e1", fillOpacity: 0.12 },
  procesando: { color: "#f59e0b", weight: 2, opacity: 1, dashArray: "6 4", fillColor: "#f59e0b", fillOpacity: 0.25 },
  scrapeado: { color: "#10b981", weight: 1.5, opacity: 0.85, fillColor: "#10b981", fillOpacity: 0.2 },
  error: { color: "#9f1239", weight: 2, opacity: 1, dashArray: "4 4", fillColor: "#fb7185", fillOpacity: 0.22 },
}
const SELECTED: L.PathOptions = {
  color: "#DC2626",
  weight: 3,
  opacity: 1,
  dashArray: undefined,
  fillColor: "#DC2626",
  fillOpacity: 0.18,
}

function styleFor(celda: CeldaMapa, selected: boolean): L.PathOptions {
  return selected ? SELECTED : { dashArray: undefined, ...STYLES[celda.estado] }
}

export interface ZonasMapProps {
  barrioId: number | null
  celdas: CeldaMapa[]
  selectedH3: string | null
  addMode: boolean
  onSelect: (h3: string) => void
  onMapClick: (lat: number, lng: number) => void
}

export default function ZonasMap({ barrioId, celdas, selectedH3, addMode, onSelect, onMapClick }: ZonasMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const groupRef = useRef<L.FeatureGroup | null>(null)
  const fittedBarrioRef = useRef<number | null>(null)

  const onSelectRef = useRef(onSelect)
  const onMapClickRef = useRef(onMapClick)
  const addModeRef = useRef(addMode)

  useEffect(() => {
    onSelectRef.current = onSelect
  }, [onSelect])

  useEffect(() => {
    onMapClickRef.current = onMapClick
  }, [onMapClick])

  useEffect(() => {
    addModeRef.current = addMode
    const el = containerRef.current
    if (el) el.classList.toggle("map-add-mode", addMode)
  }, [addMode])

  useEffect(() => {
    if (!containerRef.current) return
    const map = L.map(containerRef.current, {
      center: CORDOBA,
      zoom: 14,
      minZoom: 12,
      maxZoom: 20,
      maxBounds: CORDOBA_BOUNDS,
      maxBoundsViscosity: 0.9,
      zoomControl: true,
      scrollWheelZoom: true,
    })

    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      subdomains: "abcd",
      maxZoom: 20,
      bounds: CORDOBA_BOUNDS,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    }).addTo(map)

    const group = L.featureGroup().addTo(map)
    mapRef.current = map
    groupRef.current = group

    map.on("click", (e: L.LeafletMouseEvent) => {
      if (addModeRef.current) {
        onMapClickRef.current(e.latlng.lat, e.latlng.lng)
      }
    })

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

      const pct = Math.round(celda.porcentaje_escaneo ?? 0)
      const tooltipParts = [
        ESTADO_CELDA_LABEL[celda.estado],
        `${celda.leads_count} ${celda.leads_count === 1 ? "lead" : "leads"}`,
      ]
      if (pct > 0) tooltipParts.push(`${pct}%`)

      polygon.bindTooltip(tooltipParts.join(" · "), {
        sticky: true,
        direction: "top",
        offset: [0, -8],
      })

      polygon.on("mouseover", () => {
        if (selected || addModeRef.current) return
        const hoverFill = celda.estado === "pendiente" ? 0.25 : Math.min((base.fillOpacity ?? 0.2) + 0.1, 0.4)
        polygon.setStyle({ fillOpacity: hoverFill })
      })
      polygon.on("mouseout", () => polygon.setStyle({ fillOpacity: base.fillOpacity }))
      polygon.on("click", () => {
        if (addModeRef.current) return
        onSelectRef.current(celda.h3_index)
      })
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

  return (
    <div
      ref={containerRef}
      className="size-full"
      role="application"
      aria-label="Mapa de celdas hexagonales de Córdoba"
    />
  )
}