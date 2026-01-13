"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { DailyHadithCard } from "@/components/home/daily-hadith-card"
import { QuickActionsGrid } from "@/components/home/quick-actions-grid"
import { RecentlyViewedList } from "@/components/home/recently-viewed-list"
import { AIAssistantBlock } from "@/components/home/ai-assistant-block"
import { User } from "lucide-react"

interface UserProfile {
  name: string
  avatar_url: string | null
}

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

interface RecentHadith {
  id: string
  title: string
  collection: string
  viewed_at: string
}

export default function HomePage() {
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [dailyHadith, setDailyHadith] = useState<Hadith | null>(null)
  const [recentlyViewed, setRecentlyViewed] = useState<RecentHadith[]>([])
  const [loading, setLoading] = useState(true)
  const [isFirstVisit, setIsFirstVisit] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // Fetch profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("name, avatar_url")
          .eq("user_id", user.id)
          .single()

        if (profileData) {
          setProfile(profileData)
        }

        // Check if first visit (no recent views)
        const { data: viewsData, error: viewsError } = await supabase
          .from("hadith_views")
          .select("id")
          .eq("user_id", user.id)
          .limit(1)

        if (!viewsError && (!viewsData || viewsData.length === 0)) {
          setIsFirstVisit(true)
        }

        // Fetch daily hadith
        const { data: hadithData } = await supabase.from("hadiths").select("*").eq("is_featured", true).single()

        if (hadithData) {
          // Check if saved
          const { data: savedData } = await supabase
            .from("saved_hadiths")
            .select("id")
            .eq("user_id", user.id)
            .eq("hadith_id", hadithData.id)
            .single()

          setDailyHadith({
            ...hadithData,
            is_saved: !!savedData,
          })
        }

        // Fetch recently viewed
        const { data: recentData } = await supabase
          .from("hadith_views")
          .select(`
            viewed_at,
            hadiths (
              id,
              english_translation,
              collection
            )
          `)
          .eq("user_id", user.id)
          .order("viewed_at", { ascending: false })
          .limit(5)

        if (recentData) {
          setRecentlyViewed(
            recentData
              .filter((item: any) => item.hadiths)
              .map((item: any) => ({
                id: item.hadiths.id,
                title: item.hadiths.english_translation.substring(0, 50) + "...",
                collection: item.hadiths.collection,
                viewed_at: item.viewed_at,
              })),
          )
        }
      }
      setLoading(false)
    }

    fetchData()
  }, [supabase])

  const handleSaveHadith = async (hadithId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    if (dailyHadith?.is_saved) {
      await supabase.from("saved_hadiths").delete().eq("user_id", user.id).eq("hadith_id", hadithId)
    } else {
      await supabase.from("saved_hadiths").insert({
        user_id: user.id,
        hadith_id: hadithId,
      })
    }

    setDailyHadith((prev) => (prev ? { ...prev, is_saved: !prev.is_saved } : null))
  }

  const handleShareHadith = async (hadithId: string) => {
    if (navigator.share) {
      await navigator.share({
        title: "Authentic Hadith",
        text: dailyHadith?.english_translation,
        url: `${window.location.origin}/hadith/${hadithId}`,
      })
    } else {
      await navigator.clipboard.writeText(`${window.location.origin}/hadith/${hadithId}`)
      alert("Link copied to clipboard!")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen marble-bg flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Default hadith if none from database
  const displayHadith = dailyHadith || {
    id: "default",
    arabic_text: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى",
    english_translation: "Actions are according to intentions, and everyone will get what was intended.",
    collection: "Sahih Bukhari",
    reference: "Book 1, Hadith 1",
    grade: "sahih" as const,
    narrator: "Umar ibn al-Khattab",
    is_saved: false,
  }

  return (
    <div className="min-h-screen marble-bg">
      {/* Header - Mobile Only */}
      <header className="sticky top-0 z-40 border-b border-[#e5e7eb] bg-[#F8F6F2]/95 backdrop-blur-sm md:hidden">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="relative w-8 h-8">
            <Image
              src="/images/gemini-generated-image-xw5svjxw5svjxw5s.jpeg"
              alt="Authentic Hadith"
              fill
              className="object-contain"
            />
          </div>
          <button
            onClick={() => router.push("/search")}
            className="w-8 h-8 rounded-full bg-[#F8F6F2] border border-[#e5e7eb] flex items-center justify-center"
          >
            <svg className="w-4 h-4 text-[#6b7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
          {profile?.avatar_url ? (
            <button onClick={() => router.push("/profile")}>
              <img
                src={profile.avatar_url || "/placeholder.svg"}
                alt={profile.name}
                className="w-8 h-8 rounded-full object-cover border border-[#C5A059]"
              />
            </button>
          ) : (
            <button
              onClick={() => router.push("/profile")}
              className="w-8 h-8 rounded-full bg-[#F8F6F2] border border-[#C5A059] flex items-center justify-center"
            >
              <User className="w-4 h-4 text-[#C5A059]" />
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Welcome Message (First Visit) */}
        {isFirstVisit && profile?.name && (
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1a1f36]">
              As-salamu alaykum, <span className="gold-text">{profile.name.split(" ")[0]}</span>!
            </h1>
            <p className="text-muted-foreground mt-2">Welcome to Authentic Hadith</p>
          </div>
        )}

        {/* Daily Hadith Hero */}
        <section className="mb-8" aria-label="Daily featured hadith">
          <DailyHadithCard hadith={displayHadith} onSave={handleSaveHadith} onShare={handleShareHadith} />
        </section>

        {/* Desktop: Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Recently Viewed - Left Column (60%) */}
          <div className="lg:col-span-3 order-2 lg:order-1">
            <RecentlyViewedList hadiths={recentlyViewed} />
          </div>

          {/* Quick Actions + AI Assistant - Right Column (40%) */}
          <div className="lg:col-span-2 space-y-6 order-1 lg:order-2">
            <div>
              <h3 className="text-lg font-semibold text-[#1a1f36] mb-4">Quick Actions</h3>
              <QuickActionsGrid />
            </div>
            <AIAssistantBlock />
          </div>
        </div>
      </main>
    </div>
  )
}
