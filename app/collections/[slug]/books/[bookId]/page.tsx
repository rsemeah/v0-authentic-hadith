"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { ChevronLeft, ChevronRight, BookOpen, Search, X, List } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { HadithCardCondensed } from "@/components/collections/hadith-card-condensed"
import { Breadcrumb } from "@/components/collections/breadcrumb"

interface Chapter {
  id: string
  number: number
  name_en: string
  name_ar: string
  total_hadiths: number
}

interface Hadith {
  id: string
  arabic_text: string
  english_translation: string
  grade: "sahih" | "hasan" | "daif"
  narrator: string
  hadith_number: number
  reference: string
}

export default function BookReaderPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const slug = params.slug as string
  const bookNumber = params.bookId as string
  const chapterParam = searchParams.get("chapter")
  const supabase = getSupabaseBrowserClient()

  const [collectionName, setCollectionName] = useState("")
  const [bookName, setBookName] = useState("")
  const [bookId, setBookId] = useState("")
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null)
  const [hadiths, setHadiths] = useState<Hadith[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingHadiths, setLoadingHadiths] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [chapterSearch, setChapterSearch] = useState("")

  // Fetch book and chapters on mount
  useEffect(() => {
    const fetchBookData = async () => {
      // Get collection
      const { data: coll } = await supabase
        .from("collections")
        .select("id, name_en")
        .eq("slug", slug)
        .single()

      if (!coll) { setLoading(false); return }
      setCollectionName(coll.name_en)

      // Get book by number
      const { data: book } = await supabase
        .from("books")
        .select("*")
        .eq("collection_id", coll.id)
        .eq("number", parseInt(bookNumber, 10))
        .single()

      if (!book) { setLoading(false); return }
      setBookName(book.name_en)
      setBookId(book.id)

      // Get chapters
      const { data: chaps } = await supabase
        .from("chapters")
        .select("*")
        .eq("book_id", book.id)
        .order("number", { ascending: true })

      console.log("[v0] book reader:", { coll: coll.name_en, book: book.name_en, chapters: chaps?.length })

      if (chaps && chaps.length > 0) {
        setChapters(chaps)
        const targetNum = chapterParam ? parseInt(chapterParam, 10) : chaps[0].number
        const target = chaps.find((c) => c.number === targetNum) ?? chaps[0]
        setSelectedChapter(target)
      }

      setLoading(false)
    }

    fetchBookData()
  }, [supabase, slug, bookNumber, chapterParam])

  // Fetch hadiths when chapter changes
  useEffect(() => {
    if (!selectedChapter || !bookId) return

    const fetchHadiths = async () => {
      setLoadingHadiths(true)

      // Get hadith IDs linked to this chapter
      const { data: links } = await supabase
        .from("collection_hadiths")
        .select("hadith_id, hadith_number")
        .eq("chapter_id", selectedChapter.id)
        .order("hadith_number", { ascending: true })

      if (!links || links.length === 0) {
        setHadiths([])
        setLoadingHadiths(false)
        return
      }

      const hadithIds = links.map((l) => l.hadith_id)
      const { data: hadithsData } = await supabase
        .from("hadiths")
        .select("*")
        .in("id", hadithIds)

      if (hadithsData) {
        const merged = links
          .map((link) => {
            const h = hadithsData.find((hd: any) => hd.id === link.hadith_id)
            return h ? { ...h, hadith_number: link.hadith_number } : null
          })
          .filter(Boolean) as Hadith[]
        setHadiths(merged)
      }

      setLoadingHadiths(false)
    }

    fetchHadiths()
  }, [supabase, selectedChapter, bookId])

  const handleChapterSelect = (chapter: Chapter) => {
    setSelectedChapter(chapter)
    setSidebarOpen(false)
    router.replace(`/collections/${slug}/books/${bookNumber}?chapter=${chapter.number}`, { scroll: false })
  }

  const currentIndex = chapters.findIndex((c) => c.id === selectedChapter?.id)
  const prevChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null
  const nextChapter = currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null

  const filteredChapters = chapters.filter((c) =>
    c.name_en.toLowerCase().includes(chapterSearch.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen marble-bg flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!bookName) {
    return (
      <div className="min-h-screen marble-bg flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground/40" />
          <p className="text-muted-foreground mb-4">Book not found</p>
          <button onClick={() => router.push(`/collections/${slug}`)} className="px-4 py-2 rounded-lg emerald-button text-sm">
            Back to Collection
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen marble-bg pb-20 md:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[#e5e7eb] bg-[#F8F6F2]/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <button
            onClick={() => router.push(`/collections/${slug}`)}
            className="w-10 h-10 rounded-full bg-[#F8F6F2] border border-[#e5e7eb] flex items-center justify-center hover:border-[#C5A059] transition-colors"
            aria-label="Back to collection"
          >
            <ChevronLeft className="w-5 h-5 text-[#6b7280]" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-semibold text-[#1a1f36] truncate">{bookName}</h1>
            <p className="text-xs text-muted-foreground truncate">{collectionName}</p>
          </div>
          {chapters.length > 0 && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden w-10 h-10 rounded-full bg-[#F8F6F2] border border-[#e5e7eb] flex items-center justify-center hover:border-[#C5A059] transition-colors"
              aria-label="Open chapter list"
            >
              <List className="w-5 h-5 text-[#6b7280]" />
            </button>
          )}
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-2">
          <Breadcrumb
            items={[
              { label: "Collections", href: "/collections" },
              { label: collectionName, href: `/collections/${slug}` },
              { label: `Book ${bookNumber}` },
            ]}
          />
        </div>
      </header>

      {chapters.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground/40" />
          <p className="text-muted-foreground">No chapters available for this book yet</p>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto flex">
          {/* Chapter Sidebar - Desktop */}
          <aside className="hidden md:block w-72 border-r border-[#e5e7eb] sticky top-[73px] h-[calc(100vh-73px)] overflow-y-auto bg-[#F8F6F2]">
            <div className="p-4">
              <div className="relative mb-3">
                <input
                  type="text"
                  placeholder="Search chapters..."
                  value={chapterSearch}
                  onChange={(e) => setChapterSearch(e.target.value)}
                  className="w-full px-3 py-2 pl-9 rounded-lg border border-[#d4cfc7] bg-white text-sm focus:border-[#C5A059] outline-none"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                {filteredChapters.map((ch) => (
                  <button
                    key={ch.id}
                    onClick={() => handleChapterSelect(ch)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                      selectedChapter?.id === ch.id
                        ? "bg-[#C5A059]/10 text-[#C5A059] font-semibold border border-[#C5A059]/30"
                        : "text-[#4a5568] hover:bg-[#e5e7eb]/50"
                    }`}
                  >
                    <span className="text-xs text-muted-foreground">Ch. {ch.number}</span>
                    <p className="truncate">{ch.name_en}</p>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Mobile Sidebar Overlay */}
          {sidebarOpen && (
            <div className="md:hidden fixed inset-0 z-50">
              <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
              <aside className="absolute left-0 top-0 bottom-0 w-80 bg-[#F8F6F2] shadow-2xl overflow-y-auto">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-[#1a1f36]">Chapters</h3>
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className="w-8 h-8 rounded-full bg-[#e5e7eb] flex items-center justify-center"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="relative mb-3">
                    <input
                      type="text"
                      placeholder="Search chapters..."
                      value={chapterSearch}
                      onChange={(e) => setChapterSearch(e.target.value)}
                      className="w-full px-3 py-2 pl-9 rounded-lg border border-[#d4cfc7] bg-white text-sm focus:border-[#C5A059] outline-none"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    {filteredChapters.map((ch) => (
                      <button
                        key={ch.id}
                        onClick={() => handleChapterSelect(ch)}
                        className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                          selectedChapter?.id === ch.id
                            ? "bg-[#C5A059]/10 text-[#C5A059] font-semibold border border-[#C5A059]/30"
                            : "text-[#4a5568] hover:bg-[#e5e7eb]/50"
                        }`}
                      >
                        <span className="text-xs text-muted-foreground">Ch. {ch.number}</span>
                        <p className="truncate">{ch.name_en}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          )}

          {/* Main Content */}
          <main className="flex-1 px-4 sm:px-6 py-6">
            {selectedChapter && (
              <>
                <div className="mb-6">
                  <span className="text-xs font-bold text-[#1B5E43] uppercase tracking-wider">
                    Chapter {selectedChapter.number}
                  </span>
                  <h2 className="text-xl font-bold text-[#1a1f36] mt-1">{selectedChapter.name_en}</h2>
                  <p className="text-base text-[#C5A059] font-arabic mt-1" dir="rtl">{selectedChapter.name_ar}</p>
                </div>

                {loadingHadiths ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-6 h-6 border-3 border-[#C5A059] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : hadiths.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">No hadiths in this chapter yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {hadiths.map((hadith, i) => (
                      <HadithCardCondensed
                        key={hadith.id}
                        hadith={hadith}
                        referenceNumber={i + 1}
                        collectionName={collectionName}
                      />
                    ))}
                  </div>
                )}

                {/* Prev / Next Chapter Navigation */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#e5e7eb]">
                  <button
                    onClick={() => prevChapter && handleChapterSelect(prevChapter)}
                    disabled={!prevChapter}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      prevChapter
                        ? "border border-[#d4cfc7] text-[#1a1f36] hover:border-[#C5A059]"
                        : "border border-[#e5e7eb] text-[#d4cfc7] cursor-not-allowed"
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                  <span className="text-xs text-muted-foreground">
                    {currentIndex + 1} / {chapters.length}
                  </span>
                  <button
                    onClick={() => nextChapter && handleChapterSelect(nextChapter)}
                    disabled={!nextChapter}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      nextChapter
                        ? "border border-[#d4cfc7] text-[#1a1f36] hover:border-[#C5A059]"
                        : "border border-[#e5e7eb] text-[#d4cfc7] cursor-not-allowed"
                    }`}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </main>
        </div>
      )}
    </div>
  )
}
