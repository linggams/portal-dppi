import type { NextAuthConfig } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/db/prisma"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { normalizeUserLevel } from "@/lib/user-level"

export const authOptions: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
        level: { label: "Level", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password || !credentials?.level) {
          console.error("Missing credentials")
          return null
        }

        try {
          console.log("Attempting to find user:", credentials.username)
          
          const user = await prisma.user.findUnique({
            where: { username: credentials.username as string }
          })
          
          console.log("User found:", user ? "Yes" : "No")

          if (!user) {
            console.error("User not found:", credentials.username)
            return null
          }

          // Check password - support both MD5 (legacy) and bcrypt
          let isValidPassword = false
          const passwordStr = credentials.password as string
          const userPasswordStr = user.password
          
          // Try bcrypt first (check if password looks like bcrypt hash)
          if (userPasswordStr.startsWith('$2a$') || userPasswordStr.startsWith('$2b$') || userPasswordStr.startsWith('$2y$')) {
            try {
              isValidPassword = await bcrypt.compare(passwordStr, userPasswordStr)
            } catch {
              // If bcrypt fails, password is invalid
              isValidPassword = false
            }
          } else {
            // If not bcrypt, try MD5 (for legacy passwords)
            const md5Hash = crypto.createHash('md5').update(passwordStr).digest('hex')
            isValidPassword = md5Hash === userPasswordStr
          }

          if (!isValidPassword) {
            console.error("Invalid password for user:", credentials.username)
            return null
          }

          // Check level
          if (user.level !== credentials.level) {
            console.error("Level mismatch:", user.level, "vs", credentials.level)
            return null
          }

          return {
            id: user.idUser.toString(),
            username: user.username,
            level: user.level,
            jabatan: user.jabatan
          }
        } catch (error) {
          console.error("Auth error:", error)
          // Log full error details for debugging
          if (error instanceof Error) {
            console.error("Error message:", error.message)
            console.error("Error stack:", error.stack)
          }
          // Return null instead of throwing to prevent JSON parsing errors
          // This ensures NextAuth returns a valid JSON response
          return null
        }
      }
    })
  ],
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.username = user.username
        token.level = user.level
        token.jabatan = user.jabatan
      }
      return token
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.id = token.sub || ""
        session.user.username = token.username as string
        session.user.level = normalizeUserLevel(token.level as string)
        session.user.jabatan = token.jabatan as string
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt"
  },
}
