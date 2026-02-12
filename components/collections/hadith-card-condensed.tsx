"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Bookmark, Share2, ChevronRight, Hash } from "lucide-react"
import { cn } from "@/lib/utils"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { getCleanTranslation, getCollectionDisplayName } from "@/lib/hadith-utils"

interface HadithCardCondensedProps {
  hadith: {
    id: string
    text_ar?: string
    arabic_text?: string
    text_en?: string
    english_translation?: string
    grade: "sahih" | "hasan" | "daif"
    narrator?: string
    narrator_primary?: string
    hadith_number?: number
    reference?: string
    summary_line?: string
    category?: { slug: string; name_en: string } | null
    tags?: Array<{ slug: string; name_en: string }>
  }
  referenceNumber: number
  collectionName: string
  isSaved?: boolean
  onSaveToggle?: (hadithId: string, saved: boolean) => void
}

export function HadithCardCondensed({
  hadith,
  referenceNumber,
  collectionName,
  isSaved = false,
  onSaveToggle,
}: HadithCardCondensedProps) {
  const router = useRouter()
  const [saved, setSaved] = useState(isSaved)
  const [saving, setSaving] = useState(false)
  const supabase = getSupabaseBrowserClient()

  const arabicText = hadith.text_ar || hadith.arabic_text || ""
  const englishText = getCleanTranslation(hadith.text_en || hadith.english_translation || "")
  const narrator = hadith.narrator || hadith.narrator_primary || "Unknown narrator"

  const gradeColors = {
    sahih: "from-[#C5A059] to-[#E8C77D]",
    hasan: "from-[#1B5E43] to-[#2D7A5B]",
    daif: "from-[#6b7280] to-[#9ca3af]",
  }

  const gradeLabels = {
    sahih: "Sahih",
    hasan: "Hasan",
    daif: "Da'if",
  }

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setSaving(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/")
        return
      }

      if (saved) {
        await supabase.from("saved_hadiths").delete().eq("user_id", user.id).eq("hadith_id", hadith.id)
      } else {
        await supabase.from("saved_hadiths").insert({ user_id: user.id, hadith_id: hadith.id })
      }

      setSaved(!saved)
      onSaveToggle?.(hadith.id, !saved)
    } catch (error) {
      console.error("Failed to save hadith:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const url = `${window.location.origin}/hadith/${hadith.id}`

    if (navigator.share) {
      await navigator.share({
        title: `${collectionName} - Hadith #${referenceNumber}`,
        text: englishText.substring(0, 200) + "...",
        url,
      })
    } else {
      await navigator.clipboard.writeText(url)
      alert("Link copied to clipboard!")
    }
  }

  return (
    <div className="relative rounded-xl premium-card overflow-hidden border-l-4 border-l-[#C5A059]">
      <div className="p-5 md:p-6">
        {/* Summary Line */}
        {hadith.summary_line && (
          <p className="text-sm font-semibold text-[#C5A059] mb-3 leading-snug">{hadith.summary_line}</p>
        )}

        {/* Header */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-sm font-semibold text-foreground">Hadith #{referenceNumber}</span>
          <span className="text-xs text-muted-foreground">
            ({collectionName} {hadith.hadith_number || referenceNumber})
          </span>
          <span
            className={cn(
              "ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-gradient-to-r",
              gradeColors[hadith.grade],
            )}
          >
            {gradeLabels[hadith.grade]}
          </span>
        </div>

        {/* Narrator */}
        <p className="text-xs text-muted-foreground italic mb-4">Narrated by: {narrator}</p>

        {/* Arabic Text */}
        <div className="mb-4" dir="rtl" lang="ar">
          <p
            className="text-lg md:text-xl leading-[2] text-foreground line-clamp-3"
            style={{ fontFamily: "Amiri, serif" }}
          >
            {arabicText}
          </p>
        </div>

        {/* English Translation */}
        <div className="mb-4" dir="ltr" lang="en">
          <p className="text-sm md:text-base text-muted-foreground line-clamp-4 leading-relaxed">{englishText}</p>
        </div>

        {/* Category Badge */}
        {hadith.category && (
          <div className="mb-4">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#1B5E43]/10 text-[#1B5E43] text-[11px] font-medium">
              <Hash className="w-3 h-3" />
              {hadith.category.name_en}
            </span>
          </div>
        )}

        {/* Enrichment Tags */}
        {hadith.tags && hadith.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {hadith.tags.map((tag) => (
              <span
                key={tag.slug}
                className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#C5A059]/10 text-[#8A6E3A] text-[11px] font-medium whitespace-nowrap"
              >
                <Hash className="w-2.5 h-2.5 shrink-0" />
                {tag.name_en}
              </span>
            ))}
          </div>
        )}

        {/* Action Bar */}
        <div className="flex items-center gap-2 pt-4 border-t border-border">
          <button
            onClick={handleSave}
            disabled={saving}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all",
              saved
                ? "bg-gradient-to-r from-[#C5A059] to-[#E8C77D] text-white"
                : "border border-border text-muted-foreground hover:border-[#C5A059] hover:text-[#C5A059]",
            )}
          >
            <Bookmark className={cn("w-4 h-4", saved && "fill-current")} />
            {saved ? "Saved" : "Save"}
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:border-[#C5A059] hover:text-[#C5A059] transition-all"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>

          <button
            onClick={() => router.push(`/hadith/${hadith.id}`)}
            className="ml-auto flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-semibold emerald-button"
          >
            Read Full Hadith
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
