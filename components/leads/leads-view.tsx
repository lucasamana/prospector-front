"use client"

import { useMemo, useState } from "react"
import useSWR from "swr"
import { api } from "@/lib/api"
import { useBarrios, useDebouncedValue } from "@/lib/hooks"
import type { EstadoCRM, Lead, LeadFilters, TipoTelefono } from "@/lib/types"
import { LeadsKpis } from "./leads-kpis"
import { LeadsFilters, type FilterState } from "./leads-filters"
import { LeadsList } from "./leads-list"
import { LeadsPagination } from "./leads-pagination"
import { LeadDrawer } from "./lead-drawer"

const PAGE_SIZE = 20

const EMPTY_FILTERS: FilterState = {
  busqueda: "",
  rubro: "",
  barrio_id: "",
  estado_crm: "",
  tipo_telefono: "",
}

interface LeadsViewProps {
  zonaH3: string | null
  onClearZona: () => void
}

export function LeadsView({ zonaH3, onClearZona }: LeadsViewProps) {
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS)
  const busqueda = useDebouncedValue(filters.busqueda, 400)
  const rubro = useDebouncedValue(filters.rubro, 400)
  const { data: barrios } = useBarrios()

  const baseFilters = useMemo<LeadFilters>(
    () => ({
      barrio_id: filters.barrio_id ? Number(filters.barrio_id) : null,
      zona_h3: zonaH3,
      estado_crm: (filters.estado_crm || null) as EstadoCRM | null,
      tipo_telefono: (filters.tipo_telefono || null) as TipoTelefono | null,
      rubro: rubro.trim() || null,
      busqueda: busqueda.trim() || null,
    }),
    [filters.barrio_id, filters.estado_crm, filters.tipo_telefono, zonaH3, rubro, busqueda],
  )

  const filterKey = JSON.stringify(baseFilters)
  const [pageState, setPageState] = useState({ key: filterKey, page: 1 })
  const page = pageState.key === filterKey ? pageState.page : 1

  const { data, isLoading, error } = useSWR(
    ["leads", filterKey, page],
    () => api.listLeads({ ...baseFilters, page, page_size: PAGE_SIZE }),
    { keepPreviousData: true },
  )

  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const selectedLead: Lead | null = data?.items.find((l) => l.id === selectedId) ?? null

  const openLead = (lead: Lead) => {
    setSelectedId(lead.id)
    setDrawerOpen(true)
  }

  const clearAll = () => {
    setFilters(EMPTY_FILTERS)
    if (zonaH3) onClearZona()
    setPageState({ key: "", page: 1 })
  }

  const hasActiveFilters = zonaH3 !== null || Object.values(filters).some((v) => v !== "")

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-balance">CRM Leads</h1>
        <p className="text-sm text-zinc-500">Comercios relevados en Córdoba Capital, listos para contactar.</p>
      </div>

      <LeadsKpis filters={baseFilters} />

      <LeadsFilters
        value={filters}
        onChange={setFilters}
        barrios={barrios ?? []}
        zonaH3={zonaH3}
        onClearZona={onClearZona}
        onClearAll={clearAll}
        hasActiveFilters={hasActiveFilters}
      />

      <section aria-label="Listado de leads" className="flex flex-col gap-3">
        <LeadsList
          leads={data?.items}
          isLoading={isLoading && !data}
          error={error as Error | undefined}
          onOpen={openLead}
          onClearFilters={hasActiveFilters ? clearAll : undefined}
        />
        {data && data.total > 0 && (
          <LeadsPagination
            page={data.page}
            pageSize={data.page_size}
            total={data.total}
            totalPages={data.total_pages}
            onPageChange={(next) => setPageState({ key: filterKey, page: next })}
          />
        )}
      </section>

      <LeadDrawer
        lead={selectedLead}
        open={drawerOpen && selectedLead !== null}
        onOpenChange={setDrawerOpen}
        barrios={barrios ?? []}
      />
    </div>
  )
}
