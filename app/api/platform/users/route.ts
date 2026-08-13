import { NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "@/lib/get-session"
import { canAccessPlatform } from "@/lib/auth/permissions"
import { legacyLevelFromRole } from "@/lib/auth/capabilities"
import { managerModulesForRole } from "@/lib/auth/manager-modules"
import { prisma } from "@/lib/db/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const modulesSchema = z.object({
  managePurchasing: z.boolean(),
  manageIt: z.boolean(),
  manageDana: z.boolean(),
})

const userSchema = z.object({
  username: z.string().min(3).max(20),
  password: z.string().min(3),
  roleId: z.number().int().positive(),
  jabatan: z.string().min(1).max(50),
  modules: modulesSchema.optional(),
})

function serializeUser<T extends { password: string }>(user: T) {
  const { password: _, ...rest } = user
  return rest
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)

    if (!session || !canAccessPlatform(session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const users = await prisma.user.findMany({
      orderBy: { idUser: "desc" },
      include: {
        role: {
          select: { idRole: true, code: true, name: true },
        },
      },
    })

    return NextResponse.json(users.map(serializeUser))
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request)

    if (!session || !canAccessPlatform(session.user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = userSchema.parse(body)

    const existingUser = await prisma.user.findUnique({
      where: { username: validatedData.username },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 400 }
      )
    }

    const role = await prisma.role.findUnique({
      where: { idRole: validatedData.roleId },
    })

    if (!role) {
      return NextResponse.json({ error: "Role tidak ditemukan" }, { status: 400 })
    }

    const modulesResult = managerModulesForRole(
      role.canAccessPlatform,
      validatedData.modules
    )
    if (!modulesResult.ok) {
      return NextResponse.json({ error: modulesResult.error }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10)

    const user = await prisma.user.create({
      data: {
        username: validatedData.username,
        password: hashedPassword,
        jabatan: validatedData.jabatan,
        roleId: role.idRole,
        level: legacyLevelFromRole(role),
        ...modulesResult.modules,
      },
      include: {
        role: {
          select: { idRole: true, code: true, name: true },
        },
      },
    })

    return NextResponse.json(serializeUser(user), { status: 201 })
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
