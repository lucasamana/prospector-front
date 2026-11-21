import type { EstadoCelda, EstadoCRM, TipoTelefono } from "./types"

export const ESTADO_CRM_OPTIONS: { value: EstadoCRM; label: string }[] = [
  { value: "pendiente", label: "Pendiente" },
  { value: "llamado", label: "Llamado" },
  { value: "seguimiento", label: "Seguimiento" },
  { value: "interesado", label: "Interesado" },
  { value: "cliente", label: "Cliente" },
  { value: "descartado", label: "Descartado" },
]

export const TIPO_TELEFONO_OPTIONS: { value: TipoTelefono; label: string }[] = [
  { value: "whatsapp_verificado", label: "WhatsApp verificado" },
  { value: "celular", label: "Celular" },
  { value: "fijo", label: "Fijo" },
  { value: "sin_telefono", label: "Sin teléfono" },
]

export const ESTADO_CELDA_LABEL: Record<EstadoCelda, string> = {
  pendiente: "Pendiente",
  procesando: "Procesando",
  scrapeado: "Scrapeado",
  error: "Error",
}

export function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

export function formatShortDate(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number)
  return new Date(y, m - 1, d).toLocaleDateString("es-AR", { day: "numeric", month: "short" })
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("es-AR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function buildWhatsAppHref(url: string, nombre: string) {
  const text = encodeURIComponent(`Hola ${nombre}, ¿cómo estás? Te escribo por...`)
  return `${url}${url.includes("?") ? "&" : "?"}text=${text}`
}

export function emptyToNull(value: string) {
  const trimmed = value.trim()
  return trimmed === "" ? null : trimmed
}
