"use client"

import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, BookOpen, Menu, X } from "lucide-react"
import { useState } from "react"
import { Breadcrumb } from "@/components/collections/breadcrumb"
import { ChapterSidebar } from "@/components/collections/chapter-sidebar"
import { HadithCardCondensed } from "@/components/collections/hadith-card-condensed"
import { EmptyState } from "@/components/collections/empty-state"
import { cn } from "@/lib/utils"

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
}

interface Props {
  collection: { id: string; name_en: string; name_ar: string; slug: string }
  book: { id: string; number: number; name_en: string; name_ar: string; total_hadiths: number; total_chapters: number }
  chapters: Chapter[]
  selectedChapter: Chapter
  hadiths: Hadith[]
  slug: string
  bookNumber: number
}

export function BookReaderShell({
  collection,
  book,
  chapters,
  selectedChapter,
  hadiths,
  slug,
  bookNumber,
}: Props) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const currentIndex = chapters.findIndex((c) => c.id === selectedChapter.id)
  const prevChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null
  const nextChapter = currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null

  const navigateToChapter = (chapterNumber: number) => {
    setSidebarOpen(false)
    router.push(`/collections/${slug}/books/${bookNumber}?chapter=${chapterNumber}`)
  }

  return (
    <div className="min-h-screen marble-bg flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[#e5e7eb] bg-[#F8F6F2]/95 backdrop-blur-sm">
        <div className="max-w-full mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => router.push(`/collections/${slug}`)}
              className="w-9 h-9 rounded-full bg-[#F8F6F2] border border-[#e5e7eb] flex items-center justify-center hover:border-[#C5A059] transition-colors flex-shrink-0"
              aria-label="Back to collection"
            >
              <ChevronLeft className="w-4 h-4 text-[#6b7280]" />
            </button>

            {/* Mobile: chapter sidebar toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden w-9 h-9 rounded-full bg-[#F8F6F2] border border-[#e5e7eb] flex items-center justify-center hover:border-[#C5A059] transition-colors"
              aria-label="Toggle chapter list"
            >
              {sidebarOpen ? (
                <X className="w-4 h-4 text-[#6b7280]" />
              ) : (
                <Menu className="w-4 h-4 text-[#6b7280]" />
              )}
            </button>

            <div className="flex-1 min-w-0">
              <h1 className="text-sm font-semibold text-[#1a1f36] truncate">
                Book {book.number}: {book.name_en}
              </h1>
              <p className="text-xs text-muted-foreground truncate">
                Chapter {selectedChapter.number}: {selectedChapter.name_en}
              </p>
            </div>
          </div>
          <Breadcrumb
            items={[
              { label: "Collections", href: "/collections" },
              { label: collection.name_en, href: `/collections/${slug}` },
              { label: `Book ${book.number}`, href: `/collections/${slug}/books/${bookNumber}` },
              { label: `Ch. ${selectedChapter.number}` },
            ]}
          />
        </div>
      </header>

      {/* Two-pane layout */}
      <div className="flex flex-1 relative">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/30 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Left: Chapter Sidebar */}
        <aside
          className={cn(
            "fixed md:sticky top-[calc(var(--header-h,73px))] md:top-0 left-0 z-30 md:z-auto",
            "w-72 h-[calc(100vh-73px)] md:h-auto md:min-h-[calc(100vh-73px)]",
            "border-r border-[#e5e7eb] bg-[#F8F6F2] flex-shrink-0",
            "transition-transform duration-200 md:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          )}
        >
          <ChapterSidebar
            chapters={chapters}
            selectedChapterId={selectedChapter.id}
            onSelectChapter={navigateToChapter}
          />
        </aside>

        {/* Right: Reader content */}
        <main className="flex-1 min-w-0">
          {/* Chapter header */}
          <div className="border-b border-[#e5e7eb] px-4 sm:px-6 py-5">
            <div className="max-w-3xl mx-auto">
              <span className="text-xs font-bold text-[#1B5E43] uppercase tracking-wider mb-1 block">
                Chapter {selectedChapter.number}
              </span>
              <h2
                className="text-xl md:text-2xl font-bold text-[#1a1f36] mb-1 text-balance"
                style={{ fontFamily: "Cinzel, serif" }}
              >
                {selectedChapter.name_en}
              </h2>
              <p className="text-base text-[#C5A059] font-arabic" dir="rtl">
                {selectedChapter.name_ar}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {hadiths.length} {hadiths.length === 1 ? "hadith" : "hadiths"} in this chapter
              </p>
            </div>
          </div>

          {/* Hadiths list */}
          <div className="px-4 sm:px-6 py-6">
            <div className="max-w-3xl mx-auto">
              {hadiths.length === 0 ? (
                <EmptyState
                  title="No Hadiths Available"
                  description="This chapter does not have any hadiths yet."
                />
              ) : (
                <div className="flex flex-col gap-6">
                  {hadiths.map((hadith, index) => (
                    <HadithCardCondensed
                      key={hadith.id}
                      hadith={hadith}
                      referenceNumber={hadith.hadith_number || index + 1}
                      collectionName={collection.name_en}
                    />
                  ))}
                </div>
              )}

              {/* Chapter navigation */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#e5e7eb]">
                <button
                  onClick={() => prevChapter && navigateToChapter(prevChapter.number)}
                  disabled={!prevChapter}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
                    prevChapter
                      ? "border-2 border-[#C5A059] text-[#C5A059] hover:bg-[#C5A059]/10"
                      : "border-2 border-[#e5e7eb] text-[#e5e7eb] cursor-not-allowed",
                  )}
                  aria-label={prevChapter ? `Go to Chapter ${prevChapter.number}` : "No previous chapter"}
                  title={prevChapter ? `Chapter ${prevChapter.number}: ${prevChapter.name_en}` : "No previous chapter"}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {prevChapter ? `Ch. ${prevChapter.number}` : "Previous"}
                  </span>
                  <span className="sm:hidden">Prev</span>
                </button>

                <span className="text-xs text-muted-foreground">
                  {currentIndex + 1} of {chapters.length}
                </span>

                <button
                  onClick={() => nextChapter && navigateToChapter(nextChapter.number)}
                  disabled={!nextChapter}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
                    nextChapter
                      ? "emerald-button"
                      : "border-2 border-[#e5e7eb] text-[#e5e7eb] cursor-not-allowed",
                  )}
                  aria-label={nextChapter ? `Go to Chapter ${nextChapter.number}` : "No next chapter"}
                  title={nextChapter ? `Chapter ${nextChapter.number}: ${nextChapter.name_en}` : "No next chapter"}
                >
                  <span className="hidden sm:inline">
                    {nextChapter ? `Ch. ${nextChapter.number}` : "Next"}
                  </span>
                  <span className="sm:hidden">Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
