"use client"

import useSWR from "swr"
import { api } from "@/lib/api"
import type { LeadFilters } from "@/lib/types"

async function fetchKpis(filters: LeadFilters) {
  const q = (extra: LeadFilters) => api.listLeads({ ...filters, ...extra, page: 1, page_size: 1 }).then((r) => r.total)
  const [total, whatsapp, celular, pendientes] = await Promise.all([
    q({}),
    filters.tipo_telefono && filters.tipo_telefono !== "whatsapp_verificado" ? Promise.resolve(0) : q({ tipo_telefono: "whatsapp_verificado" }),
    filters.tipo_telefono && filters.tipo_telefono !== "celular" ? Promise.resolve(0) : q({ tipo_telefono: "celular" }),
    filters.estado_crm && filters.estado_crm !== "pendiente" ? Promise.resolve(0) : q({ estado_crm: "pendiente" }),
  ])
  return { total, listos: whatsapp + celular, pendientes }
}

async function fetchSeguimientos(filters: LeadFilters) {
  // The API has no "has proximo_contacto" filter, so count it over the full filtered result set.
  const first = await api.listLeads({ ...filters, page: 1, page_size: 100 })
  const pages = [first]
  const remaining = Math.min(first.total_pages, 10)
  if (remaining > 1) {
    const rest = await Promise.all(
      Array.from({ length: remaining - 1 }, (_, i) => api.listLeads({ ...filters, page: i + 2, page_size: 100 })),
    )
    pages.push(...rest)
  }
  return pages.flatMap((p) => p.items).filter((l) => l.proximo_contacto).length
}

export function LeadsKpis({ filters }: { filters: LeadFilters }) {
  const key = JSON.stringify(filters)
  const { data } = useSWR(["lead-kpi", "counts", key], () => fetchKpis(filters), { keepPreviousData: true })
  const { data: seguimientos } = useSWR(["lead-kpi", "seguimientos", key], () => fetchSeguimientos(filters), {
    keepPreviousData: true,
  })

  const items = [
    { label: "Total de leads", value: data?.total },
    { label: "WhatsApp / Celulares listos", value: data?.listos, accent: true },
    { label: "Pendientes de contacto", value: data?.pendientes },
    { label: "Seguimientos programados", value: seguimientos },
  ]

  return (
    <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="flex flex-col gap-2 rounded-2xl border border-zinc-200/80 bg-white p-4">
          <dt className="text-xs font-medium text-zinc-500 text-pretty">{item.label}</dt>
          <dd className="text-2xl font-semibold tracking-tight tabular-nums text-zinc-950">
            {item.value === undefined ? (
              <span className="inline-block h-7 w-12 animate-pulse rounded-md bg-zinc-100" aria-label="Cargando" />
            ) : (
              <span className={item.accent ? "text-emerald-700" : undefined}>{item.value.toLocaleString("es-AR")}</span>
            )}
          </dd>
        </div>
      ))}
    </dl>
  )
}
