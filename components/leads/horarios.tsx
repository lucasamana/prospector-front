type Row = { day: string | null; hours: string }

function toText(value: unknown): string {
  if (value === null || value === undefined) return ""
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value)
  if (Array.isArray(value)) return value.map(toText).filter(Boolean).join(", ")
  try {
    return JSON.stringify(value)
  } catch {
    return ""
  }
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, " ")

export function normalizeHorarios(raw: unknown): Row[] {
  if (raw === null || raw === undefined || raw === "") return []
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw)
      if (typeof parsed === "object" && parsed !== null) return normalizeHorarios(parsed)
    } catch {}
    return raw.split(/\n|;/).map((s) => s.trim()).filter(Boolean).map((hours) => ({ day: null, hours }))
  }
  if (Array.isArray(raw)) {
    return raw.flatMap<Row>((item) => {
      if (item && typeof item === "object" && !Array.isArray(item)) {
        const obj = item as Record<string, unknown>
        const day = obj.day ?? obj.dia ?? obj.name
        const hours = obj.hours ?? obj.horario ?? obj.hours_text
        if (day !== undefined || hours !== undefined) return [{ day: day ? toText(day) : null, hours: toText(hours) }]
        return Object.entries(obj).map(([k, v]) => ({ day: capitalize(k), hours: toText(v) }))
      }
      const text = toText(item)
      return text ? [{ day: null, hours: text }] : []
    })
  }
  if (typeof raw === "object") {
    const obj = raw as Record<string, unknown>
    if (Array.isArray(obj.weekday_text)) return normalizeHorarios(obj.weekday_text)
    return Object.entries(obj).map(([k, v]) => ({ day: capitalize(k), hours: toText(v) }))
  }
  return [{ day: null, hours: toText(raw) }]
}

export function Horarios({ value }: { value: unknown }) {
  const rows = normalizeHorarios(value)
  if (rows.length === 0) return <span className="text-zinc-400">Sin horarios cargados</span>
  return (
    <ul className="flex flex-col gap-0.5">
      {rows.map((row, i) => (
        <li key={i} className="flex justify-between gap-4 tabular-nums">
          {row.day ? (
            <>
              <span className="text-zinc-500">{row.day}</span>
              <span className="text-right text-zinc-900">{row.hours}</span>
            </>
          ) : (
            <span className="text-zinc-900">{row.hours}</span>
          )}
        </li>
      ))}
    </ul>
  )
}
