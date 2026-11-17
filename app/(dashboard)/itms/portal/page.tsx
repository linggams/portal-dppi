"use client"

import Link from "next/link"
import { Plus, ClipboardList, Shield, Ticket } from "lucide-react"
import { DashboardLayout } from "@/components/layout"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function ItmsPortalHomePage() {
  return (
    <DashboardLayout title="IT Management">
      <div className="mx-auto grid max-w-4xl gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            IT Management
          </h1>
          <p className="mt-1 text-muted-foreground">
            Create tickets, track progress, and read IT SOPs.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/itms/portal/tickets/new">
              <Plus className="size-4" />
              Create Ticket
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/itms/portal/tickets">
              <Ticket className="size-4" />
              My Tickets
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/itms/portal/sop">
              <ClipboardList className="size-4" />
              SOP Library
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/itms/portal/nist">
              <Shield className="size-4" />
              NIST Mapping
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">SOP Library</CardTitle>
              <CardDescription>
                Controlled procedures you may need to read and acknowledge.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="secondary" size="sm">
                <Link href="/itms/portal/sop">Browse SOPs</Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">NIST Mapping</CardTitle>
              <CardDescription>
                Align IT offerings with NIST Cybersecurity Framework CSF 2.0.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="secondary" size="sm">
                <Link href="/itms/portal/nist">Open mapping</Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">My assets</CardTitle>
              <CardDescription>
                View devices currently assigned to you.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="secondary" size="sm">
                <Link href="/itms/portal/assets">View my assets</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
