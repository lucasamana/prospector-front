import { ApiError } from "./api-error"
import * as demo from "./demo-store"
import type {
  ApiMode,
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

let modePromise: Promise<ApiMode> | null = null

/** Probes the backend once; falls back to the in-memory demo when it is missing or unreachable. */
export function resolveMode(): Promise<ApiMode> {
  if (!modePromise) {
    modePromise = (async () => {
      if (!API_URL) return "demo"
      try {
        const res = await fetch(`${API_URL}/api/barrios`, { signal: AbortSignal.timeout(6000) })
        return res.ok ? "live" : "demo"
      } catch {
        return "demo"
      }
    })()
  }
  return modePromise
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", Accept: "application/json", ...init?.headers },
  })
  if (!res.ok) {
    let message = `Error ${res.status}`
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
  async listBarrios(): Promise<BarrioAvance[]> {
    return (await resolveMode()) === "demo" ? demo.demoListBarrios() : request("/api/barrios")
  },
  async listCeldas(barrioId: number): Promise<CeldaMapa[]> {
    return (await resolveMode()) === "demo"
      ? demo.demoListCeldas(barrioId)
      : request(`/api/barrios/${barrioId}/celdas`)
  },
  async extraerZona(h3: string, payload: ExtraerZonaPayload): Promise<ExtraerZonaResponse> {
    return (await resolveMode()) === "demo"
      ? demo.demoExtraerZona(h3, payload)
      : request(`/api/zonas/${encodeURIComponent(h3)}/extraer`, { method: "POST", body: JSON.stringify(payload) })
  },
  async listLeads(filters: LeadFilters): Promise<LeadListResponse> {
    const withDefaults = { page: 1, page_size: 20, ...filters }
    return (await resolveMode()) === "demo"
      ? demo.demoListLeads(withDefaults)
      : request(`/api/leads${toQuery(withDefaults)}`)
  },
  async getLead(id: number): Promise<Lead> {
    return (await resolveMode()) === "demo" ? demo.demoGetLead(id) : request(`/api/leads/${id}`)
  },
  async updateLead(id: number, payload: LeadUpdatePayload): Promise<Lead> {
    return (await resolveMode()) === "demo"
      ? demo.demoUpdateLead(id, payload)
      : request(`/api/leads/${id}`, { method: "PATCH", body: JSON.stringify(payload) })
  },
  async createReferido(id: number, payload: ReferidoCreatePayload): Promise<Lead> {
    return (await resolveMode()) === "demo"
      ? demo.demoCreateReferido(id, payload)
      : request(`/api/leads/${id}/referidos`, { method: "POST", body: JSON.stringify(payload) })
  },
}
