"use client"

import { useState } from "react"
import { RotateCw, ServerCrash } from "lucide-react"
import { cn } from "@/lib/utils"

interface ErrorStateProps {
  title?: string
  message: string
  onRetry: () => unknown
  className?: string
}

export function ErrorState({ title = "No se pudo conectar al backend", message, onRetry, className }: ErrorStateProps) {
  const [retrying, setRetrying] = useState(false)

  async function retry() {
    setRetrying(true)
    try {
      await onRetry()
    } finally {
      setRetrying(false)
    }
  }

  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center gap-4 rounded-2xl border border-zinc-200 bg-white px-6 py-12 text-center",
        className,
      )}
    >
      <span className="grid size-11 place-items-center rounded-full bg-red-50 text-red-600">
        <ServerCrash className="size-5" aria-hidden />
      </span>
      <div className="flex max-w-md flex-col gap-1.5">
        <p className="text-base font-semibold text-zinc-950 text-balance">{title}</p>
        <p className="text-sm text-zinc-500 text-pretty">{message}</p>
      </div>
      <button
        type="button"
        onClick={retry}
        disabled={retrying}
        className="inline-flex h-10 items-center gap-2 rounded-lg bg-zinc-950 px-4 text-sm font-medium text-white outline-none transition-colors hover:bg-zinc-800 focus-visible:ring-3 focus-visible:ring-zinc-950/30 disabled:opacity-60"
      >
        <RotateCw className={cn("size-4", retrying && "animate-spin")} aria-hidden />
        Reintentar
      </button>
    </div>
  )
}
