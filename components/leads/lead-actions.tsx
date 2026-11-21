import type { ReactNode } from "react"
import { Globe, MessageCircle, PencilLine, Phone } from "lucide-react"
import { cn } from "@/lib/utils"
import { buildWhatsAppHref } from "@/lib/format"
import type { Lead } from "@/lib/types"

type Size = "sm" | "lg"

const base =
  "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-red-600/25"
const sizes: Record<Size, string> = {
  sm: "h-8 px-2.5 text-xs",
  lg: "h-11 px-4",
}
const iconSizes: Record<Size, string> = { sm: "size-8", lg: "size-11" }
const disabledCls = "pointer-events-none border-zinc-100 bg-zinc-50 text-zinc-300"

function ActionLink({
  href,
  label,
  children,
  className,
  external,
}: {
  href: string | null
  label: string
  children: ReactNode
  className: string
  external?: boolean
}) {
  if (!href) {
    return (
      <span aria-disabled="true" aria-label={`${label} (no disponible)`} className={cn(base, className, disabledCls)}>
        {children}
      </span>
    )
  }
  return (
    <a
      href={href}
      aria-label={label}
      className={className.includes("bg-") ? cn(base, className) : cn(base, className)}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  )
}

export function WhatsAppButton({ lead, size = "sm", showLabel = true }: { lead: Lead; size?: Size; showLabel?: boolean }) {
  return (
    <ActionLink
      href={lead.whatsapp_url ? buildWhatsAppHref(lead.whatsapp_url, lead.nombre) : null}
      label={`Enviar WhatsApp a ${lead.nombre}`}
      external
      className={cn(
        showLabel ? sizes[size] : iconSizes[size],
        "border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700",
      )}
    >
      <MessageCircle className="size-4" aria-hidden />
      {showLabel && "WhatsApp"}
    </ActionLink>
  )
}

export function CallButton({ lead, size = "sm", showLabel = true }: { lead: Lead; size?: Size; showLabel?: boolean }) {
  return (
    <ActionLink
      href={lead.telefono_normalizado ? `tel:${lead.telefono_normalizado}` : null}
      label={`Llamar a ${lead.nombre}`}
      className={cn(
        showLabel ? sizes[size] : iconSizes[size],
        "border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50",
      )}
    >
      <Phone className="size-4" aria-hidden />
      {showLabel && "Llamar"}
    </ActionLink>
  )
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden>
      <rect x="2.75" y="2.75" width="18.5" height="18.5" rx="5.25" />
      <circle cx="12" cy="12" r="4.25" />
      <circle cx="17.6" cy="6.4" r="1.15" fill="currentColor" stroke="none" />
    </svg>
  )
}

function SocialButtons({ lead, size }: { lead: Lead; size: Size }) {
  const cls = cn(iconSizes[size], "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900")
  return (
    <>
      {lead.instagram && (
        <ActionLink href={lead.instagram} label={`Instagram de ${lead.nombre}`} external className={cls}>
          <InstagramIcon className="size-4" />
        </ActionLink>
      )}
      {lead.website && (
        <ActionLink href={lead.website} label={`Sitio web de ${lead.nombre}`} external className={cls}>
          <Globe className="size-4" aria-hidden />
        </ActionLink>
      )}
    </>
  )
}

export function LeadActions({ lead, size = "sm", onEdit }: { lead: Lead; size?: Size; onEdit: () => void }) {
  return (
    <div className={cn("flex items-center", size === "lg" ? "flex-wrap gap-2" : "gap-1.5")}>
      <WhatsAppButton lead={lead} size={size} />
      <CallButton lead={lead} size={size} showLabel={size === "lg"} />
      <SocialButtons lead={lead} size={size} />
      <button
        type="button"
        onClick={onEdit}
        aria-label={`Editar ${lead.nombre}`}
        className={cn(
          base,
          size === "lg" ? cn(sizes.lg, "ml-auto") : iconSizes.sm,
          "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950",
        )}
      >
        <PencilLine className="size-4" aria-hidden />
        {size === "lg" && "Detalle"}
      </button>
    </div>
  )
}
