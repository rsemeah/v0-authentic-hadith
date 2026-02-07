"use client"

import React from "react"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { DailyHadithCard } from "@/components/home/daily-hadith-card"
import { AIAssistantBlock } from "@/components/home/ai-assistant-block"
import { BottomNavigation } from "@/components/home/bottom-navigation"
import {
  User,
  Search,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Clock,
  Bookmark,
  GraduationCap,
  Bot,
  TrendingUp,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

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

interface FeaturedCollection {
  id: string
  name_en: string
  name_ar: string
  slug: string
  total_hadiths: number
  is_featured: boolean
  grade_distribution: {
    sahih: number
    hasan: number
    daif: number
  }
}

export default function HomePage() {
  const router = useRouter()
  const carouselRef = useRef<HTMLDivElement>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [dailyHadith, setDailyHadith] = useState<Hadith | null>(null)
  const [recentlyViewed, setRecentlyViewed] = useState<RecentHadith[]>([])
  const [featuredCollections, setFeaturedCollections] = useState<FeaturedCollection[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [savedCount, setSavedCount] = useState(0)
  const [streakDays, setStreakDays] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = getSupabaseBrowserClient()
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
          if (profileData) setProfile(profileData)

          // Fetch daily hadith
          const { data: allHadiths } = await supabase.from("hadiths").select("*").limit(50)
          if (allHadiths && allHadiths.length > 0) {
            const dayOfYear = Math.floor(
              (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000,
            )
            const hadithData = allHadiths[dayOfYear % allHadiths.length]
            const { data: savedData } = await supabase
              .from("saved_hadiths")
              .select("id")
              .eq("user_id", user.id)
              .eq("hadith_id", hadithData.id)
              .maybeSingle()
            setDailyHadith({ ...hadithData, is_saved: !!savedData })
          }

          // Fetch recently viewed
          const { data: recentData } = await supabase
            .from("hadith_views")
            .select(`viewed_at, hadiths (id, english_translation, collection)`)
            .eq("user_id", user.id)
            .order("viewed_at", { ascending: false })
            .limit(5)
          if (recentData) {
            setRecentlyViewed(
              recentData
                .filter((item: any) => item.hadiths)
                .map((item: any) => ({
                  id: item.hadiths.id,
                  title: item.hadiths.english_translation.substring(0, 60) + "...",
                  collection: item.hadiths.collection,
                  viewed_at: item.viewed_at,
                })),
            )
          }

          // Fetch saved count
          const { count } = await supabase
            .from("saved_hadiths")
            .select("id", { count: "exact", head: true })
            .eq("user_id", user.id)
          setSavedCount(count || 0)

          // Calculate streak (days with views in a row)
          const { data: viewDays } = await supabase
            .from("hadith_views")
            .select("viewed_at")
            .eq("user_id", user.id)
            .order("viewed_at", { ascending: false })
            .limit(30)
          if (viewDays && viewDays.length > 0) {
            let streak = 1
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            const firstView = new Date(viewDays[0].viewed_at)
            firstView.setHours(0, 0, 0, 0)
            if (today.getTime() - firstView.getTime() <= 86400000) {
              for (let i = 1; i < viewDays.length; i++) {
                const prev = new Date(viewDays[i - 1].viewed_at)
                const curr = new Date(viewDays[i].viewed_at)
                prev.setHours(0, 0, 0, 0)
                curr.setHours(0, 0, 0, 0)
                if (prev.getTime() - curr.getTime() <= 86400000 && prev.getTime() !== curr.getTime()) {
                  streak++
                } else if (prev.getTime() !== curr.getTime()) {
                  break
                }
              }
            }
            setStreakDays(streak)
          }
        }

        // Fetch featured collections (public)
        const supabase2 = getSupabaseBrowserClient()
        const { data: featured } = await supabase2
          .from("collections")
          .select("id, name_en, name_ar, slug, total_hadiths, is_featured, grade_distribution")
          .eq("is_featured", true)
          .order("total_hadiths", { ascending: false })
          .limit(4)
        if (featured) setFeaturedCollections(featured)
      } catch (err) {
        console.log("[v0] Home fetch error:", err)
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  const handleSaveHadith = async (hadithId: string) => {
    try {
      const supabase = getSupabaseBrowserClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return
      if (dailyHadith?.is_saved) {
        await supabase.from("saved_hadiths").delete().eq("user_id", user.id).eq("hadith_id", hadithId)
      } else {
        await supabase.from("saved_hadiths").insert({ user_id: user.id, hadith_id: hadithId })
      }
      setDailyHadith((prev) => (prev ? { ...prev, is_saved: !prev.is_saved } : null))
    } catch (err) {
      console.log("[v0] Save error:", err)
    }
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
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const scrollCarousel = (direction: "left" | "right") => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({
        left: direction === "left" ? -280 : 280,
        behavior: "smooth",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen marble-bg flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const displayHadith = dailyHadith || {
    id: "default",
    arabic_text: "\u0625\u0650\u0646\u0651\u064E\u0645\u064E\u0627 \u0627\u0644\u0623\u064E\u0639\u0652\u0645\u064E\u0627\u0644\u064F \u0628\u0650\u0627\u0644\u0646\u0651\u0650\u064A\u0651\u064E\u0627\u062A\u0650",
    english_translation:
      "Actions are according to intentions, and everyone will get what was intended.",
    collection: "Sahih Bukhari",
    reference: "Book 1, Hadith 1",
    grade: "sahih" as const,
    narrator: "Umar ibn al-Khattab",
    is_saved: false,
  }

  const firstName = profile?.name?.split(" ")[0] || "Scholar"
  const greeting = (() => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 17) return "Good afternoon"
    return "Good evening"
  })()

  return (
    <div className="min-h-screen marble-bg pb-20 md:pb-0">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-[#e5e7eb]">
        {/* Geometric pattern overlay */}
        <div className="absolute inset-0 opacity-[0.05]">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
            <pattern id="home-hero-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M10 0L20 10L10 20L0 10Z" fill="currentColor" className="text-[#C5A059]" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#home-hero-pattern)" />
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-8 md:pt-10 md:pb-12">
          {/* Top bar with logo + profile */}
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10">
                <Image
                  src="/images/gemini-generated-image-xw5svjxw5svjxw5s.jpeg"
                  alt="Authentic Hadith"
                  fill
                  className="object-contain rounded-lg"
                />
              </div>
              <span className="text-sm font-semibold text-[#1a1f36] tracking-wide hidden sm:block">
                Authentic Hadith
              </span>
            </div>
            {profile?.avatar_url ? (
              <button onClick={() => router.push("/profile")} className="relative group">
                <img
                  src={profile.avatar_url || "/placeholder.svg"}
                  alt={profile.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-[#C5A059] group-hover:border-[#E8C77D] transition-colors"
                />
              </button>
            ) : (
              <button
                onClick={() => router.push("/profile")}
                className="w-10 h-10 rounded-full bg-[#F8F6F2] border-2 border-[#C5A059] flex items-center justify-center hover:border-[#E8C77D] transition-colors"
              >
                <User className="w-5 h-5 text-[#C5A059]" />
              </button>
            )}
          </div>

          {/* Greeting */}
          <h1 className="text-2xl md:text-3xl font-bold text-[#1a1f36] mb-1">
            {greeting}, <span className="gold-text">{firstName}</span>
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mb-6">
            Continue your journey through authentic hadith literature
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="relative max-w-xl">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search hadiths, collections, or topics..."
              className="w-full px-4 py-3 pl-12 rounded-xl border border-[#d4cfc7] bg-white text-sm focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20 outline-none transition-all"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          </form>

          {/* Stats row */}
          <div className="flex items-center gap-4 mt-5">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 border border-[#d4cfc7]">
              <TrendingUp className="w-3.5 h-3.5 text-[#1B5E43]" />
              <span className="text-xs font-medium text-[#1a1f36]">
                {streakDays} day{streakDays !== 1 ? "s" : ""} streak
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 border border-[#d4cfc7]">
              <Bookmark className="w-3.5 h-3.5 text-[#C5A059]" />
              <span className="text-xs font-medium text-[#1a1f36]">{savedCount} saved</span>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Daily Hadith */}
        <section className="py-6 md:py-8" aria-label="Daily featured hadith">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-[#C5A059]" />
            <h2 className="text-lg font-bold text-[#1a1f36]">Hadith of the Day</h2>
          </div>
          <DailyHadithCard hadith={displayHadith} onSave={handleSaveHadith} onShare={handleShareHadith} />
        </section>

        {/* Quick Actions */}
        <section className="pb-6 md:pb-8" aria-label="Quick Actions">
          <h2 className="text-lg font-bold text-[#1a1f36] mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {
                icon: BookOpen,
                label: "Browse Books",
                desc: "8 collections",
                href: "/collections",
                gradient: "from-[#1B5E43] to-[#2D7A5B]",
                iconColor: "text-white",
              },
              {
                icon: Bot,
                label: "AI Chat",
                desc: "Ask anything",
                href: "/assistant",
                gradient: "from-[#C5A059] to-[#E8C77D]",
                iconColor: "text-white",
              },
              {
                icon: GraduationCap,
                label: "Learn",
                desc: "Guided paths",
                href: "/learn",
                gradient: "from-[#1B5E43] to-[#4a9973]",
                iconColor: "text-white",
              },
              {
                icon: Bookmark,
                label: "Saved",
                desc: `${savedCount} hadiths`,
                href: "/saved",
                gradient: "from-[#8a6e3a] to-[#C5A059]",
                iconColor: "text-white",
              },
            ].map((action) => (
              <button
                key={action.label}
                onClick={() => router.push(action.href)}
                className="group relative flex flex-col items-start p-4 rounded-xl premium-card overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1"
              >
                {/* Subtle background gradient on hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                />
                <div className="relative z-10">
                  <div
                    className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-3`}
                  >
                    <action.icon className={`w-5 h-5 ${action.iconColor}`} />
                  </div>
                  <span className="text-sm font-semibold text-[#1a1f36] group-hover:text-white transition-colors">
                    {action.label}
                  </span>
                  <span className="block text-xs text-muted-foreground group-hover:text-white/70 transition-colors mt-0.5">
                    {action.desc}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Featured Collections Carousel */}
        {featuredCollections.length > 0 && (
          <section className="pb-6 md:pb-8 border-t border-[#e5e7eb] pt-6 md:pt-8" aria-label="Featured Collections">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#1B5E43]" />
                <h2 className="text-lg font-bold text-[#1a1f36]">Featured Collections</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => scrollCarousel("left")}
                  className="w-8 h-8 rounded-full border border-[#d4cfc7] flex items-center justify-center hover:border-[#C5A059] transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-[#6b7280]" />
                </button>
                <button
                  onClick={() => scrollCarousel("right")}
                  className="w-8 h-8 rounded-full border border-[#d4cfc7] flex items-center justify-center hover:border-[#C5A059] transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-[#6b7280]" />
                </button>
              </div>
            </div>

            <div
              ref={carouselRef}
              className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 px-4"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {featuredCollections.map((collection) => {
                const total =
                  (collection.grade_distribution?.sahih || 0) +
                  (collection.grade_distribution?.hasan || 0) +
                  (collection.grade_distribution?.daif || 0)
                const sahihPct = total > 0 ? Math.round(((collection.grade_distribution?.sahih || 0) / total) * 100) : 0

                return (
                  <button
                    key={collection.id}
                    onClick={() => router.push(`/collections/${collection.slug}`)}
                    className="relative flex flex-col w-[260px] md:w-[280px] h-[200px] rounded-xl premium-card overflow-hidden group transition-all hover:scale-[1.02] hover:shadow-lg flex-shrink-0 snap-center text-left"
                  >
                    {/* Featured badge */}
                    <div className="absolute top-3 right-3 px-2 py-1 rounded-md text-[10px] font-bold text-white bg-gradient-to-r from-[#1B5E43] to-[#2D7A5B] z-10">
                      Featured
                    </div>

                    {/* Pattern overlay */}
                    <div className="absolute inset-0 opacity-[0.06]">
                      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
                        <pattern
                          id={`home-pattern-${collection.id}`}
                          x="0"
                          y="0"
                          width="20"
                          height="20"
                          patternUnits="userSpaceOnUse"
                        >
                          <path d="M10 0L20 10L10 20L0 10Z" fill="currentColor" className="text-[#C5A059]" />
                        </pattern>
                        <rect width="100%" height="100%" fill={`url(#home-pattern-${collection.id})`} />
                      </svg>
                    </div>

                    <div className="relative flex flex-col flex-1 p-5">
                      <div className="w-11 h-11 rounded-lg gold-icon-bg flex items-center justify-center mb-3">
                        <BookOpen className="w-5 h-5 text-[#C5A059]" />
                      </div>
                      <h3 className="text-base font-bold text-[#1a1f36] mb-0.5 line-clamp-1">
                        {collection.name_en}
                      </h3>
                      <p className="text-sm text-[#C5A059] mb-2" dir="rtl">
                        {collection.name_ar}
                      </p>
                      <p className="text-xs text-muted-foreground mb-3">
                        {collection.total_hadiths.toLocaleString()} hadiths
                      </p>
                      <div className="mt-auto">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-semibold bg-gradient-to-r from-[#C5A059] to-[#E8C77D] text-[#2c2416]">
                          {sahihPct}% Sahih
                        </span>
                      </div>
                    </div>
                  </button>
                )
              })}

              {/* View All card */}
              <button
                onClick={() => router.push("/collections")}
                className="relative flex flex-col items-center justify-center w-[200px] h-[200px] rounded-xl border-2 border-dashed border-[#C5A059]/40 hover:border-[#C5A059] transition-all flex-shrink-0 snap-center group"
              >
                <div className="w-12 h-12 rounded-full bg-[#C5A059]/10 flex items-center justify-center mb-3 group-hover:bg-[#C5A059]/20 transition-colors">
                  <ChevronRight className="w-6 h-6 text-[#C5A059]" />
                </div>
                <span className="text-sm font-semibold text-[#C5A059]">View All</span>
                <span className="text-xs text-muted-foreground mt-0.5">8 collections</span>
              </button>
            </div>
          </section>
        )}

        {/* Two Column: Recently Viewed + AI Assistant */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 pb-8">
          {/* Recently Viewed */}
          <div className="lg:col-span-3">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-[#6b7280]" />
              <h2 className="text-lg font-bold text-[#1a1f36]">Recently Viewed</h2>
            </div>
            {recentlyViewed.length === 0 ? (
              <div className="premium-card gold-border rounded-xl p-8 text-center">
                <div className="w-14 h-14 rounded-full gold-icon-bg flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-7 h-7 text-[#C5A059]" />
                </div>
                <h3 className="text-base font-semibold text-[#1a1f36] mb-1">Start Exploring</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Your recently viewed hadiths will appear here
                </p>
                <button
                  onClick={() => router.push("/collections")}
                  className="px-5 py-2.5 rounded-lg emerald-button text-sm"
                >
                  Browse Collections
                </button>
              </div>
            ) : (
              <div className="premium-card gold-border rounded-xl overflow-hidden">
                <div className="divide-y divide-[#e5e7eb]">
                  {recentlyViewed.map((hadith) => (
                    <button
                      key={hadith.id}
                      onClick={() => router.push(`/hadith/${hadith.id}`)}
                      className="w-full flex items-start gap-3 p-4 hover:bg-[#fafaf9] transition-colors text-left group"
                    >
                      <div className="w-9 h-9 rounded-lg gold-icon-bg flex items-center justify-center shrink-0 mt-0.5">
                        <BookOpen className="w-4 h-4 text-[#C5A059]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#1a1f36] line-clamp-1 group-hover:text-[#1B5E43] transition-colors">
                          {hadith.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {hadith.collection} {" \u2022 "}
                          {formatDistanceToNow(new Date(hadith.viewed_at), { addSuffix: true })}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-[#C5A059] transition-colors shrink-0 mt-2" />
                    </button>
                  ))}
                </div>
                <div className="border-t border-[#e5e7eb] p-3">
                  <button
                    onClick={() => router.push("/search")}
                    className="w-full text-center text-sm font-medium text-[#C5A059] hover:text-[#8a6e3a] transition-colors flex items-center justify-center gap-1"
                  >
                    View all history
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* AI Assistant */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-[#E8C77D]" />
              <h2 className="text-lg font-bold text-[#1a1f36]">AI Assistant</h2>
            </div>
            <AIAssistantBlock />
          </div>
        </div>
      </main>

      <BottomNavigation />
    </div>
  )
}
