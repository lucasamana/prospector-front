import { ChevronLeft, ChevronRight } from "lucide-react"

interface LeadsPaginationProps {
  page: number
  pageSize: number
  total: number
  totalPages: number
  onPageChange: (page: number) => void
}

const btn =
  "inline-flex h-9 items-center gap-1 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:pointer-events-none disabled:opacity-40"

export function LeadsPagination({ page, pageSize, total, totalPages, onPageChange }: LeadsPaginationProps) {
  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)
  return (
    <nav aria-label="Paginación" className="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-sm text-zinc-500 tabular-nums">
        Mostrando <span className="font-medium text-zinc-900">{from}–{to}</span> de{" "}
        <span className="font-medium text-zinc-900">{total.toLocaleString("es-AR")}</span> leads
      </p>
      <div className="flex items-center gap-2">
        <button type="button" className={btn} disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft className="size-4" aria-hidden />
          Anterior
        </button>
        <span className="px-2 text-sm text-zinc-600 tabular-nums">
          Página {page} de {totalPages}
        </span>
        <button type="button" className={btn} disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          Siguiente
          <ChevronRight className="size-4" aria-hidden />
        </button>
      </div>
    </nav>
  )
}
