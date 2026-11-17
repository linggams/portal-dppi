"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Search, Shield } from "lucide-react"
import { DashboardLayout, PageActions } from "@/components/layout"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  NIST_FUNCTION_ORDER,
  NIST_MAPPING_DATA,
  filterNistFunction,
  searchNistMapping,
  type NistFunction,
} from "@/lib/itms/nist-mapping"

function MappingSection({
  data,
  sopBase,
}: {
  data: NistFunction
  sopBase: string
}) {
  return (
    <section className="overflow-hidden rounded-xl border bg-card">
      <div className="border-b bg-muted/25 px-5 py-4">
        <h2 className="text-lg font-semibold tracking-tight">{data.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{data.description}</p>
      </div>
      <div className="divide-y">
        {data.categories.map((category) => (
          <div key={category.code} className="grid gap-4 px-5 py-4 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="font-mono">
                  {category.code}
                </Badge>
                <h3 className="text-sm font-semibold">{category.name}</h3>
              </div>
              <ul className="space-y-1.5">
                {category.subcategories.map((sub) => (
                  <li
                    key={sub}
                    className="flex gap-2 text-sm leading-snug text-muted-foreground"
                  >
                    <span className="mt-2 size-1 shrink-0 rounded-full bg-foreground/40" />
                    <span>{sub}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-2 text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                Related IT offerings
              </p>
              {category.offerings.length === 0 ? (
                <p className="text-sm text-muted-foreground">—</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {category.offerings.map((offering) => (
                    <Button
                      key={offering.name}
                      asChild
                      size="sm"
                      variant="outline"
                      className="h-auto whitespace-normal px-2.5 py-1.5 text-left text-xs"
                    >
                      <Link
                        href={`${sopBase}?q=${encodeURIComponent(offering.name)}`}
                      >
                        {offering.name}
                      </Link>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export function ItmsNistMappingPage({
  area,
}: {
  area: "console" | "portal"
}) {
  const [q, setQ] = useState("")
  const [query, setQuery] = useState("")
  const sopBase = `/itms/${area}/sop`

  const sections = useMemo(() => {
    return NIST_FUNCTION_ORDER.map((key) => {
      const filtered = filterNistFunction(NIST_MAPPING_DATA[key], query)
      return filtered ? { key, data: filtered } : null
    }).filter(Boolean) as Array<{ key: string; data: NistFunction }>
  }, [query])

  const hitCount = useMemo(
    () => (query ? searchNistMapping(query).length : 0),
    [query]
  )

  return (
    <DashboardLayout title="NIST Mapping">
      <div className="mb-5 overflow-hidden rounded-xl border bg-card">
        <div className="border-b bg-muted/25 px-5 py-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl space-y-2">
              <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                <Shield className="size-3.5" />
                Cybersecurity alignment
              </p>
              <h1 className="text-2xl font-semibold tracking-tight">
                Mapping Offerings to NIST Cybersecurity
              </h1>
              <p className="text-sm text-muted-foreground">
                Mapping IT services and SOP offerings against NIST Cybersecurity
                Framework (CSF) 2.0 functions: Govern, Identify, Protect, Detect,
                Respond, and Recover.
              </p>
            </div>
          </div>
        </div>
      </div>

      <PageActions>
        <form
          className="flex flex-wrap items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            setQuery(q.trim())
          }}
        >
          <div className="relative">
            <Search className="pointer-events-none absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search NIST CSF mapping…"
              className="w-80 pl-8"
            />
          </div>
          <Button type="submit" variant="secondary" size="sm">
            Search
          </Button>
          {query ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setQ("")
                setQuery("")
              }}
            >
              Clear
            </Button>
          ) : null}
        </form>
      </PageActions>

      {query ? (
        <p className="mb-4 text-sm text-muted-foreground">
          Searching “{query}” — {hitCount} match
          {hitCount === 1 ? "" : "es"}
        </p>
      ) : null}

      <div className="space-y-6">
        {sections.length === 0 ? (
          <div className="rounded-xl border px-5 py-10 text-center text-sm text-muted-foreground">
            No mapping sections match this search.
          </div>
        ) : (
          sections.map(({ key, data }) => (
            <MappingSection key={key} data={data} sopBase={sopBase} />
          ))
        )}
      </div>
    </DashboardLayout>
  )
}
