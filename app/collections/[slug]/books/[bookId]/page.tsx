"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { ChevronLeft, BookOpen } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { BottomNavigation } from "@/components/home/bottom-navigation"
import { Breadcrumb } from "@/components/collections/breadcrumb"
import { ChapterCard } from "@/components/collections/chapter-card"

interface Book {
  id: string
  number: number
  name_en: string
  name_ar: string
  total_hadiths: number
  total_chapters: number
  collection_id: string
}

interface Collection {
  name_en: string
  slug: string
}

interface Chapter {
  id: string
  number: number
  name_en: string
  name_ar: string
  total_hadiths: number
  excerpt?: string
}

export default function BookDetailPage() {
  const router = useRouter()
  const params = useParams()
  const supabase = getSupabaseBrowserClient()
  const slug = params.slug as string
  const bookId = params.bookId as string

  const [book, setBook] = useState<Book | null>(null)
  const [collection, setCollection] = useState<Collection | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBook = async () => {
      // Fetch book details
      const { data: bookData } = await supabase.from("books").select("*").eq("id", bookId).single()

      if (bookData) {
        setBook(bookData)

        // Fetch collection
        const { data: collectionData } = await supabase
          .from("collections")
          .select("name_en, slug")
          .eq("id", bookData.collection_id)
          .single()

        if (collectionData) setCollection(collectionData)

        // Fetch chapters
        const { data: chaptersData } = await supabase
          .from("chapters")
          .select("*")
          .eq("book_id", bookId)
          .order("sort_order", { ascending: true })

        if (chaptersData) {
          // Get excerpt from first hadith of each chapter
          const chaptersWithExcerpts = await Promise.all(
            chaptersData.map(async (chapter) => {
              const { data: hadithData } = await supabase
                .from("collection_hadiths")
                .select("hadith_id")
                .eq("chapter_id", chapter.id)
                .order("hadith_number", { ascending: true })
                .limit(1)
                .single()

              let excerpt = null
              if (hadithData) {
                const { data: hadith } = await supabase
                  .from("hadiths")
                  .select("english_translation")
                  .eq("id", hadithData.hadith_id)
                  .single()

                excerpt = hadith?.english_translation?.substring(0, 80)
              }

              return { ...chapter, excerpt }
            }),
          )

          setChapters(chaptersWithExcerpts)
        }
      }

      setLoading(false)
    }

    fetchBook()
  }, [supabase, bookId])

  if (loading) {
    return (
      <div className="min-h-screen marble-bg flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!book || !collection) {
    return (
      <div className="min-h-screen marble-bg flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground/40" />
          <p className="text-muted-foreground">Book not found</p>
          <button onClick={() => router.push("/collections")} className="mt-4 px-4 py-2 rounded-lg gold-button">
            Browse Collections
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen marble-bg pb-20 md:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[#e5e7eb] bg-[#F8F6F2]/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4 mb-2">
            <button
              onClick={() => router.push(`/collections/${slug}`)}
              className="w-10 h-10 rounded-full bg-[#F8F6F2] border border-[#e5e7eb] flex items-center justify-center hover:border-[#C5A059] transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-[#6b7280]" />
            </button>
            <div className="flex items-center gap-3 md:hidden">
              <h1 className="text-lg font-semibold text-[#1a1f36] truncate">Book {book.number}</h1>
            </div>
          </div>
          <Breadcrumb
            items={[
              { label: "Collections", href: "/collections" },
              { label: collection.name_en, href: `/collections/${slug}` },
              { label: `Book ${book.number}` },
            ]}
          />
        </div>
      </header>

      {/* Book Header */}
      <section className="border-b border-[#e5e7eb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8">
          <span className="text-sm font-bold text-[#C5A059] uppercase tracking-wider mb-2 block">
            Book {book.number}
          </span>
          <h1 className="text-2xl md:text-3xl font-bold text-[#1a1f36] mb-2" style={{ fontFamily: "Cinzel, serif" }}>
            {book.name_en}
          </h1>
          <p className="text-lg text-[#C5A059] mb-4 font-arabic" dir="rtl">
            {book.name_ar}
          </p>
          <p className="text-sm text-muted-foreground">
            {book.total_hadiths} Hadiths • {book.total_chapters || chapters.length} Chapters
          </p>
        </div>
      </section>

      {/* Chapters List */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8">
        <h2 className="text-lg font-bold text-[#1a1f36] mb-4">Chapters</h2>

        {chapters.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground/40" />
            <p className="text-muted-foreground">No chapters available yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {chapters.map((chapter) => (
              <ChapterCard key={chapter.id} chapter={chapter} collectionSlug={slug} bookId={bookId} />
            ))}
          </div>
        )}
      </section>

      <BottomNavigation />
    </div>
  )
}
