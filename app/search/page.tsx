"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, ChevronLeft, BookOpen } from "lucide-react"
import { BottomNavigation } from "@/components/home/bottom-navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

function SearchContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") || ""
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    const searchHadiths = async () => {
      if (query.length < 2) {
        setResults([])
        return
      }

      setLoading(true)
      const { data } = await supabase
        .from("hadiths")
        .select("*")
        .or(`english_translation.ilike.%${query}%,arabic_text.ilike.%${query}%`)
        .limit(20)

      setResults(data || [])
      setLoading(false)
    }

    const debounce = setTimeout(searchHadiths, 300)
    return () => clearTimeout(debounce)
  }, [query, supabase])

  return (
    <div className="min-h-screen marble-bg pb-20 md:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[#e5e7eb] bg-[#F8F6F2]/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-[#F8F6F2] border border-[#e5e7eb] flex items-center justify-center hover:border-[#C5A059] transition-colors shrink-0"
          >
            <ChevronLeft className="w-5 h-5 text-[#6b7280]" />
          </button>
          <div className="flex-1 flex items-center gap-3 px-4 py-2.5 rounded-full bg-white border-2 border-[#C5A059]">
            <Search className="w-5 h-5 text-[#6b7280]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search hadiths..."
              className="flex-1 bg-transparent outline-none text-[#1a1f36]"
              autoFocus
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              Found {results.length} result{results.length !== 1 ? "s" : ""}
            </p>
            {results.map((hadith) => (
              <button
                key={hadith.id}
                onClick={() => router.push(`/hadith/${hadith.id}`)}
                className="w-full gold-border rounded-xl p-4 premium-card text-left hover:-translate-y-0.5 transition-transform"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 rounded text-xs font-bold text-white bg-gradient-to-r from-[#1B5E43] to-[#2D7A5B]">
                    {hadith.collection}
                  </span>
                  <span className="text-xs text-muted-foreground">{hadith.reference}</span>
                </div>
                <p className="text-sm text-[#1a1f36] line-clamp-2">{hadith.english_translation}</p>
              </button>
            ))}
          </div>
        ) : query.length > 1 ? (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground/40" />
            <p className="text-muted-foreground">No hadiths found for "{query}"</p>
          </div>
        ) : (
          <div className="text-center py-12">
            <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground/40" />
            <p className="text-muted-foreground">Enter a search term to find hadiths</p>
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
