import { CalendarDays, Check, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { ESTADO_CRM_OPTIONS, TIPO_TELEFONO_OPTIONS, formatShortDate, todayISO } from "@/lib/format"
import type { EstadoCRM, TipoTelefono } from "@/lib/types"

const pill = "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium leading-4 whitespace-nowrap"

const TELEFONO_STYLES: Record<TipoTelefono, string> = {
  whatsapp_verificado: "border-emerald-200 bg-emerald-50 text-emerald-700",
  celular: "border-green-200/80 bg-green-50/60 text-green-700",
  fijo: "border-zinc-200 bg-zinc-50 text-zinc-700",
  sin_telefono: "border-zinc-200/70 bg-white text-zinc-400",
}

const TELEFONO_SHORT: Record<TipoTelefono, string> = {
  whatsapp_verificado: "WhatsApp",
  celular: "Celular",
  fijo: "Fijo",
  sin_telefono: "Sin teléfono",
}

export function TelefonoBadge({ tipo }: { tipo: TipoTelefono }) {
  const label = TIPO_TELEFONO_OPTIONS.find((o) => o.value === tipo)?.label
  return (
    <span className={cn(pill, TELEFONO_STYLES[tipo])} title={label}>
      {tipo === "whatsapp_verificado" && <Check className="size-3" aria-hidden strokeWidth={3} />}
      {TELEFONO_SHORT[tipo]}
    </span>
  )
}

const ESTADO_STYLES: Record<EstadoCRM, string> = {
  pendiente: "border-zinc-200 bg-zinc-50 text-zinc-600",
  llamado: "border-sky-200 bg-sky-50 text-sky-700",
  seguimiento: "border-amber-200 bg-amber-50 text-amber-700",
  interesado: "border-violet-200 bg-violet-50 text-violet-700",
  cliente: "border-emerald-200 bg-emerald-50 text-emerald-700",
  descartado: "border-rose-200 bg-rose-50 text-rose-700",
}

export function EstadoBadge({ estado }: { estado: EstadoCRM }) {
  const label = ESTADO_CRM_OPTIONS.find((o) => o.value === estado)?.label ?? estado
  return <span className={cn(pill, ESTADO_STYLES[estado])}>{label}</span>
}

export function ReferidoBadge() {
  return <span className={cn(pill, "border-red-200 bg-red-50 text-red-700")}>Referido</span>
}

export function Rating({ rating, reviews }: { rating: number | null; reviews: number | null }) {
  if (rating === null) return null
  return (
    <span className="inline-flex items-center gap-1 text-xs text-zinc-600 tabular-nums">
      <Star className="size-3.5 fill-amber-400 text-amber-400" aria-hidden />
      <span className="font-medium text-zinc-900">{rating.toFixed(1)}</span>
      {reviews !== null && <span className="text-zinc-400">({reviews.toLocaleString("es-AR")})</span>}
      <span className="sr-only">estrellas</span>
    </span>
  )
}

export function ProximoContacto({ date }: { date: string | null }) {
  if (!date) return null
  const today = todayISO()
  const day = date.slice(0, 10)
  const overdue = day < today
  const isToday = day === today
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs tabular-nums",
        overdue ? "font-medium text-red-600" : isToday ? "font-medium text-amber-600" : "text-zinc-600",
      )}
    >
      <CalendarDays className="size-3.5" aria-hidden />
      {isToday ? "Hoy" : formatShortDate(day)}
      {overdue && <span className="sr-only">(vencido)</span>}
    </span>
  )
}
