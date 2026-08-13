import { getToken } from "next-auth/jwt"
import { NextRequest } from "next/server"
import { auth } from "@/app/api/auth/[...nextauth]/route"
import { sessionUserFromToken } from "@/lib/auth/session-user"

export async function getServerSession() {
  const session = await auth()
  return session
}

export async function getSessionFromRequest(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  if (!token) {
    return null
  }

  return {
    user: sessionUserFromToken({
      sub: token.sub,
      username: token.username as string | undefined,
      jabatan: token.jabatan as string | undefined,
      level: token.level as string | undefined,
      roleName: token.roleName as string | undefined,
      homePath: token.homePath as string | undefined,
      capabilities: token.capabilities,
    }),
  }
}
