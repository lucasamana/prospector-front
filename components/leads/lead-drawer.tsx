"use client"

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { BarrioAvance, Lead } from "@/lib/types"
import { CallButton, WhatsAppButton } from "./lead-actions"
import { EstadoBadge, ReferidoBadge, TelefonoBadge } from "./lead-badges"
import { SeguimientoForm } from "./seguimiento-form"
import { ReferidoForm } from "./referido-form"

interface LeadDrawerProps {
  lead: Lead | null
  open: boolean
  onOpenChange: (open: boolean) => void
  barrios: BarrioAvance[]
}

export function LeadDrawer({ lead, open, onOpenChange, barrios }: LeadDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 overflow-y-auto border-zinc-200/80 bg-white p-0 text-zinc-950 data-[side=right]:w-full data-[side=right]:sm:max-w-lg"
      >
        {lead && (
          <>
            <SheetHeader className="gap-3 border-b border-zinc-200/80 p-5 pr-12">
              <div className="flex flex-wrap items-center gap-2">
                <EstadoBadge estado={lead.estado_crm} />
                <TelefonoBadge tipo={lead.tipo_telefono} />
                {lead.referido_por_lead_id !== null && <ReferidoBadge />}
              </div>
              <div className="flex flex-col gap-1">
                <SheetTitle className="text-xl font-semibold tracking-tight text-zinc-950 text-balance">{lead.nombre}</SheetTitle>
                <SheetDescription className="text-sm text-zinc-500">
                  {[lead.rubro, lead.barrio_nombre].filter(Boolean).join(" · ") || "Sin rubro ni barrio"}
                </SheetDescription>
              </div>
              <div className="flex gap-2">
                <WhatsAppButton lead={lead} size="lg" />
                <CallButton lead={lead} size="lg" />
              </div>
            </SheetHeader>

            <Tabs defaultValue="seguimiento" className="gap-0">
              <div className="border-b border-zinc-200/80 px-5 pt-3">
                <TabsList variant="line" className="h-10 gap-4 p-0">
                  <TabsTrigger value="seguimiento" className="px-0 text-sm data-active:text-zinc-950 after:bg-red-600">
                    Seguimiento
                  </TabsTrigger>
                  <TabsTrigger value="referido" className="px-0 text-sm data-active:text-zinc-950 after:bg-red-600">
                    Cargar Referido
                  </TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="seguimiento" className="p-5">
                <SeguimientoForm key={`${lead.id}-${lead.updated_at}`} lead={lead} />
              </TabsContent>
              <TabsContent value="referido" className="p-5">
                <ReferidoForm key={lead.id} lead={lead} barrios={barrios} />
              </TabsContent>
            </Tabs>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
