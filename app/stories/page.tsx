"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Clock,
  CheckCircle2,
  Bookmark,
  Shield,
  Sword,
  Star,
  Heart,
  Users,
} from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

import { ShareBanner } from "@/components/share-banner"
import { cn } from "@/lib/utils"

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  shield: Shield,
  sword: Sword,
  star: Star,
  heart: Heart,
  users: Users,
}

interface SahabiCard {
  id: string
  slug: string
  name_en: string
  name_ar: string
  title_en: string
  title_ar: string | null
  icon: string
  color_theme: string
  theme_primary: string
  theme_secondary: string | null
  notable_for: string[]
  total_parts: number
  estimated_read_time_minutes: number | null
  display_order: number
}

interface ProgressMap {
  [sahabiId: string]: {
    current_part: number
    parts_completed: number[]
    is_completed: boolean
    is_bookmarked: boolean
  }
}

export default function StoriesPage() {
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()
  const [companions, setCompanions] = useState<SahabiCard[]>([])
  const [progress, setProgress] = useState<ProgressMap>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: sahabaData } = await supabase
        .from("sahaba")
        .select("*")
        .order("display_order", { ascending: true })

      if (sahabaData) setCompanions(sahabaData)

      // Fetch user progress if logged in
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data: progressData } = await supabase
          .from("sahaba_reading_progress")
          .select("*")
          .eq("user_id", user.id)

        if (progressData) {
          const map: ProgressMap = {}
          for (const p of progressData) {
            map[p.sahabi_id] = {
              current_part: p.current_part,
              parts_completed: p.parts_completed || [],
              is_completed: p.is_completed,
              is_bookmarked: p.is_bookmarked,
            }
          }
          setProgress(map)
        }
      }

      setLoading(false)
    }
    load()
  }, [supabase])

  // Separate into: continue reading, not started, completed
  const continueReading = companions.filter(
    (c) => progress[c.id] && !progress[c.id].is_completed && (progress[c.id].parts_completed?.length || 0) > 0,
  )
  const notStarted = companions.filter((c) => !progress[c.id] || (progress[c.id].parts_completed?.length || 0) === 0)
  const completed = companions.filter((c) => progress[c.id]?.is_completed)

  return (
    <div className="min-h-screen marble-bg pb-20 md:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => router.push("/")}
            className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center hover:border-[#C5A059] transition-colors"
            aria-label="Go back home"
          >
            <ChevronLeft className="w-5 h-5 text-[#6b7280]" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Stories of the Companions</h1>
            <p className="text-xs text-muted-foreground">
              {companions.length} companions, {companions.reduce((sum, c) => sum + c.total_parts, 0)} parts
            </p>
          </div>
        </div>
      </header>

      {/* Intro */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 pb-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          The Companions (Sahaba) were the people who lived alongside the Prophet Muhammad (peace be upon
          him). Read their full stories -- multi-part narratives with authentic references from the Quran and
          Hadith.
        </p>
      </section>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex flex-col gap-6">
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="rounded-xl border border-border p-4 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-muted" />
                  <div className="flex-1">
                    <div className="h-4 w-32 bg-muted rounded mb-2" />
                    <div className="h-3 w-24 bg-muted rounded mb-2" />
                    <div className="h-2 w-48 bg-muted rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Continue Reading */}
            {continueReading.length > 0 && (
              <section>
                <h2 className="text-xs font-bold uppercase tracking-widest text-[#1B5E43] mb-3 flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5" />
                  Continue Reading
                </h2>
                <div className="flex flex-col gap-3">
                  {continueReading.map((c) => (
                    <CompanionCard
                      key={c.id}
                      companion={c}
                      progress={progress[c.id]}
                      onClick={() => router.push(`/stories/${c.slug}`)}
                      featured
                    />
                  ))}
                </div>
              </section>
            )}

            {/* All Stories / Not Started */}
            <section>
              <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                {continueReading.length > 0 ? "Not Yet Started" : "All Companions"}
              </h2>
              <div className="flex flex-col gap-3">
                {(continueReading.length > 0 ? notStarted : companions).map((c) => (
                  <CompanionCard
                    key={c.id}
                    companion={c}
                    progress={progress[c.id]}
                    onClick={() => router.push(`/stories/${c.slug}`)}
                  />
                ))}
              </div>
            </section>

            {/* Completed */}
            {completed.length > 0 && (
              <section>
                <h2 className="text-xs font-bold uppercase tracking-widest text-[#C5A059] mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Completed
                </h2>
                <div className="flex flex-col gap-3">
                  {completed.map((c) => (
                    <CompanionCard
                      key={c.id}
                      companion={c}
                      progress={progress[c.id]}
                      onClick={() => router.push(`/stories/${c.slug}`)}
                      isComplete
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-24 md:pb-8">
        <ShareBanner variant="compact" />
      </div>

    </div>
  )
}

function CompanionCard({
  companion,
  progress,
  onClick,
  featured,
  isComplete,
}: {
  companion: SahabiCard
  progress?: ProgressMap[string]
  onClick: () => void
  featured?: boolean
  isComplete?: boolean
}) {
  const Icon = ICON_MAP[companion.icon] || Star
  const partsCompleted = progress?.parts_completed?.length || 0
  const progressPercent = companion.total_parts > 0 ? (partsCompleted / companion.total_parts) * 100 : 0

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full rounded-xl border text-left transition-all hover:shadow-md hover:border-[#C5A059]/30 premium-card overflow-hidden",
        featured ? "border-[#C5A059]/30 shadow-sm" : "border-border",
        isComplete && "border-[#1B5E43]/20 opacity-80",
      )}
    >
      {/* Progress bar at top */}
      {partsCompleted > 0 && !isComplete && (
        <div className="h-1 bg-muted">
          <div
            className="h-full transition-all"
            style={{
              width: `${progressPercent}%`,
              background: `linear-gradient(to right, ${companion.theme_primary}, ${companion.theme_secondary || companion.theme_primary})`,
            }}
          />
        </div>
      )}

      <div className="p-4 flex items-center gap-4">
        {/* Icon */}
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${companion.theme_primary}15` }}
        >
          <Icon className="w-6 h-6" style={{ color: companion.theme_primary }} />
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground truncate">{companion.name_en}</h3>
            {isComplete && <CheckCircle2 className="w-3.5 h-3.5 text-[#1B5E43] shrink-0" />}
            {progress?.is_bookmarked && <Bookmark className="w-3.5 h-3.5 text-[#C5A059] fill-[#C5A059] shrink-0" />}
          </div>
          <p className="text-xs font-medium" style={{ color: companion.theme_primary }}>
            {companion.title_en}
          </p>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              {companion.total_parts} parts
            </span>
            {companion.estimated_read_time_minutes && (
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {companion.estimated_read_time_minutes} min
              </span>
            )}
            {partsCompleted > 0 && !isComplete && (
              <span
                className="text-[10px] font-medium flex items-center gap-1"
                style={{ color: companion.theme_primary }}
              >
                {partsCompleted}/{companion.total_parts} read
              </span>
            )}
          </div>
          {/* Notable tags */}
          {companion.notable_for && companion.notable_for.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {companion.notable_for.slice(0, 2).map((tag, i) => (
                <span key={i} className="text-[10px] text-muted-foreground px-2 py-0.5 rounded-full bg-muted">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Arrow */}
        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
      </div>

      {/* Arabic name */}
      {companion.name_ar && (
        <div className="px-4 pb-3 pt-0">
          <p className="text-sm text-muted-foreground/40 text-right font-serif" dir="rtl">
            {companion.name_ar}
          </p>
        </div>
      )}
    </button>
  )
}
