"use client"

import { useState, type FormEvent } from "react"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { emptyToNull } from "@/lib/format"
import { revalidateLeadsAndBarrios } from "@/lib/hooks"
import type { BarrioAvance, Lead } from "@/lib/types"
import { Field, NativeSelect, Spinner, fieldClass } from "@/components/form-controls"

const empty = { nombre: "", rubro: "", telefono_raw: "", direccion: "", instagram: "", notas: "", proximo_contacto: "" }

export function ReferidoForm({ lead, barrios }: { lead: Lead; barrios: BarrioAvance[] }) {
  const [form, setForm] = useState(empty)
  const [barrioId, setBarrioId] = useState(lead.barrio_id ? String(lead.barrio_id) : "")
  const [saving, setSaving] = useState(false)
  const set = (key: keyof typeof empty) => (value: string) => setForm((f) => ({ ...f, [key]: value }))

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const nombre = form.nombre.trim()
    if (!nombre) return
    setSaving(true)
    try {
      const created = await api.createReferido(lead.id, {
        nombre,
        rubro: emptyToNull(form.rubro),
        telefono_raw: emptyToNull(form.telefono_raw),
        direccion: emptyToNull(form.direccion),
        instagram: emptyToNull(form.instagram),
        notas: emptyToNull(form.notas),
        proximo_contacto: form.proximo_contacto || null,
        barrio_id: barrioId ? Number(barrioId) : null,
      })
      const hasWhatsApp = created.whatsapp_url !== null
      toast.success("Referido guardado", {
        description: hasWhatsApp
          ? `${created.nombre} · WhatsApp detectado, listo para escribirle.`
          : `${created.nombre} · Sin WhatsApp detectado.`,
      })
      setForm(empty)
      await revalidateLeadsAndBarrios()
    } catch (err) {
      toast.error("No se pudo guardar el referido", { description: (err as Error).message })
    } finally {
      setSaving(false)
    }
  }

  const id = (name: string) => `ref-${lead.id}-${name}`

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <p className="text-sm text-zinc-500">
        Nuevo comercio referido por <span className="font-medium text-zinc-950">{lead.nombre}</span>
      </p>
      <Field label="Nombre del comercio *" htmlFor={id("nombre")}>
        <input id={id("nombre")} required value={form.nombre} onChange={(e) => set("nombre")(e.target.value)} placeholder="Ej: Panadería San José" className={fieldClass} />
      </Field>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Rubro" htmlFor={id("rubro")}>
          <input id={id("rubro")} value={form.rubro} onChange={(e) => set("rubro")(e.target.value)} placeholder="panaderia" className={fieldClass} />
        </Field>
        <Field label="Teléfono" htmlFor={id("tel")}>
          <input id={id("tel")} inputMode="tel" value={form.telefono_raw} onChange={(e) => set("telefono_raw")(e.target.value)} placeholder="351 15 123-4567" className={`${fieldClass} tabular-nums`} />
        </Field>
        <Field label="Dirección" htmlFor={id("dir")}>
          <input id={id("dir")} value={form.direccion} onChange={(e) => set("direccion")(e.target.value)} placeholder="Calle y número" className={fieldClass} />
        </Field>
        <NativeSelect label="Barrio" visibleLabel value={barrioId} onChange={setBarrioId}>
          <option value="">Sin barrio</option>
          {barrios.map((b) => (
            <option key={b.id} value={String(b.id)}>
              {b.nombre}
            </option>
          ))}
        </NativeSelect>
        <Field label="Instagram" htmlFor={id("ig")}>
          <input id={id("ig")} type="url" value={form.instagram} onChange={(e) => set("instagram")(e.target.value)} placeholder="https://instagram.com/..." className={fieldClass} />
        </Field>
        <Field label="Próximo contacto" htmlFor={id("proximo")}>
          <input id={id("proximo")} type="date" value={form.proximo_contacto} onChange={(e) => set("proximo_contacto")(e.target.value)} className={fieldClass} />
        </Field>
      </div>
      <Field label="Notas" htmlFor={id("notas")}>
        <textarea id={id("notas")} rows={3} value={form.notas} onChange={(e) => set("notas")(e.target.value)} placeholder="Contexto de la recomendación..." className={`${fieldClass} h-auto resize-y py-2`} />
      </Field>
      <button
        type="submit"
        disabled={saving || !form.nombre.trim()}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-medium text-white transition-colors hover:bg-red-700 focus-visible:ring-3 focus-visible:ring-red-600/30 outline-none disabled:opacity-60"
      >
        {saving && <Spinner />}
        Guardar referido
      </button>
    </form>
  )
}
