"use client"

import { useState } from "react"
import { Volume2, Bookmark, Share2, ChevronRight, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"

interface Hadith {
  id: string
  arabic_text: string
  english_translation: string
  collection: string
  reference: string
  grade: "sahih" | "hasan" | "daif"
  narrator: string
  is_saved?: boolean
}

interface DailyHadithCardProps {
  hadith: Hadith
  onSave?: (id: string) => void
  onShare?: (id: string) => void
  onPlayAudio?: (id: string) => void
}

export function DailyHadithCard({ hadith, onSave, onShare, onPlayAudio }: DailyHadithCardProps) {
  const [isSaved, setIsSaved] = useState(hadith.is_saved || false)
  const [isPlaying, setIsPlaying] = useState(false)

  const gradeColors = {
    sahih: "from-[#10b981] to-[#34d399]",
    hasan: "from-[#3b82f6] to-[#60a5fa]",
    daif: "from-[#6b7280] to-[#9ca3af]",
  }

  const gradeLabels = {
    sahih: "Sahih",
    hasan: "Hasan",
    daif: "Da'if",
  }

  const handleSave = () => {
    setIsSaved(!isSaved)
    onSave?.(hadith.id)
  }

  const handlePlayAudio = () => {
    setIsPlaying(!isPlaying)
    onPlayAudio?.(hadith.id)
  }

  return (
    <div className="gold-border rounded-2xl p-6 sm:p-10 premium-card relative overflow-hidden">
      {/* Badges */}
      <div className="flex items-center justify-between mb-6">
        <span className="px-3 py-1.5 rounded-md text-xs font-bold text-white bg-gradient-to-r from-[#1B5E43] to-[#2D7A5B]">
          {hadith.collection}
        </span>
        <span
          className={cn(
            "px-3 py-1.5 rounded-md text-xs font-bold text-white bg-gradient-to-r",
            gradeColors[hadith.grade],
          )}
        >
          {gradeLabels[hadith.grade]}
        </span>
      </div>

      {/* Arabic Text */}
      <div className="mb-6" dir="rtl" lang="ar">
        <p
          className="text-2xl sm:text-3xl leading-[1.8] text-[#1a1f36] font-serif text-right"
          style={{ fontFamily: "Amiri, serif" }}
        >
          {hadith.arabic_text}
        </p>
      </div>

      {/* English Translation */}
      <div className="mb-6" dir="ltr" lang="en">
        <p className="text-base sm:text-lg leading-relaxed text-[#4a5568]">{hadith.english_translation}</p>
      </div>

      {/* Metadata */}
      <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
        <BookOpen className="w-4 h-4" />
        <span>{hadith.reference}</span>
        <span className="mx-2">•</span>
        <span>Narrated by {hadith.narrator}</span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={handlePlayAudio}
            className={cn(
              "w-11 h-11 rounded-lg flex items-center justify-center transition-all",
              isPlaying
                ? "bg-gradient-to-r from-[#C5A059] to-[#E8C77D] text-white"
                : "bg-[#fafaf9] border border-[#e5e7eb] text-[#1a1f36] hover:bg-[#C5A059] hover:text-white hover:border-transparent",
            )}
            aria-label={isPlaying ? "Pause audio recitation" : "Play audio recitation"}
          >
            <Volume2 className="w-5 h-5" />
          </button>
          <button
            onClick={handleSave}
            className={cn(
              "w-11 h-11 rounded-lg flex items-center justify-center transition-all",
              isSaved
                ? "bg-gradient-to-r from-[#C5A059] to-[#E8C77D] text-white"
                : "bg-[#fafaf9] border border-[#e5e7eb] text-[#1a1f36] hover:bg-[#C5A059] hover:text-white hover:border-transparent",
            )}
            aria-label={isSaved ? "Remove from saved" : "Save this hadith"}
          >
            <Bookmark className={cn("w-5 h-5", isSaved && "fill-current")} />
          </button>
          <button
            onClick={() => onShare?.(hadith.id)}
            className="w-11 h-11 rounded-lg flex items-center justify-center bg-[#fafaf9] border border-[#e5e7eb] text-[#1a1f36] hover:bg-[#C5A059] hover:text-white hover:border-transparent transition-all"
            aria-label="Share this hadith"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        <a
          href={`/hadith/${hadith.id}`}
          className="inline-flex items-center gap-1 text-[#C5A059] font-medium hover:underline transition-all group"
        >
          Read full hadith
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </a>
      </div>
    </div>
  )
}
