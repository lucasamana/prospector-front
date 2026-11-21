"use client"

import { useState, type FormEvent } from "react"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { ESTADO_CRM_OPTIONS, emptyToNull } from "@/lib/format"
import { revalidateLeadsAndBarrios } from "@/lib/hooks"
import type { EstadoCRM, Lead } from "@/lib/types"
import { Field, NativeSelect, Spinner, fieldClass } from "@/components/form-controls"
import { Horarios } from "./horarios"
import { Rating } from "./lead-badges"

export function SeguimientoForm({ lead }: { lead: Lead }) {
  const [form, setForm] = useState({
    estado_crm: lead.estado_crm,
    proximo_contacto: lead.proximo_contacto?.slice(0, 10) ?? "",
    notas: lead.notas ?? "",
    telefono_raw: lead.telefono_raw ?? "",
    rubro: lead.rubro ?? "",
    instagram: lead.instagram ?? "",
    website: lead.website ?? "",
  })
  const [saving, setSaving] = useState(false)
  const set = (key: keyof typeof form) => (value: string) => setForm((f) => ({ ...f, [key]: value }))

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await api.updateLead(lead.id, {
        estado_crm: form.estado_crm as EstadoCRM,
        proximo_contacto: form.proximo_contacto || null,
        notas: emptyToNull(form.notas),
        telefono_raw: emptyToNull(form.telefono_raw),
        rubro: emptyToNull(form.rubro),
        instagram: emptyToNull(form.instagram),
        website: emptyToNull(form.website),
      })
      await revalidateLeadsAndBarrios()
      toast.success("Cambios guardados", { description: lead.nombre })
    } catch (err) {
      toast.error("No se pudieron guardar los cambios", { description: (err as Error).message })
    } finally {
      setSaving(false)
    }
  }

  const id = (name: string) => `seg-${lead.id}-${name}`

  return (
    <div className="flex flex-col gap-6">
      <dl className="grid grid-cols-1 gap-3 rounded-xl border border-zinc-200/80 bg-zinc-50/60 p-4 text-sm">
        <InfoRow label="Dirección">{lead.direccion ?? <span className="text-zinc-400">—</span>}</InfoRow>
        <InfoRow label="Teléfono">
          {lead.telefono_normalizado ? (
            <span className="font-mono tabular-nums">{lead.telefono_normalizado}</span>
          ) : (
            <span className="text-zinc-400">—</span>
          )}
        </InfoRow>
        <InfoRow label="Rating">
          {lead.rating !== null ? <Rating rating={lead.rating} reviews={lead.reviews_count} /> : <span className="text-zinc-400">—</span>}
        </InfoRow>
        <InfoRow label="Horarios">
          <Horarios value={lead.horarios_json} />
        </InfoRow>
      </dl>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NativeSelect label="Estado CRM" visibleLabel value={form.estado_crm} onChange={set("estado_crm")}>
            {ESTADO_CRM_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </NativeSelect>
          <Field label="Próximo contacto" htmlFor={id("proximo")}>
            <input id={id("proximo")} type="date" value={form.proximo_contacto} onChange={(e) => set("proximo_contacto")(e.target.value)} className={fieldClass} />
          </Field>
        </div>
        <Field label="Notas" htmlFor={id("notas")}>
          <textarea
            id={id("notas")}
            rows={4}
            value={form.notas}
            onChange={(e) => set("notas")(e.target.value)}
            placeholder="Con quién hablaste, qué le interesa, objeciones..."
            className={`${fieldClass} h-auto resize-y py-2`}
          />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Teléfono" htmlFor={id("tel")}>
            <input id={id("tel")} inputMode="tel" value={form.telefono_raw} onChange={(e) => set("telefono_raw")(e.target.value)} placeholder="351 15 123-4567" className={`${fieldClass} tabular-nums`} />
          </Field>
          <Field label="Rubro" htmlFor={id("rubro")}>
            <input id={id("rubro")} value={form.rubro} onChange={(e) => set("rubro")(e.target.value)} placeholder="cafe" className={fieldClass} />
          </Field>
          <Field label="Instagram" htmlFor={id("ig")}>
            <input id={id("ig")} type="url" value={form.instagram} onChange={(e) => set("instagram")(e.target.value)} placeholder="https://instagram.com/..." className={fieldClass} />
          </Field>
          <Field label="Sitio web" htmlFor={id("web")}>
            <input id={id("web")} type="url" value={form.website} onChange={(e) => set("website")(e.target.value)} placeholder="https://..." className={fieldClass} />
          </Field>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-medium text-white transition-colors hover:bg-red-700 focus-visible:ring-3 focus-visible:ring-red-600/30 outline-none disabled:opacity-60"
        >
          {saving && <Spinner />}
          Guardar cambios
        </button>
      </form>
    </div>
  )
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[88px_1fr] gap-3">
      <dt className="text-zinc-500">{label}</dt>
      <dd className="min-w-0 text-zinc-900">{children}</dd>
    </div>
  )
}
