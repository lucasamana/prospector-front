import type { CeldaMapa, EstadoCelda, Lead } from "./types"

export interface MockBarrio {
  id: number
  nombre: string
  center: [number, number]
  cells: number
}

export const MOCK_BARRIOS: MockBarrio[] = [
  { id: 1, nombre: "Nueva Córdoba", center: [-31.427, -64.186], cells: 12 },
  { id: 2, nombre: "Centro", center: [-31.4152, -64.1855], cells: 7 },
  { id: 3, nombre: "Güemes", center: [-31.4262, -64.1985], cells: 7 },
  { id: 4, nombre: "General Paz", center: [-31.4108, -64.1705], cells: 7 },
  { id: 5, nombre: "Cerro de las Rosas", center: [-31.3712, -64.2305], cells: 7 },
]

const HEX_RADIUS_KM = 0.16
const KM_PER_DEG_LAT = 110.95
const kmPerDegLng = (lat: number) => 111.32 * Math.cos((lat * Math.PI) / 180)

// Axial coordinates: center, first ring, then the first cells of the second ring.
const AXIAL_LAYOUT: [number, number][] = [
  [0, 0],
  [1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1],
  [2, 0], [2, -1], [2, -2], [1, -2], [0, -2], [-1, -1],
]

function hexPolygon(lat: number, lng: number): [number, number][] {
  const lngScale = kmPerDegLng(lat)
  const points: [number, number][] = []
  for (let i = 0; i < 6; i++) {
    const angle = ((60 * i - 30) * Math.PI) / 180
    const dyKm = HEX_RADIUS_KM * Math.sin(angle)
    const dxKm = HEX_RADIUS_KM * Math.cos(angle)
    points.push([
      Number((lat + dyKm / KM_PER_DEG_LAT).toFixed(6)),
      Number((lng + dxKm / lngScale).toFixed(6)),
    ])
  }
  points.push(points[0])
  return points
}

function axialToLatLng(center: [number, number], q: number, r: number): [number, number] {
  const xKm = HEX_RADIUS_KM * Math.sqrt(3) * (q + r / 2)
  const yKm = HEX_RADIUS_KM * 1.5 * r
  return [center[0] - yKm / KM_PER_DEG_LAT, center[1] + xKm / kmPerDegLng(center[0])]
}

function fakeH3(barrioId: number, idx: number) {
  const hex = (barrioId * 4096 + idx * 97 + 0x2b3a).toString(16).padStart(5, "0")
  return `89c2${hex}${idx.toString(16)}fffff`
}

const INITIAL_STATES: Record<number, EstadoCelda[]> = {
  1: ["scrapeado", "scrapeado", "scrapeado", "pendiente", "scrapeado", "pendiente", "error", "pendiente", "pendiente", "scrapeado", "pendiente", "pendiente"],
  2: ["scrapeado", "scrapeado", "pendiente", "pendiente", "pendiente", "pendiente", "pendiente"],
  3: ["scrapeado", "pendiente", "pendiente", "pendiente", "pendiente", "pendiente", "pendiente"],
  4: ["scrapeado", "pendiente", "pendiente", "pendiente", "pendiente", "pendiente", "pendiente"],
  5: ["scrapeado", "pendiente", "pendiente", "pendiente", "pendiente", "pendiente", "pendiente"],
}

export function buildMockCeldas(): CeldaMapa[] {
  const celdas: CeldaMapa[] = []
  for (const barrio of MOCK_BARRIOS) {
    AXIAL_LAYOUT.slice(0, barrio.cells).forEach(([q, r], idx) => {
      const [lat, lng] = axialToLatLng(barrio.center, q, r)
      const estado = INITIAL_STATES[barrio.id][idx] ?? "pendiente"
      celdas.push({
        h3_index: fakeH3(barrio.id, idx),
        barrio_id: barrio.id,
        lat_centro: Number(lat.toFixed(6)),
        lng_centro: Number(lng.toFixed(6)),
        poligono_json: hexPolygon(lat, lng),
        estado,
        ultimo_scraping: estado === "scrapeado" || estado === "error" ? daysAgo(idx + 1) : null,
        leads_count: 0,
      })
    })
  }
  return celdas
}

function daysAgo(days: number) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  d.setHours(10 + (days % 6), 15, 0, 0)
  return d.toISOString()
}

function dateOffset(days: number) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

const HORARIOS_GOOGLE = [
  { day: "Lunes", hours: "8:00–20:00" },
  { day: "Martes", hours: "8:00–20:00" },
  { day: "Miércoles", hours: "8:00–20:00" },
  { day: "Jueves", hours: "8:00–20:00" },
  { day: "Viernes", hours: "8:00–21:00" },
  { day: "Sábado", hours: "9:00–14:00" },
  { day: "Domingo", hours: "Cerrado" },
]

type Seed = Omit<Lead, "id" | "created_at" | "updated_at" | "google_place_id" | "barrio_nombre" | "zona_h3"> & {
  cellIdx: number
}

const seeds: Seed[] = [
  { cellIdx: 0, barrio_id: 1, nombre: "Café Plaza España", rubro: "cafe", direccion: "Av. Hipólito Yrigoyen 402", telefono_raw: "351 15 612-4433", telefono_normalizado: "+5493516124433", tipo_telefono: "whatsapp_verificado", whatsapp_url: "https://wa.me/5493516124433", website: "https://cafeplazaespana.com.ar", instagram: "https://instagram.com/cafeplazaespana", rating: 4.7, reviews_count: 812, horarios_json: HORARIOS_GOOGLE, estado_crm: "interesado", notas: "Le interesa el plan anual. Hablar con Martín (dueño).", proximo_contacto: dateOffset(0), referido_por_lead_id: null },
  { cellIdx: 0, barrio_id: 1, nombre: "Barbería El Buen Corte", rubro: "barberia", direccion: "Obispo Trejo 1080", telefono_raw: "3515559821", telefono_normalizado: "+5493515559821", tipo_telefono: "celular", whatsapp_url: "https://wa.me/5493515559821", website: null, instagram: "https://instagram.com/elbuencorte.cba", rating: 4.9, reviews_count: 356, horarios_json: ["Lun a Sáb: 10:00–20:30", "Dom: Cerrado"], estado_crm: "pendiente", notas: null, proximo_contacto: null, referido_por_lead_id: null },
  { cellIdx: 1, barrio_id: 1, nombre: "Gimnasio Fit Nueva Córdoba", rubro: "gimnasio", direccion: "Av. Vélez Sarsfield 1250", telefono_raw: "(0351) 468-2210", telefono_normalizado: "+543514682210", tipo_telefono: "fijo", whatsapp_url: null, website: "https://fitnc.com.ar", instagram: "https://instagram.com/fitnuevacordoba", rating: 4.3, reviews_count: 529, horarios_json: { lunes_a_viernes: "6:00–23:00", sabado: "9:00–19:00", domingo: "Cerrado" }, estado_crm: "llamado", notas: "Atendió recepción. Volver a llamar a la tarde.", proximo_contacto: dateOffset(-2), referido_por_lead_id: null },
  { cellIdx: 1, barrio_id: 1, nombre: "Kiosco 24 Horas Buen Pastor", rubro: "kiosco", direccion: "Av. Hipólito Yrigoyen 325", telefono_raw: null, telefono_normalizado: null, tipo_telefono: "sin_telefono", whatsapp_url: null, website: null, instagram: null, rating: 4.0, reviews_count: 87, horarios_json: "Abierto las 24 horas", estado_crm: "pendiente", notas: null, proximo_contacto: null, referido_por_lead_id: null },
  { cellIdx: 2, barrio_id: 1, nombre: "La Parrilla de Chacabuco", rubro: "restaurante", direccion: "Chacabuco 950", telefono_raw: "351 6 22 90 11", telefono_normalizado: "+5493516229011", tipo_telefono: "whatsapp_verificado", whatsapp_url: "https://wa.me/5493516229011", website: "https://laparrilladechacabuco.com", instagram: "https://instagram.com/parrillachacabuco", rating: 4.5, reviews_count: 1204, horarios_json: HORARIOS_GOOGLE, estado_crm: "cliente", notas: "Cliente desde marzo. Renovación en diciembre.", proximo_contacto: dateOffset(14), referido_por_lead_id: null },
  { cellIdx: 2, barrio_id: 1, nombre: "Ferretería San Martín", rubro: "ferreteria", direccion: "Independencia 870", telefono_raw: "4223319", telefono_normalizado: "+543514223319", tipo_telefono: "fijo", whatsapp_url: null, website: null, instagram: null, rating: 4.2, reviews_count: 143, horarios_json: ["Lun a Vie 8:30–13:00 / 16:30–20:00", "Sáb 8:30–13:00"], estado_crm: "descartado", notas: "No le interesa por ahora.", proximo_contacto: null, referido_por_lead_id: null },
  { cellIdx: 4, barrio_id: 1, nombre: "Café de la Cañada", rubro: "cafe", direccion: "Marcelo T. de Alvear 620", telefono_raw: "351-7012244", telefono_normalizado: "+5493517012244", tipo_telefono: "celular", whatsapp_url: "https://wa.me/5493517012244", website: null, instagram: "https://instagram.com/cafedelacanada", rating: 4.6, reviews_count: 298, horarios_json: HORARIOS_GOOGLE, estado_crm: "seguimiento", notas: "Pidió propuesta por WhatsApp.", proximo_contacto: dateOffset(3), referido_por_lead_id: 1 },
  { cellIdx: 9, barrio_id: 1, nombre: "Estudio Pilates Core", rubro: "gimnasio", direccion: "Paraná 455", telefono_raw: "+54 9 351 388-1209", telefono_normalizado: "+5493513881209", tipo_telefono: "whatsapp_verificado", whatsapp_url: "https://wa.me/5493513881209", website: "https://pilatescore.com.ar", instagram: "https://instagram.com/pilatescore.cba", rating: 4.8, reviews_count: 176, horarios_json: null, estado_crm: "pendiente", notas: null, proximo_contacto: null, referido_por_lead_id: null },
  { cellIdx: 0, barrio_id: 2, nombre: "Restaurante El Cabildo", rubro: "restaurante", direccion: "Deán Funes 52", telefono_raw: "(0351) 422-7744", telefono_normalizado: "+543514227744", tipo_telefono: "fijo", whatsapp_url: null, website: "https://elcabildo.com.ar", instagram: "https://instagram.com/elcabildocba", rating: 4.4, reviews_count: 2311, horarios_json: HORARIOS_GOOGLE, estado_crm: "llamado", notas: "Pedir por la encargada de compras.", proximo_contacto: dateOffset(1), referido_por_lead_id: null },
  { cellIdx: 1, barrio_id: 2, nombre: "Óptica Catedral", rubro: "optica", direccion: "San Martín 120", telefono_raw: "351 15 455 8890", telefono_normalizado: "+5493514558890", tipo_telefono: "celular", whatsapp_url: "https://wa.me/5493514558890", website: null, instagram: null, rating: 4.1, reviews_count: 64, horarios_json: ["Lun a Vie: 9:00–19:00"], estado_crm: "pendiente", notas: null, proximo_contacto: null, referido_por_lead_id: null },
  { cellIdx: 0, barrio_id: 3, nombre: "Barbería Güemes Club", rubro: "barberia", direccion: "Belgrano 780", telefono_raw: "3516640021", telefono_normalizado: "+5493516640021", tipo_telefono: "whatsapp_verificado", whatsapp_url: "https://wa.me/5493516640021", website: null, instagram: "https://instagram.com/guemesclub", rating: 4.9, reviews_count: 421, horarios_json: HORARIOS_GOOGLE, estado_crm: "interesado", notas: "Quiere arrancar el mes que viene.", proximo_contacto: dateOffset(7), referido_por_lead_id: null },
  { cellIdx: 0, barrio_id: 3, nombre: "Almacén de Diseño Fructuoso", rubro: "tienda", direccion: "Fructuoso Rivera 410", telefono_raw: null, telefono_normalizado: null, tipo_telefono: "sin_telefono", whatsapp_url: null, website: "https://fructuoso.store", instagram: "https://instagram.com/fructuoso.store", rating: 4.6, reviews_count: 95, horarios_json: null, estado_crm: "pendiente", notas: null, proximo_contacto: null, referido_por_lead_id: null },
  { cellIdx: 0, barrio_id: 4, nombre: "Panadería La Espiga de Oro", rubro: "panaderia", direccion: "25 de Mayo 1620", telefono_raw: "351 3 99 12 45", telefono_normalizado: "+5493513991245", tipo_telefono: "celular", whatsapp_url: "https://wa.me/5493513991245", website: null, instagram: null, rating: 4.5, reviews_count: 388, horarios_json: ["Todos los días 7:00–21:00"], estado_crm: "seguimiento", notas: "Mandar catálogo actualizado.", proximo_contacto: dateOffset(-1), referido_por_lead_id: null },
  { cellIdx: 0, barrio_id: 4, nombre: "Veterinaria Patitas GP", rubro: "veterinaria", direccion: "Av. Juan B. Justo 2210", telefono_raw: "4512090", telefono_normalizado: "+543514512090", tipo_telefono: "fijo", whatsapp_url: null, website: null, instagram: "https://instagram.com/patitasgp", rating: 4.7, reviews_count: 211, horarios_json: HORARIOS_GOOGLE, estado_crm: "pendiente", notas: null, proximo_contacto: null, referido_por_lead_id: null },
  { cellIdx: 0, barrio_id: 5, nombre: "Restó del Cerro", rubro: "restaurante", direccion: "Av. Rafael Núñez 4520", telefono_raw: "+5493517781122", telefono_normalizado: "+5493517781122", tipo_telefono: "whatsapp_verificado", whatsapp_url: "https://wa.me/5493517781122", website: "https://restodelcerro.com.ar", instagram: "https://instagram.com/restodelcerro", rating: 4.6, reviews_count: 967, horarios_json: HORARIOS_GOOGLE, estado_crm: "cliente", notas: "Muy conformes. Pedirles referidos.", proximo_contacto: dateOffset(21), referido_por_lead_id: null },
]

export function buildMockLeads(celdas: CeldaMapa[]): Lead[] {
  return seeds.map((seed, i) => {
    const { cellIdx, ...rest } = seed
    const barrio = MOCK_BARRIOS.find((b) => b.id === seed.barrio_id)!
    const barrioCells = celdas.filter((c) => c.barrio_id === seed.barrio_id)
    const created = daysAgo(20 - i)
    return {
      ...rest,
      id: i + 1,
      google_place_id: `ChIJ${(i * 7919 + 1234567).toString(36)}cba`,
      zona_h3: barrioCells[cellIdx]?.h3_index ?? null,
      barrio_nombre: barrio.nombre,
      created_at: created,
      updated_at: created,
    }
  })
}

export const RUBRO_NOMBRES: Record<string, string[]> = {
  cafe: ["Café Bohemia", "Tostadores del Sur", "Café Lunfardo", "Brew Bar Cañada", "Café Ituzaingó", "La Taza Dorada"],
  barberia: ["Barbería Old School", "The Barber Room", "Navaja Fina", "Barbería Rufino", "Corte Clásico"],
  restaurante: ["Bodegón Don Ernesto", "Cantina Italiana Nono", "Sushi Club Córdoba", "Lomitería La Esquina", "Pizzería Il Forno"],
  gimnasio: ["CrossFit Cañada", "Gym Energía", "Box Funcional 360", "Studio Yoga Sol"],
  kiosco: ["Maxikiosco El Paso", "Kiosco La Parada", "Drugstore Rondeau", "Kiosco Doña Ana"],
  ferreteria: ["Ferretería El Tornillo", "Pinturería Color Sur", "Corralón Avenida"],
  general: ["Librería Universitaria", "Farmacia del Parque", "Dietética Natural", "Lavadero Express", "Tienda de Mascotas Firulais", "Heladería Il Gelato"],
}

export const CALLES = ["Obispo Trejo", "Ituzaingó", "Buenos Aires", "Independencia", "Chacabuco", "Belgrano", "Rondeau", "Paraná", "Bv. San Juan", "Av. Poeta Lugones"]
