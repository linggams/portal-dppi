import Link from "next/link"
import { AuthCard } from "@/components/layout/auth-card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function UnauthorizedPage() {
  return (
    <AuthCard title="Akses Ditolak">
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Tidak diizinkan</AlertTitle>
          <AlertDescription>
            Anda tidak memiliki izin untuk mengakses halaman ini.
          </AlertDescription>
        </Alert>
        <Button asChild className="w-full">
          <Link href="/">Kembali ke Dashboard</Link>
        </Button>
      </div>
    </AuthCard>
  )
}
