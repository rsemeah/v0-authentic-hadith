"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { ChevronLeft, Share2, BookOpen } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { BookCard } from "@/components/collections/book-card"
import { Breadcrumb } from "@/components/collections/breadcrumb"

interface Collection {
  id: string
  name_en: string
  name_ar: string
  slug: string
  description_en: string | null
  total_hadiths: number
  total_books: number
  scholar: string
  is_featured: boolean
  grade_distribution: {
    sahih: number
    hasan: number
    daif: number
  }
}

interface Book {
  id: string
  number: number
  name_en: string
  name_ar: string
  total_hadiths: number
  total_chapters: number
}

export default function CollectionDetailPage() {
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string
  const supabase = getSupabaseBrowserClient()

  const [collection, setCollection] = useState<Collection | null>(null)
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      // Fetch collection
      const { data: coll, error: collErr } = await supabase
        .from("collections")
        .select("*")
        .eq("slug", slug)
        .single()

      console.log("[v0] collection fetch:", { coll: coll?.name_en, collErr })

      if (coll) {
        setCollection(coll)

        // Fetch books for this collection
        const { data: booksData, error: booksErr } = await supabase
          .from("books")
          .select("*")
          .eq("collection_id", coll.id)
          .order("number", { ascending: true })

        console.log("[v0] books fetch:", { count: booksData?.length, booksErr, collId: coll.id })

        if (booksData) {
          setBooks(booksData)
        }
      }

      setLoading(false)
    }

    fetchData()
  }, [supabase, slug])

  const handleShare = async () => {
    if (!collection) return
    const url = `${window.location.origin}/collections/${slug}`
    if (navigator.share) {
      await navigator.share({ title: collection.name_en, url })
    } else {
      await navigator.clipboard.writeText(url)
      alert("Link copied to clipboard!")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen marble-bg flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!collection) {
    return (
      <div className="min-h-screen marble-bg flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground/40" />
          <p className="text-muted-foreground mb-4">Collection not found</p>
          <button onClick={() => router.push("/collections")} className="px-4 py-2 rounded-lg emerald-button text-sm">
            Back to Collections
          </button>
        </div>
      </div>
    )
  }

  const sahihPct = collection.grade_distribution?.sahih || 0
  const hasanPct = collection.grade_distribution?.hasan || 0
  const daifPct = collection.grade_distribution?.daif || 0
  const total = sahihPct + hasanPct + daifPct || 1

  return (
    <div className="min-h-screen marble-bg pb-20 md:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[#e5e7eb] bg-[#F8F6F2]/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => router.push("/collections")}
            className="w-10 h-10 rounded-full bg-[#F8F6F2] border border-[#e5e7eb] flex items-center justify-center hover:border-[#C5A059] transition-colors"
            aria-label="Back to collections"
          >
            <ChevronLeft className="w-5 h-5 text-[#6b7280]" />
          </button>
          <h1 className="text-lg font-semibold text-[#1a1f36] truncate">{collection.name_en}</h1>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-2">
          <Breadcrumb
            items={[
              { label: "Collections", href: "/collections" },
              { label: collection.name_en },
            ]}
          />
        </div>
      </header>

      {/* Collection Info */}
      <section className="border-b border-[#e5e7eb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          {/* Arabic name */}
          <p className="text-xl text-[#C5A059] mb-2 text-right font-arabic" dir="rtl">
            {collection.name_ar}
          </p>

          {/* Scholar */}
          <p className="text-sm text-muted-foreground mb-2">
            Compiled by {collection.scholar}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-2 text-sm font-semibold text-[#1a1f36] mb-4">
            <span>{collection.total_hadiths.toLocaleString()} Hadiths</span>
            <span className="text-muted-foreground">{"·"}</span>
            <span>{collection.total_books} Books</span>
            <span
              className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
              style={{ background: "linear-gradient(135deg, #C5A059, #E8C77D)" }}
            >
              {Math.round((sahihPct / total) * 100)}% Sahih
            </span>
          </div>

          {/* Share button */}
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#d4cfc7] text-sm text-muted-foreground hover:border-[#C5A059] hover:text-[#C5A059] transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>
      </section>

      {/* Grade Distribution */}
      <section className="border-b border-[#e5e7eb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <h3 className="text-sm font-bold text-[#1a1f36] uppercase tracking-wider mb-3">Grade Distribution</h3>
          <div className="w-full h-3 rounded-full overflow-hidden flex bg-[#e5e7eb]">
            <div
              className="h-full rounded-l-full"
              style={{
                width: `${(sahihPct / total) * 100}%`,
                background: "linear-gradient(135deg, #C5A059, #E8C77D)",
              }}
            />
            <div
              className="h-full"
              style={{
                width: `${(hasanPct / total) * 100}%`,
                background: "linear-gradient(135deg, #1B5E43, #2D7A5B)",
              }}
            />
            <div
              className="h-full rounded-r-full"
              style={{
                width: `${(daifPct / total) * 100}%`,
                background: "#d4cfc7",
              }}
            />
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <span>Sahih: {Math.round((sahihPct / total) * 100)}% ({sahihPct.toLocaleString()})</span>
            <span>Hasan: {Math.round((hasanPct / total) * 100)}% ({hasanPct.toLocaleString()})</span>
            <span>{"Da'if"}: {Math.round((daifPct / total) * 100)}% ({daifPct.toLocaleString()})</span>
          </div>
        </div>
      </section>

      {/* Books */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#1a1f36]">Books ({books.length})</h3>
        </div>

        {books.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground/40" />
            <p className="text-muted-foreground">No books available yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {books.map((book) => (
              <BookCard key={book.id} book={book} collectionSlug={slug} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
