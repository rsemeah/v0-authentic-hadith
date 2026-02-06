"use client"

import { useState, useRef, useEffect } from "react"
import { Search, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

interface Chapter {
  id: string
  number: number
  name_en: string
  name_ar: string
  total_hadiths: number
}

interface Props {
  chapters: Chapter[]
  selectedChapterId: string
  onSelectChapter: (chapterNumber: number) => void
}

export function ChapterSidebar({ chapters, selectedChapterId, onSelectChapter }: Props) {
  const [search, setSearch] = useState("")
  const activeRef = useRef<HTMLButtonElement>(null)

  const filtered = search.trim()
    ? chapters.filter(
        (c) =>
          c.name_en.toLowerCase().includes(search.toLowerCase()) ||
          c.number.toString().includes(search)
      )
    : chapters

  // Scroll the active chapter into view on mount
  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ block: "center", behavior: "smooth" })
    }
  }, [selectedChapterId])

  return (
    <div className="flex flex-col h-full">
      {/* Sidebar header */}
      <div className="p-4 border-b border-[#e5e7eb]">
        <h3 className="text-sm font-semibold text-[#1a1f36] mb-3">
          Chapters ({chapters.length})
        </h3>
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search chapters..."
            className="w-full px-3 py-2 pl-9 rounded-lg border border-[#d4cfc7] bg-[#fffefb] text-sm focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20 outline-none transition-all"
            aria-label="Search chapters"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        </div>
      </div>

      {/* Chapter list */}
      <nav
        className="flex-1 overflow-y-auto p-2"
        role="listbox"
        aria-label="Chapter list"
      >
        {filtered.length === 0 ? (
          <div className="px-3 py-6 text-center">
            <p className="text-xs text-muted-foreground">No chapters match your search</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {filtered.map((chapter) => {
              const isActive = chapter.id === selectedChapterId
              return (
                <button
                  key={chapter.id}
                  ref={isActive ? activeRef : undefined}
                  onClick={() => onSelectChapter(chapter.number)}
                  role="option"
                  aria-selected={isActive}
                  className={cn(
                    "flex items-start gap-3 px-3 py-3 rounded-lg text-left transition-all w-full",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A059]",
                    isActive
                      ? "bg-gradient-to-r from-[#C5A059]/15 to-[#E8C77D]/10 border border-[#C5A059]/30"
                      : "hover:bg-[#ebe7e0]/60 border border-transparent",
                  )}
                >
                  <span
                    className={cn(
                      "flex items-center justify-center w-7 h-7 rounded-md text-xs font-bold flex-shrink-0 mt-0.5",
                      isActive
                        ? "bg-gradient-to-r from-[#C5A059] to-[#E8C77D] text-[#2c2416]"
                        : "bg-[#ebe7e0] text-[#6b5d4d]",
                    )}
                  >
                    {chapter.number}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-sm font-medium leading-tight truncate",
                        isActive ? "text-[#1a1f36]" : "text-[#4a5568]",
                      )}
                    >
                      {chapter.name_en}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {chapter.total_hadiths} hadiths
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </nav>
    </div>
  )
}
