const ITEMS = [
  { label: "Pendiente", color: "#94a3b8" },
  { label: "Procesando", color: "#f59e0b" },
  { label: "Scrapeado", color: "#10b981" },
  { label: "Error", color: "#fb7185" },
  { label: "Seleccionada", color: "#DC2626" },
]

export function MapLegend({ live, barrioNombre }: { live: boolean; barrioNombre?: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
      <ul className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5" aria-label="Leyenda">
        {ITEMS.map((item) => (
          <li key={item.label} className="flex items-center gap-1.5 text-xs text-zinc-600">
            <span className="size-2 rounded-full" style={{ backgroundColor: item.color }} aria-hidden />
            {item.label}
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-2">
        {live && (
          <span role="status" className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-500 opacity-70" />
              <span className="relative inline-flex size-1.5 rounded-full bg-amber-500" />
            </span>
            Actualizando en vivo...
          </span>
        )}
        {barrioNombre && <span className="text-xs font-medium text-zinc-900">{barrioNombre}</span>}
      </div>
    </div>
  )
}
