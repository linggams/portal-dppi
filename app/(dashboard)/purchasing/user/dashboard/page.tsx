import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card } from "@/components/ui/card"

export default function UserDashboardPage() {
  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="p-6">
            <div className="text-sm font-medium text-muted-foreground">
              Today's Requests
            </div>
            <div className="mt-2 text-2xl font-bold">-</div>
          </Card>
          <Card className="p-6">
            <div className="text-sm font-medium text-muted-foreground">
              Total Requests
            </div>
            <div className="mt-2 text-2xl font-bold">-</div>
          </Card>
          <Card className="p-6">
            <div className="text-sm font-medium text-muted-foreground">
              Latest Status
            </div>
            <div className="mt-2 text-2xl font-bold">-</div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
