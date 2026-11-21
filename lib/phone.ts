import type { TipoTelefono } from "./types"

interface NormalizedPhone {
  telefono_normalizado: string | null
  tipo_telefono: TipoTelefono
  whatsapp_url: string | null
}

/** Heuristic normalizer for Córdoba (area code 351) numbers, used only in demo mode. */
export function normalizePhone(raw: string | null | undefined): NormalizedPhone {
  const empty: NormalizedPhone = { telefono_normalizado: null, tipo_telefono: "sin_telefono", whatsapp_url: null }
  if (!raw) return empty
  let digits = raw.replace(/\D/g, "")
  if (!digits) return empty

  let mobile = false
  if (digits.startsWith("54")) digits = digits.slice(2)
  if (digits.startsWith("9")) {
    mobile = true
    digits = digits.slice(1)
  }
  if (digits.startsWith("0")) digits = digits.slice(1)

  const area = "351"
  let local = digits.startsWith("351") ? digits.slice(3) : digits

  if (local.startsWith("15") && local.length === 9) {
    mobile = true
    local = local.slice(2)
  }
  if (local.length !== 7) return { ...empty, telefono_normalizado: `+54${area}${local}`, tipo_telefono: "fijo" }

  // Córdoba landlines start with 4 (422-, 468-); other 7-digit local numbers are usually mobile.
  if (!mobile && !local.startsWith("4")) mobile = true

  if (mobile) {
    const e164 = `+549${area}${local}`
    return { telefono_normalizado: e164, tipo_telefono: "celular", whatsapp_url: `https://wa.me/${e164.slice(1)}` }
  }
  return { telefono_normalizado: `+54${area}${local}`, tipo_telefono: "fijo", whatsapp_url: null }
}
