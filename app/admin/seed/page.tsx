"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

interface CollectionStatus {
  slug: string
  name: string
  expected_hadiths: number
  hadith_count: number
  missing: number
  book_count: number
  expected_books: number
}

interface SeedResult {
  total_inserted: number
  total_skipped: number
  sections: number
  errors: string[]
}

const SEED_ORDER = [
  "muwatta-malik",
  "jami-tirmidhi",
  "sunan-ibn-majah",
  "sunan-nasai",
  "sunan-abu-dawud",
  "sahih-muslim",
  "sahih-bukhari",
  "musnad-ahmad",
]

export default function SeedAdminPage() {
  const [collections, setCollections] = useState<CollectionStatus[]>([])
  const [totalHadiths, setTotalHadiths] = useState(0)
  const [totalExpected, setTotalExpected] = useState(0)
  const [loading, setLoading] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const [currentCollection, setCurrentCollection] = useState<string | null>(null)
  const [results, setResults] = useState<Record<string, SeedResult>>({})
  const [log, setLog] = useState<string[]>([])

  async function fetchStatus() {
    setLoading(true)
    try {
      const resp = await fetch("/api/seed-status")
      if (resp.ok) {
        const data = await resp.json()
        setCollections(data.collections || [])
        setTotalHadiths(data.total_hadiths || 0)
        setTotalExpected(data.total_expected || 0)
      }
    } catch (err) {
      console.error("Failed to fetch status:", err)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  async function seedCollection(slug: string) {
    setCurrentCollection(slug)
    setLog(prev => [...prev, `Starting ${slug}...`])

    try {
      const resp = await fetch("/api/seed-full", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collection: slug }),
      })

      if (!resp.ok) {
        const err = await resp.text()
        setLog(prev => [...prev, `ERROR ${slug}: ${err}`])
        setCurrentCollection(null)
        return
      }

      const data = await resp.json()
      const result = data.results?.[slug]
      if (result) {
        setResults(prev => ({ ...prev, [slug]: result }))
        setLog(prev => [
          ...prev,
          `Done ${slug}: +${result.total_inserted} inserted, ${result.sections} sections processed${result.errors.length > 0 ? `, ${result.errors.length} errors` : ""}`,
        ])
      }
    } catch (err) {
      setLog(prev => [...prev, `ERROR ${slug}: ${String(err)}`])
    }

    setCurrentCollection(null)
    await fetchStatus()
  }

  async function seedAll() {
    setSeeding(true)
    setLog([])
    setResults({})

    for (const slug of SEED_ORDER) {
      const coll = collections.find(c => c.slug === slug)
      if (coll && coll.missing > 0) {
        await seedCollection(slug)
      } else {
        setLog(prev => [...prev, `Skipping ${slug} (complete)`])
      }
    }

    setSeeding(false)
    setLog(prev => [...prev, "--- All done ---"])
  }

  const pctTotal = totalExpected > 0 ? Math.round((totalHadiths / totalExpected) * 100) : 0

  return (
    <div className="min-h-screen bg-[#F8F6F2] p-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="font-serif text-3xl font-bold text-[#2C2416] mb-1">Hadith Seed Dashboard</h1>
        <p className="text-[#6B5D4D] mb-6">
          {totalHadiths.toLocaleString()} / {totalExpected.toLocaleString()} hadiths ({pctTotal}%)
        </p>

        <div className="mb-4 h-3 rounded-full bg-[#E8E4DA] overflow-hidden">
          <div
            className="h-full rounded-full bg-[#1B5E43] transition-all duration-700"
            style={{ width: `${pctTotal}%` }}
          />
        </div>

        <div className="mb-6 flex gap-3">
          <Button
            onClick={seedAll}
            disabled={seeding || loading}
            className="bg-[#1B5E43] text-white hover:bg-[#2D7A5B]"
          >
            {seeding ? "Seeding..." : "Seed All Missing"}
          </Button>
          <Button
            onClick={fetchStatus}
            disabled={loading}
            variant="outline"
            className="border-[#C5A059] text-[#C5A059] bg-transparent hover:bg-[#C5A059]/10"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>

        {/* Collection cards */}
        <div className="space-y-3 mb-8">
          {collections.map(coll => {
            const pct = coll.expected_hadiths > 0
              ? Math.min(100, Math.round((coll.hadith_count / coll.expected_hadiths) * 100))
              : 0
            const isFull = coll.missing <= 0
            const isActive = currentCollection === coll.slug
            const result = results[coll.slug]

            return (
              <div
                key={coll.slug}
                className={`rounded-xl border p-4 ${
                  isFull ? "border-[#1B5E43]/30 bg-[#1B5E43]/5" : "border-[#C5A059]/30 bg-white"
                } ${isActive ? "ring-2 ring-[#C5A059]" : ""}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-serif font-semibold text-[#2C2416]">{coll.name}</h3>
                    <p className="text-sm text-[#6B5D4D]">
                      {coll.hadith_count.toLocaleString()} / {coll.expected_hadiths.toLocaleString()} hadiths
                      {" | "}{coll.book_count} / {coll.expected_books} books
                      {coll.missing > 0 && (
                        <span className="text-[#C5A059]"> ({coll.missing.toLocaleString()} missing)</span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isActive && <span className="text-xs text-[#C5A059] animate-pulse">Seeding...</span>}
                    {result && !isActive && (
                      <span className="text-xs text-[#1B5E43]">+{result.total_inserted}</span>
                    )}
                    <Button
                      size="sm"
                      onClick={() => seedCollection(coll.slug)}
                      disabled={seeding || isActive}
                      className={isFull
                        ? "bg-[#1B5E43]/20 text-[#1B5E43] hover:bg-[#1B5E43]/30"
                        : "bg-[#C5A059] text-white hover:bg-[#C5A059]/90"
                      }
                    >
                      {isActive ? "..." : isFull ? "Done" : "Seed"}
                    </Button>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-[#E8E4DA] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${isFull ? "bg-[#1B5E43]" : "bg-[#C5A059]"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Log */}
        {log.length > 0 && (
          <div className="rounded-xl border border-[#E8E4DA] bg-white p-4">
            <h3 className="font-serif font-semibold text-[#2C2416] mb-2">Activity Log</h3>
            <div className="max-h-64 overflow-y-auto font-mono text-xs text-[#6B5D4D] space-y-1">
              {log.map((line, i) => (
                <div key={i} className={line.startsWith("ERROR") ? "text-red-600" : ""}>
                  {line}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
