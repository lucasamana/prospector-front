"use client"

import { useCallback } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { AppHeader, type AppTab, type ConnectionStatus } from "@/components/app-header"
import { ErrorState } from "@/components/error-state"
import { LeadsView } from "@/components/leads/leads-view"
import { ZonasView } from "@/components/zonas/zonas-view"
import { revalidateLeadsAndBarrios, useBarrios } from "@/lib/hooks"

export function ProspectorApp() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { data: barrios, error, isLoading } = useBarrios()

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

  const status: ConnectionStatus = error ? "offline" : barrios ? "online" : "loading"
  const offline = error && !barrios

  return (
    <div className="min-h-dvh bg-zinc-50 text-zinc-950">
      <AppHeader
        tab={tab}
        status={isLoading && !barrios ? "loading" : status}
        onTabChange={(next) => updateParams({ tab: next === "leads" ? null : next })}
      />
      <main className="mx-auto max-w-7xl px-4 py-5 md:px-6 md:py-8">
        {offline ? (
          <ErrorState message={(error as Error).message} onRetry={revalidateLeadsAndBarrios} className="py-20" />
        ) : tab === "leads" ? (
          <LeadsView zonaH3={zonaH3} onClearZona={() => updateParams({ zona_h3: null })} />
        ) : (
          <ZonasView onViewLeads={(h3) => updateParams({ tab: null, zona_h3: h3 })} />
        )}
      </main>
    </div>
  )
}
