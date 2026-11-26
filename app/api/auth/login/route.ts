import { NextResponse } from "next/server"
import { getExpectedToken, safeEqual, SESSION_COOKIE } from "@/lib/auth"

export async function POST(req: Request) {
  const expectedPassword = process.env.APP_PASSWORD?.trim()
  if (!expectedPassword) {
    return NextResponse.json(
      { detail: "Falta configurar APP_PASSWORD en las variables de entorno." },
      { status: 500 },
    )
  }

  let password = ""
  try {
    const body = await req.json()
    if (typeof body?.password === "string") password = body.password
  } catch {
    return NextResponse.json({ detail: "Solicitud inválida." }, { status: 400 })
  }

  if (!password || !safeEqual(password, expectedPassword)) {
    return NextResponse.json({ detail: "Contraseña incorrecta." }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set(SESSION_COOKIE, getExpectedToken(expectedPassword), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 días de sesión
  })
  return res
}