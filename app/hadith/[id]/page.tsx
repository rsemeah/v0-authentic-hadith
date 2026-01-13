"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { ChevronLeft, Bookmark, Share2, BookOpen } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { BottomNavigation } from "@/components/home/bottom-navigation"
import { cn } from "@/lib/utils"

interface Hadith {
  id: string
  arabic_text: string
  english_translation: string
  collection: string
  book_number: number
  hadith_number: number
  reference: string
  grade: "sahih" | "hasan" | "daif"
  narrator: string
}

export default function HadithDetailPage() {
  const router = useRouter()
  const params = useParams()
  const supabase = getSupabaseBrowserClient()
  const [hadith, setHadith] = useState<Hadith | null>(null)
  const [isSaved, setIsSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHadith = async () => {
      const { data } = await supabase.from("hadiths").select("*").eq("id", params.id).single()

      if (data) {
        setHadith(data)

        // Check if saved
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user) {
          const { data: savedData } = await supabase
            .from("saved_hadiths")
            .select("id")
            .eq("user_id", user.id)
            .eq("hadith_id", data.id)
            .single()

          setIsSaved(!!savedData)

          // Track view
          await supabase
            .from("hadith_views")
            .upsert(
              { user_id: user.id, hadith_id: data.id, viewed_at: new Date().toISOString() },
              { onConflict: "user_id,hadith_id" },
            )
        }
      }
      setLoading(false)
    }

    fetchHadith()
  }, [supabase, params.id])

  const handleSave = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user || !hadith) return

    if (isSaved) {
      await supabase.from("saved_hadiths").delete().eq("user_id", user.id).eq("hadith_id", hadith.id)
    } else {
      await supabase.from("saved_hadiths").insert({
        user_id: user.id,
        hadith_id: hadith.id,
      })
    }
    setIsSaved(!isSaved)
  }

  const handleShare = async () => {
    if (!hadith) return
    if (navigator.share) {
      await navigator.share({
        title: "Authentic Hadith",
        text: hadith.english_translation,
        url: window.location.href,
      })
    } else {
      await navigator.clipboard.writeText(window.location.href)
      alert("Link copied to clipboard!")
    }
  }

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

  if (loading) {
    return (
      <div className="min-h-screen marble-bg flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!hadith) {
    return (
      <div className="min-h-screen marble-bg flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground/40" />
          <p className="text-muted-foreground">Hadith not found</p>
          <button onClick={() => router.push("/home")} className="mt-4 px-4 py-2 rounded-lg gold-button">
            Go Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen marble-bg pb-20 md:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[#e5e7eb] bg-[#F8F6F2]/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 rounded-full bg-[#F8F6F2] border border-[#e5e7eb] flex items-center justify-center hover:border-[#C5A059] transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-[#6b7280]" />
            </button>
            <h1 className="text-lg font-semibold text-[#1a1f36]">Hadith Detail</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                isSaved
                  ? "bg-gradient-to-r from-[#C5A059] to-[#E8C77D] text-white"
                  : "bg-[#F8F6F2] border border-[#e5e7eb] text-[#6b7280] hover:border-[#C5A059]",
              )}
            >
              <Bookmark className={cn("w-5 h-5", isSaved && "fill-current")} />
            </button>
            <button
              onClick={handleShare}
              className="w-10 h-10 rounded-full bg-[#F8F6F2] border border-[#e5e7eb] flex items-center justify-center text-[#6b7280] hover:border-[#C5A059] transition-colors"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="gold-border rounded-2xl p-6 sm:p-8 premium-card">
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
          <div className="mb-8" dir="rtl" lang="ar">
            <p
              className="text-2xl sm:text-3xl leading-[2] text-[#1a1f36] text-right"
              style={{ fontFamily: "Amiri, serif" }}
            >
              {hadith.arabic_text}
            </p>
          </div>

          {/* Divider */}
          <div className="gold-divider mb-8" />

          {/* English Translation */}
          <div className="mb-8" dir="ltr" lang="en">
            <h3 className="text-sm font-semibold text-[#C5A059] mb-3 uppercase tracking-wider">Translation</h3>
            <p className="text-lg leading-relaxed text-[#4a5568]">{hadith.english_translation}</p>
          </div>

          {/* Metadata */}
          <div className="bg-[#fafaf9] rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Reference</span>
              <span className="text-[#1a1f36] font-medium">{hadith.reference}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Narrator</span>
              <span className="text-[#1a1f36] font-medium">{hadith.narrator}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Grade</span>
              <span className="text-[#1a1f36] font-medium">{gradeLabels[hadith.grade]}</span>
            </div>
          </div>
        </div>
      </main>

      <BottomNavigation />
    </div>
  )
}
