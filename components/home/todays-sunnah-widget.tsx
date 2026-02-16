"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sun, ChevronRight, Share2, BookOpen } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

interface SunnahPractice {
  id: string
  title: string
  description: string
  hadith_ref: string
  collection: string
}

function getDayOfYear(): number {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = now.getTime() - start.getTime()
  const oneDay = 1000 * 60 * 60 * 24
  return Math.floor(diff / oneDay)
}

export function TodaysSunnahWidget() {
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()
  const [practice, setPractice] = useState<SunnahPractice | null>(null)

  useEffect(() => {
    async function load() {
      const dayOfYear = getDayOfYear()
      const { data } = await supabase
        .from("sunnah_practices")
        .select("id, title, description, hadith_ref, collection")
        .eq("day_of_year", dayOfYear)
        .limit(1)
        .single()

      if (data) {
        setPractice(data)
      } else {
        // Fallback: get any practice based on day
        const { data: fallback } = await supabase
          .from("sunnah_practices")
          .select("id, title, description, hadith_ref, collection")
          .limit(1)
          .single()
        if (fallback) setPractice(fallback)
      }
    }
    load()
  }, [supabase])

  if (!practice) return null

  const handleShare = async () => {
    const text = `Today's Sunnah: ${practice.title}\n\n"${practice.description}"\n\n-- ${practice.collection || "Hadith"}, ${practice.hadith_ref}`
    if (navigator.share) {
      await navigator.share({ title: "Today's Sunnah", text, url: window.location.origin + "/sunnah" })
    } else {
      await navigator.clipboard.writeText(text)
    }
  }

  return (
    <section className="pb-6 md:pb-8" aria-label="Today's Sunnah">
      <div className="rounded-xl border border-[#C5A059]/20 bg-gradient-to-br from-[#C5A059]/5 to-transparent p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sun className="w-4 h-4 text-[#C5A059]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#C5A059]">
              {"Today's Sunnah"}
            </span>
          </div>
          <button
            onClick={handleShare}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#C5A059]/10 transition-colors"
            aria-label="Share today's sunnah"
          >
            <Share2 className="w-3.5 h-3.5 text-[#C5A059]" />
          </button>
        </div>

        <h3 className="text-sm font-semibold text-foreground mb-1.5">{practice.title}</h3>
        <p className="text-sm text-foreground/70 leading-relaxed line-clamp-3 mb-3">
          {practice.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-3 h-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">
              {practice.collection || "Hadith"} - {practice.hadith_ref}
            </span>
          </div>
          <button
            onClick={() => router.push("/sunnah")}
            className="text-xs font-medium text-[#C5A059] hover:text-[#8A6E3A] transition-colors flex items-center gap-1"
          >
            See all
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  )
}
