import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface AuthCardProps {
  title: string
  subtitle?: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function AuthCard({
  title,
  subtitle,
  description,
  children,
  className,
}: AuthCardProps) {
  return (
    <div
      className={cn(
        "flex min-h-screen items-center justify-center bg-muted/40 px-4 py-8",
        className
      )}
    >
      <Card className="w-full max-w-md shadow-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{title}</CardTitle>
          {subtitle ? (
            <CardDescription className="text-sm font-medium text-foreground">
              {subtitle}
            </CardDescription>
          ) : null}
          {description ? (
            <CardDescription className="pt-1">{description}</CardDescription>
          ) : null}
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  )
}
