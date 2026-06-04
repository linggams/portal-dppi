import { DashboardLayout } from "@/components/layout/DashboardLayout"

export default function AdminDashboardPage() {
  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6 flex flex-1 flex-col items-center justify-center text-center text-muted-foreground">
                <p className="mt-8 text-sm">
          Placeholder dashboard. Statistik dan ringkasan akan ditampilkan di sini nanti.
        </p>
      </div>
    </DashboardLayout>
  )
}
