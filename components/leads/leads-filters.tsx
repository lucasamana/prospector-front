"use client"

import { useState } from "react"
import { Hexagon, Search, SlidersHorizontal, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { ESTADO_CRM_OPTIONS, TIPO_TELEFONO_OPTIONS } from "@/lib/format"
import type { BarrioAvance } from "@/lib/types"
import { NativeSelect, fieldClass } from "@/components/form-controls"

export interface FilterState {
  busqueda: string
  rubro: string
  barrio_id: string
  estado_crm: string
  tipo_telefono: string
}

interface LeadsFiltersProps {
  value: FilterState
  onChange: (value: FilterState) => void
  barrios: BarrioAvance[]
  zonaH3: string | null
  onClearZona: () => void
  onClearAll: () => void
  hasActiveFilters: boolean
}

export function LeadsFilters({ value, onChange, barrios, zonaH3, onClearZona, onClearAll, hasActiveFilters }: LeadsFiltersProps) {
  const [open, setOpen] = useState(false)
  const set = (key: keyof FilterState) => (v: string) => onChange({ ...value, [key]: v })
  const secondaryCount = [value.barrio_id, value.estado_crm, value.tipo_telefono, value.rubro].filter(Boolean).length

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200/80 bg-white p-3 md:p-4">
      {zonaH3 && (
        <div>
          <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-red-200 bg-red-50 py-1 pr-1 pl-2.5 text-xs font-medium text-red-700">
            <Hexagon className="size-3.5 shrink-0" aria-hidden />
            <span className="truncate">
              Celda H3: <span className="font-mono">{zonaH3}</span>
            </span>
            <button
              type="button"
              onClick={onClearZona}
              aria-label="Quitar filtro de celda"
              className="grid size-5 place-items-center rounded-full hover:bg-red-100 focus-visible:ring-2 focus-visible:ring-red-600/30 outline-none"
            >
              <X className="size-3.5" aria-hidden />
            </button>
          </span>
        </div>
      )}

      <div className="flex gap-2">
        <label className="relative flex-1">
          <span className="sr-only">Buscar</span>
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400" aria-hidden />
          <input
            type="search"
            value={value.busqueda}
            onChange={(e) => set("busqueda")(e.target.value)}
            placeholder="Buscar comercio, dirección, teléfono o nota..."
            className={cn(fieldClass, "pl-9")}
          />
        </label>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="filtros-secundarios"
          className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 md:hidden"
        >
          <SlidersHorizontal className="size-4" aria-hidden />
          Filtros
          {secondaryCount > 0 && (
            <span className="grid size-5 place-items-center rounded-full bg-red-600 text-[11px] text-white tabular-nums">
              {secondaryCount}
            </span>
          )}
        </button>
      </div>

      <div
        id="filtros-secundarios"
        className={cn("grid-cols-1 gap-2 sm:grid-cols-2 md:grid md:grid-cols-[1fr_1fr_1fr_160px_auto]", open ? "grid" : "hidden")}
      >
        <NativeSelect label="Barrio" value={value.barrio_id} onChange={set("barrio_id")}>
          <option value="">Todos los barrios</option>
          {barrios.map((b) => (
            <option key={b.id} value={String(b.id)}>
              {b.nombre}
            </option>
          ))}
        </NativeSelect>
        <NativeSelect label="Estado CRM" value={value.estado_crm} onChange={set("estado_crm")}>
          <option value="">Todos los estados</option>
          {ESTADO_CRM_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </NativeSelect>
        <NativeSelect label="Tipo de teléfono" value={value.tipo_telefono} onChange={set("tipo_telefono")}>
          <option value="">Todos los teléfonos</option>
          {TIPO_TELEFONO_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </NativeSelect>
        <label>
          <span className="sr-only">Rubro</span>
          <input
            value={value.rubro}
            onChange={(e) => set("rubro")(e.target.value)}
            placeholder="Rubro"
            className={fieldClass}
          />
        </label>
        <button
          type="button"
          onClick={onClearAll}
          disabled={!hasActiveFilters}
          className="h-10 rounded-lg px-3 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 disabled:pointer-events-none disabled:opacity-40"
        >
          Limpiar filtros
        </button>
      </div>
    </div>
  )
}
