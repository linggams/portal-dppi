import { redirect } from "next/navigation"
import { getServerSession } from "@/lib/get-session"
import { getDefaultHomePath } from "@/lib/auth/permissions"

export default async function HomePage() {
  const session = await getServerSession()

  if (!session) {
    redirect("/login")
  }

  redirect(getDefaultHomePath(session.user.level))
}
