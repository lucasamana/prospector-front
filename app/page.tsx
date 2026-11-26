import { Suspense } from "react"
import { ProspectorApp } from "@/components/prospector-app"
import { AppSkeleton } from "@/components/app-skeleton"
import { PasswordGate } from "@/components/password-gate"
import { isAuthenticated } from "@/lib/auth"

export const dynamic = "force-dynamic"

export default async function Page() {
  const authed = await isAuthenticated()

  if (!authed) {
    return <PasswordGate />
  }

  return (
    <Suspense fallback={<AppSkeleton />}>
      <ProspectorApp />
    </Suspense>
  )
}