import type { NextAuthConfig } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/db/prisma"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import {
  buildSessionAuthUser,
  sessionUserFromToken,
} from "@/lib/auth/session-user"

export const authOptions: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          console.error("Missing credentials")
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: { username: credentials.username as string },
            include: { role: true },
          })

          if (!user) {
            console.error("User not found:", credentials.username)
            return null
          }

          let isValidPassword = false
          const passwordStr = credentials.password as string
          const userPasswordStr = user.password

          if (
            userPasswordStr.startsWith("$2a$") ||
            userPasswordStr.startsWith("$2b$") ||
            userPasswordStr.startsWith("$2y$")
          ) {
            try {
              isValidPassword = await bcrypt.compare(passwordStr, userPasswordStr)
            } catch {
              isValidPassword = false
            }
          } else {
            const md5Hash = crypto.createHash("md5").update(passwordStr).digest("hex")
            isValidPassword = md5Hash === userPasswordStr
          }

          if (!isValidPassword) {
            console.error("Invalid password for user:", credentials.username)
            return null
          }

          return buildSessionAuthUser(user)
        } catch (error) {
          console.error("Auth error:", error)
          if (error instanceof Error) {
            console.error("Error message:", error.message)
            console.error("Error stack:", error.stack)
          }
          return null
        }
      },
    }),
  ],
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.username = user.username
        token.level = user.level
        token.jabatan = user.jabatan
        token.roleName = user.roleName
        token.homePath = user.homePath
        token.capabilities = user.capabilities
      }
      return token
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        const authUser = sessionUserFromToken({
          sub: token.sub,
          username: token.username,
          jabatan: token.jabatan,
          level: token.level,
          roleName: token.roleName,
          homePath: token.homePath,
          capabilities: token.capabilities,
        })
        session.user.id = authUser.id
        session.user.username = authUser.username
        session.user.level = authUser.level
        session.user.jabatan = authUser.jabatan
        session.user.roleName = authUser.roleName
        session.user.homePath = authUser.homePath
        session.user.capabilities = authUser.capabilities
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
}
