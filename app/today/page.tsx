"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Sun,
  BookOpen,
  Sparkles,
  ChevronRight,
  Bookmark,
  Share2,
  RefreshCw,
} from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { getCleanTranslation, getCollectionDisplayName } from "@/lib/hadith-utils"
import { cn } from "@/lib/utils"

interface Hadith {
  id: string
  arabic_text: string
  english_translation: string
  collection: string
  reference: string
  grade: string
  narrator: string
}

export default function TodayPage() {
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()
  const [hadith, setHadith] = useState<Hadith | null>(null)
  const [isSaved, setIsSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) setUserId(user.id)

        const res = await fetch("/api/daily-hadith")
        const data = await res.json()
        if (data.hadith) {
          setHadith(data.hadith)
          if (user) {
            const { data: saved } = await supabase
              .from("saved_hadiths")
              .select("id")
              .eq("user_id", user.id)
              .eq("hadith_id", data.hadith.id)
              .maybeSingle()
            setIsSaved(!!saved)
          }
        }
      } catch {
        // Failed to load
      }
      setLoading(false)
    }
    load()
  }, [supabase])

  const handleSave = async () => {
    if (!userId || !hadith) return
    if (isSaved) {
      await supabase.from("saved_hadiths").delete().eq("user_id", userId).eq("hadith_id", hadith.id)
    } else {
      await supabase.from("saved_hadiths").insert({ user_id: userId, hadith_id: hadith.id })
    }
    setIsSaved(!isSaved)
  }

  const handleShare = async () => {
    if (!hadith) return
    const text = getCleanTranslation(hadith.english_translation)
    if (navigator.share) {
      await navigator.share({ title: "Hadith of the Day", text, url: `${window.location.origin}/hadith/${hadith.id}` })
    } else {
      await navigator.clipboard.writeText(text)
    }
  }

  const todayDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  if (loading) {
    return (
      <div className="min-h-screen marble-bg flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen marble-bg pb-20 md:pb-0">
      {/* Header */}
      <header className="border-b border-[#e5e7eb] bg-[#F8F6F2]/95 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center gap-3 mb-1">
            <Sun className="w-6 h-6 text-[#C5A059]" />
            <h1 className="text-xl font-bold text-[#1a1f36]">Today</h1>
          </div>
          <p className="text-sm text-muted-foreground">{todayDate}</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
        {/* Hadith of the Day */}
        {hadith && (
          <section className="premium-card rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-[#C5A059]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#C5A059]">Hadith of the Day</span>
            </div>

            {/* Arabic */}
            <p className="text-lg leading-loose text-[#1a1f36] font-serif text-right mb-4" dir="rtl">
              {hadith.arabic_text}
            </p>

            {/* English */}
            <p className="text-sm leading-relaxed text-[#374151] mb-4">
              {getCleanTranslation(hadith.english_translation)}
            </p>

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                hadith.grade === "sahih" ? "bg-[#1B5E43]/10 text-[#1B5E43]" :
                hadith.grade === "hasan" ? "bg-[#C5A059]/10 text-[#C5A059]" :
                "bg-red-50 text-red-600"
              )}>
                {hadith.grade}
              </span>
              <span className="text-xs text-muted-foreground">
                {getCollectionDisplayName(hadith.collection)} - {hadith.reference}
              </span>
            </div>
            {hadith.narrator && (
              <p className="text-xs text-muted-foreground italic mb-4">
                Narrated by {hadith.narrator}
              </p>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 pt-3 border-t border-[#e5e7eb]">
              <button
                onClick={handleSave}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                  isSaved ? "bg-[#C5A059]/10 text-[#C5A059]" : "bg-[#f3f4f6] text-[#6b7280] hover:bg-[#e5e7eb]"
                )}
              >
                <Bookmark className={cn("w-4 h-4", isSaved && "fill-current")} />
                {isSaved ? "Saved" : "Save"}
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-[#f3f4f6] text-[#6b7280] hover:bg-[#e5e7eb] transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <button
                onClick={() => router.push(`/hadith/${hadith.id}`)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-[#f3f4f6] text-[#6b7280] hover:bg-[#e5e7eb] transition-colors ml-auto"
              >
                Read more
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </section>
        )}

        {/* Reflection Prompt */}
        <section className="premium-card rounded-xl p-5">
          <h2 className="text-sm font-bold text-[#1a1f36] mb-2">Reflection</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            How does today's hadith relate to a challenge you are currently facing? Take a moment to reflect.
          </p>
          <button
            onClick={() => router.push("/reflections")}
            className="text-xs font-medium text-[#C5A059] hover:text-[#8A6E3A] transition-colors flex items-center gap-1"
          >
            Write a reflection
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </section>

        {/* Small Action */}
        <section className="premium-card rounded-xl p-5">
          <h2 className="text-sm font-bold text-[#1a1f36] mb-2">Today's Small Action</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Smile at someone today. The Prophet (peace be upon him) said: "Your smiling in the face of your brother is charity."
          </p>
          <p className="text-[10px] text-muted-foreground/60 mt-2 italic">Jami at-Tirmidhi 1956</p>
        </section>

        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => router.push("/sunnah")}
            className="premium-card rounded-xl p-4 text-left hover:shadow-md transition-shadow"
          >
            <BookOpen className="w-5 h-5 text-[#1B5E43] mb-2" />
            <p className="text-sm font-semibold text-[#1a1f36]">Daily Sunnah</p>
            <p className="text-xs text-muted-foreground mt-0.5">Lived practice</p>
          </button>
          <button
            onClick={() => router.push("/stories")}
            className="premium-card rounded-xl p-4 text-left hover:shadow-md transition-shadow"
          >
            <RefreshCw className="w-5 h-5 text-[#C5A059] mb-2" />
            <p className="text-sm font-semibold text-[#1a1f36]">Stories</p>
            <p className="text-xs text-muted-foreground mt-0.5">The Companions</p>
          </button>
        </div>
      </main>
    </div>
  )
}
