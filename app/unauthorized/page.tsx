import Link from "next/link"
import { AuthCard } from "@/components/layout/auth-card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function UnauthorizedPage() {
  return (
    <AuthCard title="Access denied">
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Unauthorized</AlertTitle>
          <AlertDescription>
            You do not have permission to access this page.
          </AlertDescription>
        </Alert>
        <Button asChild className="w-full">
          <Link href="/">Back to dashboard</Link>
        </Button>
      </div>
    </AuthCard>
  )
}
