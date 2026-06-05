"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import { ThemeToggle } from "@/components/ui/theme-toggle"
import {
  APP_MODULES,
  APP_NAME,
  APP_TAGLINE,
  COMPANY_NAME,
} from "@/lib/app-branding"
import { cn } from "@/lib/utils"

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
        if (level === "administrator") {
          router.push("/platform/dashboard")
        } else if (level === "purchasing") {
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
    <div className="relative min-h-screen bg-background">
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle />
      </div>

      <div className="grid min-h-screen lg:grid-cols-2">
        <aside
          className={cn(
            "relative hidden flex-col justify-between overflow-hidden p-10 lg:flex",
            "bg-primary text-primary-foreground"
          )}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
            aria-hidden
          />
          <div className="relative space-y-8">
            <div className="space-y-2">
              <p className="text-sm font-medium uppercase tracking-widest text-primary-foreground/80">
                {COMPANY_NAME}
              </p>
              <h1 className="text-4xl font-bold tracking-tight">{APP_NAME}</h1>
              <p className="max-w-md text-lg text-primary-foreground/90">
                {APP_TAGLINE}
              </p>
            </div>
          </div>

          <ul className="relative space-y-4">
            {APP_MODULES.map((mod) => (
              <li
                key={mod.title}
                className="flex gap-4 rounded-lg border border-primary-foreground/15 bg-primary-foreground/5 p-4"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary-foreground/15">
                  <mod.icon className="size-5" aria-hidden />
                </span>
                <div className="min-w-0 space-y-0.5">
                  <p className="font-medium">{mod.title}</p>
                  <p className="text-sm text-primary-foreground/75">
                    {mod.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </aside>

        <div className="flex flex-col items-center justify-center px-4 py-10 sm:px-8">
          <div className="mb-8 w-full max-w-md space-y-2 text-center lg:hidden">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {COMPANY_NAME}
            </p>
            <h1 className="text-2xl font-bold tracking-tight">{APP_NAME}</h1>
            <p className="text-sm text-muted-foreground">{APP_TAGLINE}</p>
          </div>

          <Card className="w-full max-w-md shadow-lg">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl">Masuk ke akun Anda</CardTitle>
              <CardDescription>
                Pilih level sesuai peran, lalu masukkan kredensial yang valid.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error ? (
                  <Alert variant="destructive">
                    <AlertCircle className="size-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ) : null}

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
                    autoComplete="username"
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
                    autoComplete="current-password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level">Level akses</Label>
                  <Select
                    value={level}
                    onValueChange={setLevel}
                    required
                    disabled={loading}
                  >
                    <SelectTrigger id="level" className="w-full">
                      <SelectValue placeholder="Pilih level" />
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
                  {loading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    "Masuk"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
