import { Suspense } from "react"
import { ProspectorApp } from "@/components/prospector-app"
import { AppSkeleton } from "@/components/app-skeleton"

export default function Page() {
  return (
    <Suspense fallback={<AppSkeleton />}>
      <ProspectorApp />
    </Suspense>
  )
}
