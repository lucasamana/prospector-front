"use client"

import { useCallback } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { AppHeader, type AppTab } from "@/components/app-header"
import { DemoBanner } from "@/components/demo-banner"
import { LeadsView } from "@/components/leads/leads-view"
import { ZonasView } from "@/components/zonas/zonas-view"
import { useApiMode } from "@/lib/hooks"

export function ProspectorApp() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { data: mode } = useApiMode()

  const tab: AppTab = searchParams.get("tab") === "mapa" ? "mapa" : "leads"
  const zonaH3 = searchParams.get("zona_h3")

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(updates)) {
        if (value) params.set(key, value)
        else params.delete(key)
      }
      const qs = params.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [pathname, router, searchParams],
  )

  return (
    <div className="min-h-dvh bg-zinc-50 text-zinc-950">
      {mode === "demo" && <DemoBanner />}
      <AppHeader
        tab={tab}
        mode={mode}
        onTabChange={(next) => updateParams({ tab: next === "leads" ? null : next })}
      />
      <main className="mx-auto max-w-7xl px-4 py-5 md:px-6 md:py-8">
        {tab === "leads" ? (
          <LeadsView zonaH3={zonaH3} onClearZona={() => updateParams({ zona_h3: null })} />
        ) : (
          <ZonasView onViewLeads={(h3) => updateParams({ tab: null, zona_h3: h3 })} />
        )}
      </main>
    </div>
  )
}
