"use client"

import { useRouter } from "next/navigation"
import { ChevronLeft, BookOpen, Bookmark, Share2 } from "lucide-react"
import { Breadcrumb } from "@/components/collections/breadcrumb"
import { BookCard } from "@/components/collections/book-card"
import { EmptyState } from "@/components/collections/empty-state"
import { cn } from "@/lib/utils"

interface Collection {
  id: string
  name_en: string
  name_ar: string
  slug: string
  description_en: string | null
  total_hadiths: number
  total_books: number
  scholar: string
  scholar_dates: string | null
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

interface Props {
  collection: Collection
  books: Book[]
  slug: string
}

export function CollectionDetailClient({ collection, books, slug }: Props) {
  const router = useRouter()

  const totalGraded =
    (collection.grade_distribution?.sahih || 0) +
    (collection.grade_distribution?.hasan || 0) +
    (collection.grade_distribution?.daif || 0)

  const sahihPercent =
    totalGraded > 0 ? Math.round(((collection.grade_distribution?.sahih || 0) / totalGraded) * 100) : 0
  const hasanPercent =
    totalGraded > 0 ? Math.round(((collection.grade_distribution?.hasan || 0) / totalGraded) * 100) : 0
  const daifPercent = 100 - sahihPercent - hasanPercent

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      await navigator.share({
        title: collection.name_en,
        text: `Explore ${collection.total_hadiths.toLocaleString()} authentic hadiths from ${collection.name_en}`,
        url,
      })
    } else {
      await navigator.clipboard.writeText(url)
    }
  }

  return (
    <div className="min-h-screen marble-bg">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[#e5e7eb] bg-[#F8F6F2]/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4 mb-2">
            <button
              onClick={() => router.push("/collections")}
              className="w-10 h-10 rounded-full bg-[#F8F6F2] border border-[#e5e7eb] flex items-center justify-center hover:border-[#C5A059] transition-colors"
              aria-label="Back to collections"
            >
              <ChevronLeft className="w-5 h-5 text-[#6b7280]" />
            </button>
            <h1 className="text-lg font-semibold text-[#1a1f36] truncate md:hidden">
              {collection.name_en}
            </h1>
          </div>
          <Breadcrumb
            items={[
              { label: "Collections", href: "/collections" },
              { label: collection.name_en },
            ]}
          />
        </div>
      </header>

      {/* Collection Header */}
      <section className="relative overflow-hidden border-b border-[#e5e7eb]">
        <div className="absolute inset-0 bg-gradient-to-r from-[#C5A059]/5 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl gold-icon-bg flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-8 h-8 md:w-10 md:h-10 text-[#C5A059]" />
            </div>
            <div className="flex-1">
              <h1
                className="text-2xl md:text-3xl font-bold text-[#1a1f36] mb-1 text-balance"
                style={{ fontFamily: "Cinzel, serif" }}
              >
                {collection.name_en}
              </h1>
              <p className="text-lg md:text-xl text-[#C5A059] mb-3 font-arabic" dir="rtl">
                {collection.name_ar}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Compiled by {collection.scholar}
                {collection.scholar_dates && ` (${collection.scholar_dates})`}
              </p>
              <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-[#1a1f36] mb-4">
                <span>{collection.total_hadiths.toLocaleString()} Hadiths</span>
                <span className="text-muted-foreground/50" aria-hidden="true">{"•"}</span>
                <span>{collection.total_books || books.length} Books</span>
                {sahihPercent > 0 && (
                  <>
                    <span className="text-muted-foreground/50" aria-hidden="true">{"•"}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs bg-gradient-to-r from-[#C5A059] to-[#E8C77D] text-[#2c2416]">
                      {sahihPercent}% Sahih
                    </span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border-2 border-[#d4cfc7] text-muted-foreground hover:border-[#C5A059] hover:text-[#C5A059] transition-all"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grade Distribution */}
      {totalGraded > 0 && (
        <section className="border-b border-[#e5e7eb] py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-4 mb-2">
              <span className="text-sm font-medium text-[#1a1f36]">Grade Distribution</span>
            </div>
            <div className="flex h-3 rounded-full overflow-hidden bg-gray-100">
              <div
                className="bg-gradient-to-r from-[#C5A059] to-[#E8C77D] transition-all"
                style={{ width: `${sahihPercent}%` }}
              />
              <div
                className="bg-gradient-to-r from-[#1B5E43] to-[#2D7A5B] transition-all"
                style={{ width: `${hasanPercent}%` }}
              />
              <div className="bg-gray-300 transition-all" style={{ width: `${daifPercent}%` }} />
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>
                Sahih: {sahihPercent}% ({(collection.grade_distribution?.sahih || 0).toLocaleString()})
              </span>
              <span>
                Hasan: {hasanPercent}% ({(collection.grade_distribution?.hasan || 0).toLocaleString()})
              </span>
              <span>
                {"Da'if"}: {daifPercent}% ({(collection.grade_distribution?.daif || 0).toLocaleString()})
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Books List */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8">
        <h2 className="text-lg font-bold text-[#1a1f36] mb-4">
          Books ({collection.total_books || books.length})
        </h2>

        {books.length === 0 ? (
          <EmptyState
            title="No Books Found"
            description="No books have been added to this collection yet."
          />
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
