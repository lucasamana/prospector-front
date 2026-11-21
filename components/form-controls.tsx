import type { ReactNode } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export const fieldClass =
  "h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-950 placeholder:text-zinc-400 transition-colors outline-none focus-visible:border-red-600 focus-visible:ring-3 focus-visible:ring-red-600/15 disabled:opacity-50"

export function NativeSelect({
  label,
  value,
  onChange,
  children,
  visibleLabel = false,
  className,
  id,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  children: ReactNode
  visibleLabel?: boolean
  className?: string
  id?: string
}) {
  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
      <span className={visibleLabel ? "text-xs font-medium text-zinc-600" : "sr-only"}>{label}</span>
      <span className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(fieldClass, "appearance-none pr-9")}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-zinc-400" aria-hidden />
      </span>
    </label>
  )
}

export function Field({ label, htmlFor, children, hint }: { label: string; htmlFor: string; children: ReactNode; hint?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-xs font-medium text-zinc-600">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-zinc-400">{hint}</p>}
    </div>
  )
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("inline-block size-4 animate-spin rounded-full border-2 border-current border-r-transparent", className)}
    />
  )
}
