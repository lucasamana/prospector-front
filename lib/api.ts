import { ApiError } from "./api-error"
import type {
  BarrioAvance,
  CeldaMapa,
  ExtraerZonaPayload,
  ExtraerZonaResponse,
  Lead,
  LeadFilters,
  LeadListResponse,
  LeadUpdatePayload,
  ReferidoCreatePayload,
} from "./types"

export { ApiError }

const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL || ""
export const API_URL = RAW_API_URL.replace(/\/+$/, "")

export const MISSING_API_URL_MESSAGE = "Falta configurar NEXT_PUBLIC_API_URL con la URL del backend."
export const UNREACHABLE_MESSAGE = "No se pudo conectar al backend."

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_URL) throw new ApiError(0, MISSING_API_URL_MESSAGE)

  let res: Response
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", Accept: "application/json", ...init?.headers },
    })
  } catch {
    throw new ApiError(0, `${UNREACHABLE_MESSAGE} Verificá que esté corriendo en ${API_URL}.`)
  }

  if (!res.ok) {
    let message = `El backend respondió con error ${res.status}`
    try {
      const body = await res.json()
      if (typeof body?.detail === "string") message = body.detail
    } catch {}
    throw new ApiError(res.status, message)
  }
  return res.json() as Promise<T>
}

function toQuery(filters: LeadFilters) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(filters)) {
    if (value !== null && value !== undefined && value !== "") params.set(key, String(value))
  }
  const qs = params.toString()
  return qs ? `?${qs}` : ""
}

export const api = {
  listBarrios: (): Promise<BarrioAvance[]> => request("/api/barrios"),
  listCeldas: (barrioId: number): Promise<CeldaMapa[]> => request(`/api/barrios/${barrioId}/celdas`),
  extraerZona: (h3: string, payload: ExtraerZonaPayload): Promise<ExtraerZonaResponse> =>
    request(`/api/zonas/${encodeURIComponent(h3)}/extraer`, { method: "POST", body: JSON.stringify(payload) }),
  listLeads: (filters: LeadFilters): Promise<LeadListResponse> =>
    request(`/api/leads${toQuery({ page: 1, page_size: 20, ...filters })}`),
  getLead: (id: number): Promise<Lead> => request(`/api/leads/${id}`),
  updateLead: (id: number, payload: LeadUpdatePayload): Promise<Lead> =>
    request(`/api/leads/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  createReferido: (id: number, payload: ReferidoCreatePayload): Promise<Lead> =>
    request(`/api/leads/${id}/referidos`, { method: "POST", body: JSON.stringify(payload) }),
}
