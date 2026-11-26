import { createHash, timingSafeEqual } from "node:crypto"
import { cookies } from "next/headers"

export const SESSION_COOKIE = "prospector_session"

function sha256(value: string): Buffer {
  return createHash("sha256").update(value).digest()
}

export function safeEqual(a: string, b: string): boolean {
  return timingSafeEqual(sha256(a), sha256(b))
}

export function getExpectedToken(password: string): string {
  return createHash("sha256").update(`prospector-cba::${password}`).digest("hex")
}

export async function isAuthenticated(): Promise<boolean> {
  const password = process.env.APP_PASSWORD?.trim()
  if (!password) return false

  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return false

  return safeEqual(token, getExpectedToken(password))
}