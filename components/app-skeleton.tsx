import { Skeleton } from "@/components/ui/skeleton"

export function AppSkeleton() {
  return (
    <div className="min-h-dvh bg-zinc-50">
      <div className="h-14 border-b border-zinc-200/80 bg-white" />
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 md:px-6">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl bg-zinc-200/60" />
          ))}
        </div>
        <Skeleton className="h-12 rounded-2xl bg-zinc-200/60" />
        <Skeleton className="h-96 rounded-2xl bg-zinc-200/60" />
      </div>
    </div>
  )
}
