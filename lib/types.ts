export type EstadoCRM =
  | "pendiente"
  | "llamado"
  | "seguimiento"
  | "interesado"
  | "cliente"
  | "descartado"

export type TipoTelefono =
  | "whatsapp_verificado"
  | "celular"
  | "fijo"
  | "sin_telefono"

export type EstadoCelda = "pendiente" | "procesando" | "scrapeado" | "error"

export interface BarrioAvance {
  id: number
  nombre: string
  celdas_totales: number
  celdas_scrapeadas: number
  celdas_procesando: number
  porcentaje_relevado: number
  leads_totales: number
  leads_contactados: number
  porcentaje_contactado: number
}

export interface CeldaMapa {
  h3_index: string
  barrio_id: number
  lat_centro: number
  lng_centro: number
  poligono_json: [number, number][]
  estado: EstadoCelda
  ultimo_scraping: string | null
  leads_count: number
}

export interface Lead {
  id: number
  google_place_id: string | null
  zona_h3: string | null
  barrio_id: number | null
  barrio_nombre: string | null
  nombre: string
  rubro: string | null
  direccion: string | null
  telefono_raw: string | null
  telefono_normalizado: string | null
  tipo_telefono: TipoTelefono
  whatsapp_url: string | null
  website: string | null
  instagram: string | null
  rating: number | null
  reviews_count: number | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  horarios_json: any
  estado_crm: EstadoCRM
  notas: string | null
  proximo_contacto: string | null
  referido_por_lead_id: number | null
  created_at: string
  updated_at: string
}

export interface LeadListResponse {
  items: Lead[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface LeadUpdatePayload {
  estado_crm?: EstadoCRM
  notas?: string | null
  proximo_contacto?: string | null
  rubro?: string | null
  telefono_raw?: string | null
  instagram?: string | null
  website?: string | null
}

export interface ReferidoCreatePayload {
  nombre: string
  rubro?: string | null
  direccion?: string | null
  telefono_raw?: string | null
  instagram?: string | null
  website?: string | null
  barrio_id?: number | null
  notas?: string | null
  proximo_contacto?: string | null
}

export interface ExtraerZonaPayload {
  rubro: string | null
  max_results: number
  radius_km: number
}

export interface ExtraerZonaResponse {
  h3_index: string
  estado: string
  mensaje: string
}

export interface LeadFilters {
  barrio_id?: number | null
  zona_h3?: string | null
  estado_crm?: EstadoCRM | null
  tipo_telefono?: TipoTelefono | null
  rubro?: string | null
  busqueda?: string | null
  page?: number
  page_size?: number
}

export type ApiMode = "live" | "demo"
