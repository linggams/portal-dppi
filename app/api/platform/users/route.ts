import { NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "@/lib/get-session"
import { canAccessPlatform } from "@/lib/auth/permissions"
import { prisma } from "@/lib/db/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const userSchema = z.object({
  username: z.string().min(3).max(20),
  password: z.string().min(3),
  level: z.enum(["user", "administrator", "it_support", "purchasing"]),
  jabatan: z.string().min(1).max(50),
})

// GET - List all users (only for admin)
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)

    if (!session || !canAccessPlatform(session.user.level)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const users = await prisma.user.findMany({
      orderBy: {
        idUser: "desc",
      },
    })

    // Don't return passwords
    const usersWithoutPassword = users.map(({ password: _, ...user }) => user)

    return NextResponse.json(usersWithoutPassword)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST - Create new user
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)

    if (!session || !canAccessPlatform(session.user.level)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = userSchema.parse(body)

    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username: validatedData.username },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 400 }
      )
    }

    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(validatedData.password, 10)

    const user = await prisma.user.create({
      data: {
        username: validatedData.username,
        password: hashedPassword,
        level: validatedData.level,
        jabatan: validatedData.jabatan,
      },
    })

    const { password, ...userWithoutPassword } = user

    return NextResponse.json(userWithoutPassword, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Error creating user:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
