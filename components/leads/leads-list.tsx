"use client"

import { SearchX } from "lucide-react"
import type { Lead } from "@/lib/types"
import { EstadoBadge, ProximoContacto, Rating, ReferidoBadge, TelefonoBadge } from "./lead-badges"
import { LeadActions } from "./lead-actions"

interface LeadsListProps {
  leads: Lead[] | undefined
  isLoading: boolean
  error: Error | undefined
  onOpen: (lead: Lead) => void
  onClearFilters?: () => void
}

export function LeadsList({ leads, isLoading, error, onOpen, onClearFilters }: LeadsListProps) {
  if (error && !leads) {
    return (
      <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
        No pudimos cargar los leads: {error.message}
      </div>
    )
  }
  if (isLoading || !leads) return <ListSkeleton />
  if (leads.length === 0) return <EmptyState onClearFilters={onClearFilters} />

  return (
    <>
      <div className="hidden overflow-hidden rounded-2xl border border-zinc-200/80 bg-white md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200/80 text-xs text-zinc-500">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">Comercio</th>
              <th scope="col" className="px-3 py-3 font-medium">Rating</th>
              <th scope="col" className="px-3 py-3 font-medium">Teléfono</th>
              <th scope="col" className="px-3 py-3 font-medium">Estado</th>
              <th scope="col" className="px-3 py-3 font-medium">Próximo</th>
              <th scope="col" className="px-4 py-3 text-right font-medium">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {leads.map((lead) => (
              <tr key={lead.id} className="transition-colors hover:bg-zinc-50/80">
                <td className="max-w-72 px-4 py-3">
                  <button
                    type="button"
                    onClick={() => onOpen(lead)}
                    className="flex items-center gap-2 text-left font-medium text-zinc-950 outline-none hover:underline focus-visible:underline"
                  >
                    <span className="truncate">{lead.nombre}</span>
                    {lead.referido_por_lead_id !== null && <ReferidoBadge />}
                  </button>
                  <p className="mt-0.5 truncate text-xs text-zinc-500">
                    {[lead.rubro, lead.barrio_nombre].filter(Boolean).join(" · ") || "—"}
                  </p>
                </td>
                <td className="px-3 py-3">
                  <Rating rating={lead.rating} reviews={lead.reviews_count} />
                  {lead.rating === null && <span className="text-xs text-zinc-300">—</span>}
                </td>
                <td className="px-3 py-3">
                  <div className="flex flex-col items-start gap-1">
                    <TelefonoBadge tipo={lead.tipo_telefono} />
                    {lead.telefono_normalizado && (
                      <span className="font-mono text-[11px] text-zinc-500 tabular-nums">{lead.telefono_normalizado}</span>
                    )}
                  </div>
                </td>
                <td className="px-3 py-3">
                  <EstadoBadge estado={lead.estado_crm} />
                </td>
                <td className="px-3 py-3">
                  <ProximoContacto date={lead.proximo_contacto} />
                  {!lead.proximo_contacto && <span className="text-xs text-zinc-300">—</span>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    <LeadActions lead={lead} onEdit={() => onOpen(lead)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="flex flex-col gap-3 md:hidden">
        {leads.map((lead) => (
          <li key={lead.id} className="flex flex-col gap-3 rounded-2xl border border-zinc-200/80 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-medium text-zinc-950 text-pretty">{lead.nombre}</h3>
                <p className="mt-0.5 text-xs text-zinc-500">
                  {[lead.rubro, lead.barrio_nombre].filter(Boolean).join(" · ") || "—"}
                </p>
              </div>
              <EstadoBadge estado={lead.estado_crm} />
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <TelefonoBadge tipo={lead.tipo_telefono} />
              {lead.referido_por_lead_id !== null && <ReferidoBadge />}
              <Rating rating={lead.rating} reviews={lead.reviews_count} />
              <ProximoContacto date={lead.proximo_contacto} />
            </div>
            <LeadActions lead={lead} size="lg" onEdit={() => onOpen(lead)} />
          </li>
        ))}
      </ul>
    </>
  )
}

function ListSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200/80 bg-white p-4" aria-busy="true" aria-label="Cargando leads">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="flex flex-1 flex-col gap-2">
            <div className="h-4 w-2/5 animate-pulse rounded bg-zinc-100" />
            <div className="h-3 w-1/4 animate-pulse rounded bg-zinc-100" />
          </div>
          <div className="hidden h-5 w-20 animate-pulse rounded-full bg-zinc-100 sm:block" />
          <div className="h-8 w-24 animate-pulse rounded-lg bg-zinc-100" />
        </div>
      ))}
    </div>
  )
}

function EmptyState({ onClearFilters }: { onClearFilters?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-zinc-200 bg-white px-6 py-14 text-center">
      <span className="grid size-10 place-items-center rounded-full bg-zinc-100">
        <SearchX className="size-5 text-zinc-500" aria-hidden />
      </span>
      <div className="flex flex-col gap-1">
        <p className="font-medium text-zinc-950">No hay leads para mostrar</p>
        <p className="text-sm text-zinc-500">Probá con otros filtros o extraé comercios desde el Mapa de Zonas.</p>
      </div>
      {onClearFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="mt-1 h-9 rounded-lg border border-zinc-200 px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  )
}
