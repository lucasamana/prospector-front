import { Info } from "lucide-react"

export function DemoBanner() {
  return (
    <div role="status" className="border-b border-zinc-200/80 bg-white">
      <p className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-2 text-xs text-zinc-600 md:px-6">
        <Info className="size-3.5 shrink-0 text-red-600" aria-hidden />
        <span>
          <span className="font-medium text-zinc-900">Modo demo</span> — conectá{" "}
          <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-[11px] text-zinc-800">NEXT_PUBLIC_API_URL</code>{" "}
          para usar tu backend real
        </span>
      </p>
    </div>
  )
}
