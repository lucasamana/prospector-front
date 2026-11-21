"use client"

import { cn } from "@/lib/utils"
import type { ApiMode } from "@/lib/types"

export type AppTab = "leads" | "mapa"

const TABS: { id: AppTab; label: string }[] = [
  { id: "leads", label: "CRM Leads" },
  { id: "mapa", label: "Mapa de Zonas" },
]

interface AppHeaderProps {
  tab: AppTab
  mode: ApiMode | undefined
  onTabChange: (tab: AppTab) => void
}

export function AppHeader({ tab, mode, onTabChange }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-[500] border-b border-zinc-200/80 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 pt-3 md:h-16 md:flex-row md:items-center md:gap-10 md:px-6 md:pt-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Logo />
            <span className="text-[15px] font-semibold tracking-tight">Prospector Córdoba</span>
          </div>
          <div className="md:hidden">
            <ConnectionPill mode={mode} />
          </div>
        </div>

        <nav aria-label="Secciones" className="-mb-px flex gap-6 md:h-full">
          {TABS.map((t) => {
            const active = tab === t.id
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onTabChange(t.id)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex h-11 items-center text-sm font-medium transition-colors outline-none focus-visible:text-red-600 md:h-full",
                  active ? "text-zinc-950" : "text-zinc-500 hover:text-zinc-900",
                )}
              >
                {t.label}
                <span
                  aria-hidden
                  className={cn(
                    "absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-red-600 transition-opacity",
                    active ? "opacity-100" : "opacity-0",
                  )}
                />
              </button>
            )
          })}
        </nav>

        <div className="ml-auto hidden md:block">
          <ConnectionPill mode={mode} />
        </div>
      </div>
    </header>
  )
}

function Logo() {
  return (
    <span aria-hidden className="grid size-7 place-items-center rounded-lg bg-red-600">
      <svg viewBox="0 0 24 24" className="size-4 text-white" fill="none" stroke="currentColor" strokeWidth={2.4}>
        <path d="M12 3 19.8 7.5v9L12 21l-7.8-4.5v-9L12 3Z" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="2.2" fill="currentColor" stroke="none" />
      </svg>
    </span>
  )
}

function ConnectionPill({ mode }: { mode: ApiMode | undefined }) {
  if (!mode) {
    return <span className="inline-flex h-6 w-16 animate-pulse rounded-full bg-zinc-100" aria-label="Conectando" />
  }
  if (mode === "live") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
        <span className="relative flex size-1.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-60" />
          <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
        </span>
        En vivo
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 text-xs font-medium text-zinc-600">
      <span className="size-1.5 rounded-full bg-zinc-400" />
      Demo
    </span>
  )
}
