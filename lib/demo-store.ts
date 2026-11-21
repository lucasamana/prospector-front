import { CALLES, MOCK_BARRIOS, RUBRO_NOMBRES, buildMockCeldas, buildMockLeads } from "./mock-data"
import { normalizePhone } from "./phone"
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
import { ApiError } from "./api-error"

const SIMULATED_SCRAPE_MS = 3000

const celdas: CeldaMapa[] = buildMockCeldas()
const leads: Lead[] = buildMockLeads(celdas)
let nextId = leads.length + 1

const clone = <T,>(v: T): T => structuredClone(v)
const pct = (a: number, b: number) => (b === 0 ? 0 : Math.round((a / b) * 1000) / 10)
const delay = (ms = 180) => new Promise((r) => setTimeout(r, ms))

function leadsCount(h3: string) {
  return leads.filter((l) => l.zona_h3 === h3).length
}

export async function demoListBarrios(): Promise<BarrioAvance[]> {
  await delay()
  return MOCK_BARRIOS.map((b) => {
    const bc = celdas.filter((c) => c.barrio_id === b.id)
    const bl = leads.filter((l) => l.barrio_id === b.id)
    const scrapeadas = bc.filter((c) => c.estado === "scrapeado").length
    const contactados = bl.filter((l) => l.estado_crm !== "pendiente").length
    return {
      id: b.id,
      nombre: b.nombre,
      celdas_totales: bc.length,
      celdas_scrapeadas: scrapeadas,
      celdas_procesando: bc.filter((c) => c.estado === "procesando").length,
      porcentaje_relevado: pct(scrapeadas, bc.length),
      leads_totales: bl.length,
      leads_contactados: contactados,
      porcentaje_contactado: pct(contactados, bl.length),
    }
  })
}

export async function demoListCeldas(barrioId: number): Promise<CeldaMapa[]> {
  await delay()
  return clone(
    celdas.filter((c) => c.barrio_id === barrioId).map((c) => ({ ...c, leads_count: leadsCount(c.h3_index) })),
  )
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateLeadsForCell(celda: CeldaMapa, rubro: string | null, amount: number) {
  const barrio = MOCK_BARRIOS.find((b) => b.id === celda.barrio_id)!
  const key = rubro && RUBRO_NOMBRES[rubro] ? rubro : null
  const used = new Set(leads.map((l) => l.nombre))
  const now = new Date().toISOString()
  for (let i = 0; i < amount; i++) {
    const r = key ?? pick(Object.keys(RUBRO_NOMBRES))
    const pool = RUBRO_NOMBRES[r].filter((n) => !used.has(n))
    const nombre = pool.length ? pick(pool) : `${pick(RUBRO_NOMBRES[r])} ${barrio.nombre} ${i + 1}`
    used.add(nombre)
    const roll = Math.random()
    const raw = roll < 0.5 ? `351${Math.floor(5000000 + Math.random() * 4999999)}` : roll < 0.8 ? `0351 4${Math.floor(100000 + Math.random() * 899999)}` : null
    const phone = normalizePhone(raw)
    const tipo = phone.tipo_telefono === "celular" && Math.random() < 0.6 ? "whatsapp_verificado" : phone.tipo_telefono
    leads.push({
      id: nextId++,
      google_place_id: `ChIJdemo${nextId.toString(36)}`,
      zona_h3: celda.h3_index,
      barrio_id: barrio.id,
      barrio_nombre: barrio.nombre,
      nombre,
      rubro: rubro ?? (r === "general" ? "comercio" : r),
      direccion: `${pick(CALLES)} ${Math.floor(100 + Math.random() * 1800)}`,
      telefono_raw: raw,
      ...phone,
      tipo_telefono: tipo,
      website: null,
      instagram: Math.random() < 0.5 ? `https://instagram.com/${nombre.toLowerCase().replace(/[^a-z0-9]/g, "")}` : null,
      rating: Math.round((3.8 + Math.random() * 1.2) * 10) / 10,
      reviews_count: Math.floor(20 + Math.random() * 900),
      horarios_json: [{ day: "Lun a Sáb", hours: "9:00–20:00" }],
      estado_crm: "pendiente",
      notas: null,
      proximo_contacto: null,
      referido_por_lead_id: null,
      created_at: now,
      updated_at: now,
    })
  }
}

export async function demoExtraerZona(h3: string, payload: ExtraerZonaPayload): Promise<ExtraerZonaResponse> {
  await delay()
  const celda = celdas.find((c) => c.h3_index === h3)
  if (!celda) throw new ApiError(404, "Celda no encontrada")
  if (celda.estado === "procesando") throw new ApiError(409, "Esta zona ya se está procesando")
  celda.estado = "procesando"
  setTimeout(() => {
    const amount = Math.max(3, Math.min(payload.max_results, Math.floor(4 + Math.random() * 6)))
    generateLeadsForCell(celda, payload.rubro, amount)
    celda.estado = "scrapeado"
    celda.ultimo_scraping = new Date().toISOString()
  }, SIMULATED_SCRAPE_MS)
  return { h3_index: h3, estado: "procesando", mensaje: "Extracción encolada (demo)" }
}

export async function demoListLeads(filters: LeadFilters): Promise<LeadListResponse> {
  await delay()
  const page = filters.page ?? 1
  const pageSize = filters.page_size ?? 20
  const q = filters.busqueda?.trim().toLowerCase()
  const rubro = filters.rubro?.trim().toLowerCase()
  const filtered = leads
    .filter((l) => (filters.barrio_id ? l.barrio_id === filters.barrio_id : true))
    .filter((l) => (filters.zona_h3 ? l.zona_h3 === filters.zona_h3 : true))
    .filter((l) => (filters.estado_crm ? l.estado_crm === filters.estado_crm : true))
    .filter((l) => (filters.tipo_telefono ? l.tipo_telefono === filters.tipo_telefono : true))
    .filter((l) => (rubro ? (l.rubro ?? "").toLowerCase().includes(rubro) : true))
    .filter((l) =>
      q
        ? [l.nombre, l.direccion, l.telefono_raw, l.telefono_normalizado, l.notas]
            .some((v) => v?.toLowerCase().includes(q))
        : true,
    )
    .sort((a, b) => b.id - a.id)
  const total = filtered.length
  return {
    items: clone(filtered.slice((page - 1) * pageSize, page * pageSize)),
    total,
    page,
    page_size: pageSize,
    total_pages: Math.max(1, Math.ceil(total / pageSize)),
  }
}

function findLead(id: number) {
  const lead = leads.find((l) => l.id === id)
  if (!lead) throw new ApiError(404, "Lead no encontrado")
  return lead
}

export async function demoGetLead(id: number): Promise<Lead> {
  await delay()
  return clone(findLead(id))
}

export async function demoUpdateLead(id: number, payload: LeadUpdatePayload): Promise<Lead> {
  await delay()
  const lead = findLead(id)
  Object.assign(lead, payload, { updated_at: new Date().toISOString() })
  if ("telefono_raw" in payload) Object.assign(lead, normalizePhone(payload.telefono_raw))
  return clone(lead)
}

export async function demoCreateReferido(id: number, payload: ReferidoCreatePayload): Promise<Lead> {
  await delay()
  const origin = findLead(id)
  const barrioId = payload.barrio_id ?? origin.barrio_id
  const barrio = MOCK_BARRIOS.find((b) => b.id === barrioId)
  const now = new Date().toISOString()
  const lead: Lead = {
    id: nextId++,
    google_place_id: null,
    zona_h3: null,
    barrio_id: barrioId,
    barrio_nombre: barrio?.nombre ?? null,
    nombre: payload.nombre,
    rubro: payload.rubro ?? null,
    direccion: payload.direccion ?? null,
    telefono_raw: payload.telefono_raw ?? null,
    ...normalizePhone(payload.telefono_raw),
    website: payload.website ?? null,
    instagram: payload.instagram ?? null,
    rating: null,
    reviews_count: null,
    horarios_json: null,
    estado_crm: "pendiente",
    notas: payload.notas ?? null,
    proximo_contacto: payload.proximo_contacto ?? null,
    referido_por_lead_id: origin.id,
    created_at: now,
    updated_at: now,
  }
  leads.push(lead)
  return clone(lead)
}
