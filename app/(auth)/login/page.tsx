"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { AuthCard } from "@/components/layout/auth-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { APP_DESCRIPTION, APP_NAME, COMPANY_NAME } from "@/lib/app-branding"

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [level, setLevel] = useState<string>("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await signIn("credentials", {
        username,
        password,
        level,
        redirect: false,
      })

      if (result?.error) {
        const errorMessage =
          result.error === "CredentialsSignin"
            ? "Username, password, atau level yang Anda masukkan salah."
            : result.error
        setError(errorMessage)
      } else if (result?.ok) {
        if (level === "administrator" || level === "purchasing") {
          router.push("/purchasing/admin/dashboard")
        } else if (level === "it_support") {
          router.push("/it/staff/dashboard")
        } else if (level === "user") {
          router.push("/purchasing/user/dashboard")
        } else {
          router.push("/")
        }
        router.refresh()
      }
    } catch (error) {
      console.error("Login error:", error)
      setError(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat login. Silakan coba lagi."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard
      title={APP_NAME}
      subtitle={COMPANY_NAME}
      description={APP_DESCRIPTION}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            type="text"
            placeholder="Masukkan username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Masukkan password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="level">Level</Label>
          <Select
            value={level}
            onValueChange={setLevel}
            required
            disabled={loading}
          >
            <SelectTrigger id="level">
              <SelectValue placeholder="Pilih Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="purchasing">Purchasing</SelectItem>
              <SelectItem value="administrator">Administrator</SelectItem>
              <SelectItem value="it_support">IT Support</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={loading || !username || !password || !level}
        >
          {loading ? "Memproses..." : "Login"}
        </Button>
      </form>
    </AuthCard>
  )
}
