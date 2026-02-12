"use client"

import React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Heart,
  ChevronLeft,
  ChevronRight,
  Moon,
  Users,
  Home as HomeIcon,
  HandHeart,
  Utensils,
  Clock,
  BookOpen,
  Share2,
  Bookmark,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ShareBanner } from "@/components/share-banner"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

interface SunnahCategory {
  id: string
  title: string
  titleAr: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  bgColor: string
  practices: SunnahPractice[]
}

interface SunnahPractice {
  id: string
  title: string
  description: string
  hadithRef: string
  collection: string
}

const CATEGORIES: SunnahCategory[] = [
  {
    id: "salah",
    title: "Sunnah of Salah",
    titleAr: "سنن الصلاة",
    description: "Voluntary prayers, adhkar before and after salah, and prophetic etiquettes of worship",
    icon: Moon,
    color: "text-[#1B5E43]",
    bgColor: "bg-[#1B5E43]/10",
    practices: [
      {
        id: "rawatib",
        title: "The Rawatib (Regular Sunnah Prayers)",
        description: "12 rak'ahs daily: 2 before Fajr, 4 before Dhuhr, 2 after Dhuhr, 2 after Maghrib, 2 after Isha",
        hadithRef: "Hadith 1761",
        collection: "Jami at-Tirmidhi",
      },
      {
        id: "duha",
        title: "Salat al-Duha (Forenoon Prayer)",
        description: "The Prophet would pray between 2-8 rak'ahs after sunrise",
        hadithRef: "Book 8, Hadith 669",
        collection: "Sahih Muslim",
      },
      {
        id: "witr",
        title: "Witr Prayer",
        description: "An odd-numbered prayer performed after Isha, the last prayer of the night",
        hadithRef: "Book 14, Hadith 1",
        collection: "Sunan Abu Dawud",
      },
    ],
  },
  {
    id: "character",
    title: "Sunnah of Character",
    titleAr: "سنن الأخلاق",
    description: "The prophetic way of dealing with people: kindness, patience, honesty, and mercy",
    icon: HandHeart,
    color: "text-[#C5A059]",
    bgColor: "bg-[#C5A059]/10",
    practices: [
      {
        id: "smile",
        title: "Smiling",
        description: "Your smiling in the face of your brother is charity",
        hadithRef: "Hadith 1956",
        collection: "Jami at-Tirmidhi",
      },
      {
        id: "greet",
        title: "Spreading Salam",
        description: "Spread peace, feed the hungry, pray at night while people sleep, and you will enter Paradise",
        hadithRef: "Hadith 1334",
        collection: "Sunan Ibn Majah",
      },
      {
        id: "patience",
        title: "Patience in Difficulty",
        description: "How wonderful is the affair of the believer, for all of it is good",
        hadithRef: "Book 55, Hadith 82",
        collection: "Sahih Muslim",
      },
    ],
  },
  {
    id: "home",
    title: "Sunnah at Home",
    titleAr: "سنن المنزل",
    description: "Prophetic practices for the household: entering, eating, sleeping, and family life",
    icon: HomeIcon,
    color: "text-[#3b82f6]",
    bgColor: "bg-blue-50",
    practices: [
      {
        id: "enter",
        title: "Entering the Home",
        description: "Say salam when entering, mention Allah's name, and eat",
        hadithRef: "Book 36, Hadith 28",
        collection: "Sahih Muslim",
      },
      {
        id: "sleep",
        title: "Sleeping Etiquette",
        description: "Sleep on your right side, recite Ayat al-Kursi and the last three surahs",
        hadithRef: "Book 75, Hadith 7",
        collection: "Sahih Bukhari",
      },
      {
        id: "wakeup",
        title: "Waking Up",
        description: "Praise Allah upon waking, wash hands before using them, and perform wudu",
        hadithRef: "Book 4, Hadith 183",
        collection: "Sahih Bukhari",
      },
    ],
  },
  {
    id: "people",
    title: "Sunnah with People",
    titleAr: "سنن المعاملات",
    description: "How the Prophet interacted with neighbors, guests, the elderly, and children",
    icon: Users,
    color: "text-[#7c3aed]",
    bgColor: "bg-purple-50",
    practices: [
      {
        id: "neighbor",
        title: "Rights of the Neighbor",
        description: "Jibril kept advising me about the neighbor until I thought he would inherit from me",
        hadithRef: "Book 45, Hadith 28",
        collection: "Sahih Bukhari",
      },
      {
        id: "guest",
        title: "Honoring the Guest",
        description: "Whoever believes in Allah and the Last Day, let him honor his guest",
        hadithRef: "Book 79, Hadith 6019",
        collection: "Sahih Bukhari",
      },
      {
        id: "children",
        title: "Kindness to Children",
        description: "The Prophet would greet children, play with them, and carry them during prayer",
        hadithRef: "Book 78, Hadith 5993",
        collection: "Sahih Bukhari",
      },
    ],
  },
  {
    id: "food",
    title: "Sunnah of Eating",
    titleAr: "سنن الطعام",
    description: "Prophetic etiquettes of food: bismillah, eating with the right hand, and gratitude",
    icon: Utensils,
    color: "text-[#059669]",
    bgColor: "bg-emerald-50",
    practices: [
      {
        id: "bismillah",
        title: "Saying Bismillah",
        description: "Mention Allah's name, eat with your right hand, and eat what is nearest to you",
        hadithRef: "Book 70, Hadith 5376",
        collection: "Sahih Bukhari",
      },
      {
        id: "moderation",
        title: "Moderation in Eating",
        description: "A third for food, a third for drink, and a third for air",
        hadithRef: "Hadith 2380",
        collection: "Jami at-Tirmidhi",
      },
    ],
  },
  {
    id: "daily",
    title: "Daily Sunnah",
    titleAr: "أذكار اليوم",
    description: "Morning and evening adhkar, remembrances throughout the day",
    icon: Clock,
    color: "text-[#d97706]",
    bgColor: "bg-amber-50",
    practices: [
      {
        id: "morning",
        title: "Morning Adhkar",
        description: "Supplications to recite between Fajr and sunrise for protection and blessings",
        hadithRef: "Book 49",
        collection: "Jami at-Tirmidhi",
      },
      {
        id: "evening",
        title: "Evening Adhkar",
        description: "Supplications to recite between Asr and Maghrib",
        hadithRef: "Book 49",
        collection: "Jami at-Tirmidhi",
      },
      {
        id: "istighfar",
        title: "Seeking Forgiveness",
        description: "The Prophet would seek forgiveness more than 70 times a day",
        hadithRef: "Book 80, Hadith 6307",
        collection: "Sahih Bukhari",
      },
    ],
  },
]

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Moon, HandHeart, Home: HomeIcon, Users, Utensils, Clock,
}

export default function SunnahPage() {
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()
  const [expandedCategory, setExpandedCategory] = useState<string | null>("salah")
  const [categories, setCategories] = useState<SunnahCategory[]>(CATEGORIES)

  useEffect(() => {
    async function loadFromDB() {
      const { data: cats } = await supabase
        .from("sunnah_categories")
        .select("*")
        .order("sort_order", { ascending: true })

      if (!cats || cats.length === 0) return // fallback to hardcoded

      const { data: practices } = await supabase
        .from("sunnah_practices")
        .select("*")
        .order("sort_order", { ascending: true })

      const dbCategories: SunnahCategory[] = cats.map((cat: any) => {
        const IconComponent = ICON_MAP[cat.icon] || Moon
        const catPractices = (practices || [])
          .filter((p: any) => p.category_id === cat.id)
          .map((p: any) => ({
            id: p.id,
            title: p.title,
            description: p.description,
            hadithRef: p.hadith_ref,
            collection: p.collection,
          }))

        return {
          id: cat.slug,
          title: cat.title,
          titleAr: cat.title_ar,
          description: cat.description,
          icon: IconComponent,
          color: cat.color,
          bgColor: cat.bg_color,
          practices: catPractices,
        }
      })

      setCategories(dbCategories)
    }

    loadFromDB()
  }, [supabase])

  const sharePractice = async (practice: SunnahPractice, categoryTitle: string) => {
    const text = `${practice.title}\n\n"${practice.description}"\n\n-- ${practice.collection}, ${practice.hadithRef}\n\nFrom the ${categoryTitle} collection on Authentic Hadith`
    const url = typeof window !== "undefined" ? window.location.href : ""

    if (navigator.share) {
      await navigator.share({ title: practice.title, text, url })
    } else {
      await navigator.clipboard.writeText(`${text}\n\n${url}`)
    }
  }

  const shareCategory = async (cat: SunnahCategory) => {
    const text = `${cat.title} (${cat.titleAr})\n\n${cat.description}\n\n${cat.practices.length} practices to learn on Authentic Hadith`
    const url = typeof window !== "undefined" ? window.location.href : ""

    if (navigator.share) {
      await navigator.share({ title: cat.title, text, url })
    } else {
      await navigator.clipboard.writeText(`${text}\n\n${url}`)
    }
  }

  return (
    <div className="min-h-screen marble-bg pb-20 md:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center hover:border-[#C5A059] transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-[#6b7280]" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Sunnah</h1>
            <p className="text-xs text-muted-foreground">The lived practice of the Prophet</p>
          </div>
        </div>
      </header>

      {/* Intro */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 pb-4">
        <div className="premium-card rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#C5A059]/10 flex items-center justify-center shrink-0">
              <Heart className="w-5 h-5 text-[#C5A059]" />
            </div>
            <div>
              <p className="text-sm text-foreground/80 leading-relaxed">
                Beyond the academic study of hadith, the <strong>Sunnah</strong> is the living tradition --
                the daily acts, habits, and character of the Prophet (peace be upon him) that we can embody today.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex flex-col gap-3">
        {categories.map((cat) => {
          const isExpanded = expandedCategory === cat.id
          const Icon = cat.icon

          return (
            <div
              key={cat.id}
              className={cn(
                "rounded-xl border transition-all overflow-hidden",
                isExpanded ? "border-[#C5A059]/30 shadow-sm" : "border-border",
              )}
            >
              <div className="w-full p-4 flex items-center gap-4 premium-card">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setExpandedCategory(isExpanded ? null : cat.id)}
                  onKeyDown={(e) => e.key === "Enter" && setExpandedCategory(isExpanded ? null : cat.id)}
                  className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer text-left"
                >
                  <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0", cat.bgColor)}>
                    <Icon className={cn("w-5 h-5", cat.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-foreground">{cat.title}</h3>
                      <span className="text-xs text-muted-foreground/60" dir="rtl">{cat.titleAr}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{cat.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => shareCategory(cat)}
                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#C5A059]/10 transition-colors"
                    aria-label={`Share ${cat.title}`}
                  >
                    <Share2 className="w-3.5 h-3.5 text-[#C5A059]" />
                  </button>
                  <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {cat.practices.length}
                  </span>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setExpandedCategory(isExpanded ? null : cat.id)}
                    onKeyDown={(e) => e.key === "Enter" && setExpandedCategory(isExpanded ? null : cat.id)}
                    className="cursor-pointer"
                  >
                    <ChevronRight
                      className={cn("w-4 h-4 text-muted-foreground transition-transform", isExpanded && "rotate-90")}
                    />
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-border divide-y divide-border/50">
                  {cat.practices.map((practice) => (
                    <div key={practice.id} className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-semibold text-foreground mb-1">{practice.title}</h4>
                        <button
                          onClick={() => sharePractice(practice, cat.title)}
                          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#C5A059]/10 transition-colors shrink-0"
                          aria-label={`Share ${practice.title}`}
                        >
                          <Share2 className="w-3.5 h-3.5 text-[#C5A059]" />
                        </button>
                      </div>
                      <p className="text-xs text-foreground/80 leading-relaxed mb-2">{practice.description}</p>
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">
                          {practice.collection} - {practice.hadithRef}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </main>

      {/* Share CTA */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-24 md:pb-8">
        <ShareBanner variant="compact" />
      </div>
    </div>
  )
}
