import { NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "@/lib/get-session"
import { canAccessPlatform } from "@/lib/auth/permissions"
import { prisma } from "@/lib/db/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const updateUserSchema = z.object({
  username: z.string().min(3).max(20).optional(),
  password: z.string().min(3).optional(),
  level: z.enum(["user", "administrator", "it_support", "purchasing"]).optional(),
  jabatan: z.string().min(1).max(50).optional(),
})

// GET - Get single user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(request)
    const { id } = await params

    if (!session || !canAccessPlatform(session.user.level)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { idUser: parseInt(id) },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    const { password, ...userWithoutPassword } = user

    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PUT - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(request)
    const { id } = await params

    if (!session || !canAccessPlatform(session.user.level)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = updateUserSchema.parse(body)

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { idUser: parseInt(id) },
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Check if username is being changed and if it's already taken
    if (validatedData.username && validatedData.username !== existingUser.username) {
      const usernameTaken = await prisma.user.findUnique({
        where: { username: validatedData.username },
      })

      if (usernameTaken) {
        return NextResponse.json(
          { error: "Username already exists" },
          { status: 400 }
        )
      }
    }

    // Prepare update data
    const updateData: any = {}
    if (validatedData.username) updateData.username = validatedData.username
    if (validatedData.level) updateData.level = validatedData.level
    if (validatedData.jabatan) updateData.jabatan = validatedData.jabatan
    if (validatedData.password) {
      updateData.password = await bcrypt.hash(validatedData.password, 10)
    }

    const user = await prisma.user.update({
      where: { idUser: parseInt(id) },
      data: updateData,
    })

    const { password, ...userWithoutPassword } = user

    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Error updating user:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(request)
    const { id } = await params

    if (!session || !canAccessPlatform(session.user.level)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Prevent deleting own account
    if (parseInt(id) === parseInt(session.user.id)) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      )
    }

    const user = await prisma.user.delete({
      where: { idUser: parseInt(id) },
    })

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
