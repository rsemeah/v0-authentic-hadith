"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, ChevronLeft, BookOpen } from "lucide-react"
import { BottomNavigation } from "@/components/home/bottom-navigation"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const suggestedTerms = ["intentions", "faith", "Muslim", "Quran", "believes", "modesty", "Paradise", "prayer"]

function SearchContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") || ""
  const [query, setQuery] = useState(initialQuery)
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery)

  // Debounce the query
  const debounceTimer = useState<ReturnType<typeof setTimeout> | null>(null)
  const handleQueryChange = (value: string) => {
    setQuery(value)
    if (debounceTimer[0]) clearTimeout(debounceTimer[0])
    debounceTimer[1](
      setTimeout(() => {
        setDebouncedQuery(value)
      }, 300),
    )
  }

  const { data, isLoading } = useSWR(
    debouncedQuery.length >= 2 ? `/api/search?q=${encodeURIComponent(debouncedQuery)}` : null,
    fetcher,
  )

  const results = data?.results || []

  return (
    <div className="min-h-screen marble-bg pb-20 md:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[#e5e7eb] bg-[#F8F6F2]/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-[#F8F6F2] border border-[#e5e7eb] flex items-center justify-center hover:border-[#C5A059] transition-colors shrink-0"
            aria-label="Go back"
          >
            <ChevronLeft className="w-5 h-5 text-[#6b7280]" />
          </button>
          <div className="flex-1 flex items-center gap-3 px-4 py-2.5 rounded-full bg-white border-2 border-[#C5A059]">
            <Search className="w-5 h-5 text-[#6b7280]" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Search hadiths..."
              className="flex-1 bg-transparent outline-none text-[#1a1f36]"
              autoFocus
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-4">
            <p className="text-sm text-[#6b7280] mb-4">
              Found {results.length} result{results.length !== 1 ? "s" : ""}
            </p>
            {results.map((hadith: any) => (
              <button
                key={hadith.id}
                onClick={() => router.push(`/hadith/${hadith.id}`)}
                className="w-full gold-border rounded-xl p-4 premium-card text-left hover:-translate-y-0.5 transition-transform"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 rounded text-xs font-bold text-white bg-gradient-to-r from-[#1B5E43] to-[#2D7A5B]">
                    {hadith.collection}
                  </span>
                  <span className="text-xs text-[#6b7280]">
                    Book {hadith.book_number} / Hadith {hadith.hadith_number}
                  </span>
                  {hadith.grade && (
                    <span className="ml-auto px-2 py-0.5 rounded text-xs font-medium bg-[#C5A059]/10 text-[#C5A059]">
                      {hadith.grade}
                    </span>
                  )}
                </div>
                {hadith.narrator && (
                  <p className="text-xs text-[#6b7280] mb-1">Narrated by: {hadith.narrator}</p>
                )}
                <p className="text-sm text-[#1a1f36] line-clamp-2">{hadith.english_translation}</p>
              </button>
            ))}
          </div>
        ) : debouncedQuery.length > 1 ? (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-[#d1d5db]" />
            <p className="text-[#6b7280] mb-4">No hadiths found for &ldquo;{debouncedQuery}&rdquo;</p>
            <p className="text-sm text-[#9ca3af]">Try searching for: {suggestedTerms.join(", ")}</p>
          </div>
        ) : (
          <div className="text-center py-12">
            <Search className="w-12 h-12 mx-auto mb-4 text-[#d1d5db]" />
            <p className="text-[#6b7280] mb-6">Enter a search term to find hadiths</p>
            <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
              {suggestedTerms.map((term) => (
                <button
                  key={term}
                  onClick={() => handleQueryChange(term)}
                  className="px-3 py-1.5 rounded-full text-sm border border-[#C5A059] text-[#C5A059] hover:bg-[#C5A059] hover:text-white transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen marble-bg flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  )
}
