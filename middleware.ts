import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import {
  canAccessUiPath,
  getDefaultHomePath,
} from "@/lib/auth/permissions"
import { sessionUserFromToken } from "@/lib/auth/session-user"

function getLegacyRedirect(pathname: string): string | null {
  if (pathname.startsWith("/api/")) return null

  if (pathname.startsWith("/admin/users")) {
    return pathname.replace("/admin/users", "/platform/users")
  }
  if (pathname.startsWith("/admin/")) {
    return pathname.replace("/admin/", "/purchasing/admin/")
  }
  if (pathname.startsWith("/user/tiket")) {
    return pathname.replace("/user/tiket", "/it/user/tiket")
  }
  if (pathname.startsWith("/user/")) {
    return pathname.replace("/user/", "/purchasing/user/")
  }
  if (pathname.startsWith("/it/user")) {
    return null
  }
  if (pathname === "/it/dashboard" || pathname === "/it/staff/dashboard") {
    return "/it/staff/tiket"
  }
  if (pathname.startsWith("/it/staff")) {
    return null
  }
  if (pathname.startsWith("/it/")) {
    return pathname.replace("/it/", "/it/staff/")
  }

  return null
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const legacy = getLegacyRedirect(pathname)
  if (legacy) {
    return NextResponse.redirect(new URL(legacy, request.url))
  }

  const publicRoutes = ["/login", "/api/auth"]
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // API harus mengembalikan JSON (401/403), bukan redirect HTML
  if (pathname.startsWith("/api/")) {
    return NextResponse.next()
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  if (!token) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  const principal = sessionUserFromToken({
    sub: token.sub,
    username: token.username as string | undefined,
    jabatan: token.jabatan as string | undefined,
    level: token.level as string | undefined,
    roleName: token.roleName as string | undefined,
    homePath: token.homePath as string | undefined,
    capabilities: token.capabilities,
  })

  if (pathname === "/purchasing/admin/dashboard") {
    return NextResponse.redirect(
      new URL(getDefaultHomePath(principal), request.url)
    )
  }

  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(getDefaultHomePath(principal), request.url)
    )
  }

  if (!canAccessUiPath(principal, pathname)) {
    return NextResponse.redirect(new URL("/unauthorized", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|login|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
