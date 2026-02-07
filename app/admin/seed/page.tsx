"use client"

import { useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface BookStatus {
  number: number
  name: string
  total_hadiths: number
  seeded: boolean
}

interface CollectionStatus {
  slug: string
  name: string
  total_books: number
  total_hadiths: number
  books: BookStatus[]
  seeded_books: number
  unseeded_books: number
}

interface SeedResult {
  collection: string
  book: number
  bookName: string
  status: string
  fetched?: number
  updated?: number
  chapters_updated?: number
  error?: string
}

export default function AdminSeedPage() {
  const [collections, setCollections] = useState<CollectionStatus[]>([])
  const [loading, setLoading] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const [currentBook, setCurrentBook] = useState("")
  const [results, setResults] = useState<SeedResult[]>([])
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const abortRef = useRef(false)

  const fetchStatus = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/seed-status")
      const data = await res.json()
      setCollections(data.collections || [])
    } catch (err) {
      console.error("Failed to fetch status:", err)
    }
    setLoading(false)
  }, [])

  const seedAllUnseeded = useCallback(async () => {
    abortRef.current = false
    setSeeding(true)
    setResults([])

    // Gather all unseeded books
    const toSeed: Array<{ slug: string; bookNumber: number; bookName: string }> = []
    for (const coll of collections) {
      for (const book of coll.books) {
        if (!book.seeded) {
          toSeed.push({ slug: coll.slug, bookNumber: book.number, bookName: book.name })
        }
      }
    }

    setProgress({ done: 0, total: toSeed.length })

    for (let i = 0; i < toSeed.length; i++) {
      if (abortRef.current) break

      const { slug, bookNumber, bookName } = toSeed[i]
      setCurrentBook(`${slug} - Book ${bookNumber}: ${bookName}`)

      try {
        const res = await fetch("/api/seed-book", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ collection: slug, bookNumber }),
        })
        const data = await res.json()

        setResults(prev => [...prev, {
          collection: slug,
          book: bookNumber,
          bookName,
          status: data.status || "error",
          fetched: data.fetched,
          updated: data.updated,
          chapters_updated: data.chapters_updated,
          error: data.error,
        }])
      } catch (err) {
        setResults(prev => [...prev, {
          collection: slug,
          book: bookNumber,
          bookName,
          status: "error",
          error: String(err),
        }])
      }

      setProgress({ done: i + 1, total: toSeed.length })

      // Rate limit delay
      if (i < toSeed.length - 1) {
        await new Promise(r => setTimeout(r, 2000))
      }
    }

    setCurrentBook("")
    setSeeding(false)
    // Refresh status
    fetchStatus()
  }, [collections, fetchStatus])

  const seedSingleBook = useCallback(async (slug: string, bookNumber: number, bookName: string) => {
    setSeeding(true)
    setCurrentBook(`${slug} - Book ${bookNumber}: ${bookName}`)

    try {
      const res = await fetch("/api/seed-book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collection: slug, bookNumber }),
      })
      const data = await res.json()

      setResults(prev => [...prev, {
        collection: slug,
        book: bookNumber,
        bookName,
        status: data.status || "error",
        fetched: data.fetched,
        updated: data.updated,
        chapters_updated: data.chapters_updated,
        error: data.error,
      }])
    } catch (err) {
      setResults(prev => [...prev, {
        collection: slug,
        book: bookNumber,
        bookName,
        status: "error",
        error: String(err),
      }])
    }

    setCurrentBook("")
    setSeeding(false)
    fetchStatus()
  }, [fetchStatus])

  const stopSeeding = useCallback(() => {
    abortRef.current = true
  }, [])

  const totalSeeded = collections.reduce((s, c) => s + c.seeded_books, 0)
  const totalUnseeded = collections.reduce((s, c) => s + c.unseeded_books, 0)
  const totalBooks = totalSeeded + totalUnseeded

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="mx-auto max-w-3xl">
        <header className="mb-6">
          <h1 className="font-serif text-2xl font-bold text-foreground">Database Seeder</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Backfill real hadith data from sunnah.com
          </p>
        </header>

        {/* Controls */}
        <Card className="mb-6">
          <CardContent className="flex flex-col gap-3 pt-6">
            <div className="flex items-center gap-3">
              <Button
                onClick={fetchStatus}
                disabled={loading || seeding}
                variant="outline"
                className="bg-transparent"
              >
                {loading ? "Checking..." : "Check Status"}
              </Button>

              {totalUnseeded > 0 && (
                <Button
                  onClick={seedAllUnseeded}
                  disabled={seeding}
                  className="bg-primary text-primary-foreground"
                >
                  Seed All Unseeded ({totalUnseeded} books)
                </Button>
              )}

              {seeding && (
                <Button onClick={stopSeeding} variant="destructive">
                  Stop
                </Button>
              )}
            </div>

            {totalBooks > 0 && (
              <div className="flex items-center gap-3 text-sm">
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {totalSeeded} seeded
                </Badge>
                <Badge variant="outline">
                  {totalUnseeded} remaining
                </Badge>
                <span className="text-muted-foreground">
                  {totalBooks} total books
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Progress */}
        {seeding && (
          <Card className="mb-6 border-secondary/50">
            <CardContent className="pt-6">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">Seeding in progress...</span>
                <span className="text-muted-foreground">
                  {progress.done}/{progress.total}
                </span>
              </div>
              <div className="mb-3 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: progress.total ? `${(progress.done / progress.total) * 100}%` : "0%" }}
                />
              </div>
              <p className="truncate text-xs text-muted-foreground">
                {currentBook}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Results Log */}
        {results.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base">Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-64 space-y-1 overflow-y-auto">
                {results.map((r, i) => (
                  <div key={i} className="flex items-center justify-between rounded px-2 py-1 text-xs odd:bg-muted/50">
                    <span className="truncate font-medium text-foreground">
                      {r.collection} / Book {r.book}
                    </span>
                    <div className="flex items-center gap-2">
                      {r.status === "seeded" && (
                        <span className="text-primary">
                          +{r.updated || 0} hadiths, +{r.chapters_updated || 0} chapters
                        </span>
                      )}
                      {r.status === "already_seeded" && (
                        <span className="text-muted-foreground">already done</span>
                      )}
                      {r.status === "error" && (
                        <span className="text-destructive">error</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Collections */}
        {collections.map(coll => (
          <Card key={coll.slug} className="mb-4">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{coll.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-primary/10 text-xs text-primary">
                    {coll.seeded_books}/{coll.books.length}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {coll.books.map(book => (
                  <div
                    key={book.number}
                    className="flex items-center justify-between rounded px-2 py-1.5 text-xs odd:bg-muted/30"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-block h-2 w-2 rounded-full ${
                          book.seeded ? "bg-primary" : "bg-muted-foreground/30"
                        }`}
                      />
                      <span className="truncate text-foreground">
                        Book {book.number}: {book.name}
                      </span>
                      <span className="text-muted-foreground">
                        ({book.total_hadiths})
                      </span>
                    </div>
                    {!book.seeded && !seeding && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs text-primary"
                        onClick={() => seedSingleBook(coll.slug, book.number, book.name)}
                      >
                        Seed
                      </Button>
                    )}
                    {book.seeded && (
                      <span className="text-xs text-primary">done</span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {collections.length === 0 && !loading && (
          <div className="py-12 text-center text-sm text-muted-foreground">
            Click "Check Status" to see all collections and their seeding status
          </div>
        )}
      </div>
    </div>
  )
}
