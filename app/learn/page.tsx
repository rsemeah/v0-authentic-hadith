"use client"

import React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  BookOpen,
  Star,
  Trophy,
  Lock,
  CheckCircle2,
  Clock,
} from "lucide-react"
import { BottomNavigation } from "@/components/home/bottom-navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useSubscription } from "@/hooks/use-subscription"
import { PremiumGate } from "@/components/premium-gate"
import { cn } from "@/lib/utils"

interface LearningPath {
  id: string
  title: string
  subtitle: string
  description: string
  icon: React.ElementType
  color: string
  bgColor: string
  borderColor: string
  level: string
  modules: Module[]
  isPremium: boolean
}

interface Module {
  id: string
  title: string
  description: string
  lessons: Lesson[]
  collectionSlug?: string
}

interface Lesson {
  id: string
  title: string
  hadithCount: number
  collectionSlug: string
  bookNumber?: number
}

const LEARNING_PATHS: LearningPath[] = [
  {
    id: "foundations",
    title: "Foundations of Hadith",
    subtitle: "Start Here",
    description:
      "Begin your journey with the most essential and widely-known hadiths. These foundational narrations cover the pillars of Islam, daily worship, and core beliefs.",
    icon: BookOpen,
    color: "text-[#1B5E43]",
    bgColor: "bg-[#1B5E43]/10",
    borderColor: "border-[#1B5E43]/30",
    level: "Beginner",
    isPremium: false,
    modules: [
      {
        id: "pillars",
        title: "The Pillars of Islam",
        description: "Hadiths about the five pillars: Shahada, Salah, Zakat, Fasting, and Hajj",
        collectionSlug: "sahih-bukhari",
        lessons: [
          { id: "faith", title: "Book of Revelation", hadithCount: 7, collectionSlug: "sahih-bukhari", bookNumber: 1 },
          { id: "belief", title: "Book of Belief", hadithCount: 51, collectionSlug: "sahih-bukhari", bookNumber: 2 },
          { id: "knowledge", title: "Book of Knowledge", hadithCount: 76, collectionSlug: "sahih-bukhari", bookNumber: 3 },
        ],
      },
      {
        id: "purification",
        title: "Purification & Prayer",
        description: "Learn the prophetic guidance on cleanliness and establishing prayer",
        lessons: [
          { id: "wudu", title: "The Book on Purification", hadithCount: 148, collectionSlug: "jami-tirmidhi", bookNumber: 1 },
          { id: "salah", title: "The Book on Salat", hadithCount: 423, collectionSlug: "jami-tirmidhi", bookNumber: 2 },
          { id: "friday", title: "The Book on Friday Prayer", hadithCount: 83, collectionSlug: "jami-tirmidhi", bookNumber: 4 },
        ],
      },
      {
        id: "character",
        title: "Prophetic Character",
        description: "Explore the Prophet's exemplary conduct and manners",
        lessons: [
          { id: "manners", title: "Book of Good Manners", hadithCount: 56, collectionSlug: "sahih-bukhari", bookNumber: 78 },
          { id: "kindness", title: "Book of Companions", hadithCount: 34, collectionSlug: "sahih-bukhari", bookNumber: 62 },
        ],
      },
    ],
  },
  {
    id: "daily-practice",
    title: "Daily Practice",
    subtitle: "Practical Guidance",
    description:
      "Hadiths that guide your everyday life, from morning supplications to eating etiquette, sleeping habits, and interactions with others.",
    icon: Star,
    color: "text-[#C5A059]",
    bgColor: "bg-[#C5A059]/10",
    borderColor: "border-[#C5A059]/30",
    level: "Beginner-Intermediate",
    isPremium: false,
    modules: [
      {
        id: "food-drink",
        title: "Food, Drink & Hospitality",
        description: "Prophetic etiquettes of eating, drinking, and hosting guests",
        lessons: [
          { id: "food", title: "Book of Foods", hadithCount: 70, collectionSlug: "sahih-bukhari", bookNumber: 70 },
          { id: "drinks", title: "Book of Drinks", hadithCount: 45, collectionSlug: "sahih-bukhari", bookNumber: 74 },
          { id: "meals-t", title: "Chapters on Food", hadithCount: 60, collectionSlug: "jami-tirmidhi", bookNumber: 26 },
        ],
      },
      {
        id: "duas",
        title: "Supplications & Remembrance",
        description: "Daily duas and adhkar from the Sunnah",
        lessons: [
          { id: "duas-t", title: "Chapters on Supplications", hadithCount: 131, collectionSlug: "jami-tirmidhi", bookNumber: 49 },
          { id: "invocations", title: "Book of Invocations", hadithCount: 68, collectionSlug: "sahih-bukhari", bookNumber: 80 },
        ],
      },
      {
        id: "dealings",
        title: "Business & Social Ethics",
        description: "Islamic principles of trade, transactions, and social conduct",
        lessons: [
          { id: "sales", title: "Book of Sales", hadithCount: 195, collectionSlug: "sahih-bukhari", bookNumber: 34 },
          { id: "business-t", title: "Chapters on Business", hadithCount: 75, collectionSlug: "jami-tirmidhi", bookNumber: 12 },
        ],
      },
    ],
  },
  {
    id: "hadith-sciences",
    title: "Hadith Sciences",
    subtitle: "Mustalah al-Hadith",
    description:
      "Understand the methodology behind hadith authentication: chains of narration (isnad), narrator reliability, and hadith classification.",
    icon: GraduationCap,
    color: "text-[#3b82f6]",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    level: "Intermediate",
    isPremium: true,
    modules: [
      {
        id: "classification",
        title: "Hadith Classification",
        description: "Understanding Sahih, Hasan, Da'if, and Mawdu' categories",
        lessons: [
          { id: "sahih-intro", title: "What Makes a Hadith Sahih?", hadithCount: 20, collectionSlug: "sahih-bukhari" },
          { id: "hasan-intro", title: "The Hasan Category", hadithCount: 20, collectionSlug: "jami-tirmidhi" },
          { id: "grades", title: "Understanding Grading", hadithCount: 15, collectionSlug: "sunan-abu-dawud" },
        ],
      },
      {
        id: "narrators",
        title: "Science of Narrators",
        description: "Study of narrator chains and their reliability assessment",
        lessons: [
          { id: "isnad", title: "Chain of Narration Basics", hadithCount: 25, collectionSlug: "sahih-muslim" },
          { id: "rijal", title: "Narrator Biographies", hadithCount: 20, collectionSlug: "sahih-bukhari" },
        ],
      },
    ],
  },
  {
    id: "comparative",
    title: "Comparative Study",
    subtitle: "Cross-Collection Analysis",
    description:
      "Study the same topics across multiple collections to see how different scholars compiled and organized the prophetic traditions.",
    icon: Trophy,
    color: "text-[#7c3aed]",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    level: "Advanced",
    isPremium: true,
    modules: [
      {
        id: "six-books",
        title: "The Six Major Collections",
        description: "Compare how the Kutub al-Sittah approach the same hadith material",
        lessons: [
          { id: "bukhari-study", title: "Sahih al-Bukhari Overview", hadithCount: 50, collectionSlug: "sahih-bukhari" },
          { id: "muslim-study", title: "Sahih Muslim Overview", hadithCount: 50, collectionSlug: "sahih-muslim" },
          { id: "tirmidhi-study", title: "Jami at-Tirmidhi Overview", hadithCount: 50, collectionSlug: "jami-tirmidhi" },
          { id: "abu-dawud-study", title: "Sunan Abu Dawud Overview", hadithCount: 50, collectionSlug: "sunan-abu-dawud" },
          { id: "nasai-study", title: "Sunan an-Nasai Overview", hadithCount: 50, collectionSlug: "sunan-nasai" },
          { id: "ibn-majah-study", title: "Sunan Ibn Majah Overview", hadithCount: 50, collectionSlug: "sunan-ibn-majah" },
        ],
      },
    ],
  },
]

export default function LearnPage() {
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()
  const { isPremium } = useSubscription()
  const [expandedPath, setExpandedPath] = useState<string | null>("foundations")
  const [collectionStats, setCollectionStats] = useState<Record<string, number>>({})
  const [bookIdMap, setBookIdMap] = useState<Record<string, string>>({})

  useEffect(() => {
    async function loadStats() {
      const { data } = await supabase.from("collections").select("slug, total_hadiths")
      if (data) {
        const stats: Record<string, number> = {}
        for (const c of data) stats[c.slug] = c.total_hadiths
        setCollectionStats(stats)
      }

      // Pre-load book IDs for deep-linking
      const { data: books } = await supabase
        .from("books")
        .select("id, number, collection:collections!collection_id(slug)")

      if (books) {
        const map: Record<string, string> = {}
        for (const b of books) {
          const collSlug = (b.collection as { slug: string } | null)?.slug
          if (collSlug) {
            map[`${collSlug}:${b.number}`] = b.id
          }
        }
        setBookIdMap(map)
      }
    }
    loadStats()
  }, [supabase])

  const totalLessons = (path: LearningPath) => path.modules.reduce((sum, m) => sum + m.lessons.length, 0)
  const totalHadiths = (path: LearningPath) =>
    path.modules.reduce((sum, m) => sum + m.lessons.reduce((s, l) => s + l.hadithCount, 0), 0)

  return (
    <div className="min-h-screen marble-bg pb-20 md:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[#e5e7eb] bg-[#F8F6F2]/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-[#F8F6F2] border border-[#e5e7eb] flex items-center justify-center hover:border-[#C5A059] transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-[#6b7280]" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-[#1a1f36]">Learning Paths</h1>
            <p className="text-xs text-muted-foreground">Structured hadith study</p>
          </div>
        </div>
      </header>

      {/* Intro */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Follow a structured path through the hadith collections. Each path is organized into modules and
          lessons, drawing from authentic narrations across multiple collections.
        </p>
        {Object.keys(collectionStats).length > 0 && (
          <div className="flex gap-3 mt-4 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
            <div className="flex-shrink-0 px-3 py-1.5 rounded-full bg-[#1B5E43]/10 text-[#1B5E43] text-xs font-medium">
              {Object.values(collectionStats)
                .reduce((a, b) => a + b, 0)
                .toLocaleString()}{" "}
              hadiths available
            </div>
            <div className="flex-shrink-0 px-3 py-1.5 rounded-full bg-[#C5A059]/10 text-[#C5A059] text-xs font-medium">
              {Object.keys(collectionStats).length} collections
            </div>
            <div className="flex-shrink-0 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-medium">
              4 learning paths
            </div>
          </div>
        )}
      </section>

      {/* Learning Paths */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col gap-4">
        {LEARNING_PATHS.map((path) => {
          const isExpanded = expandedPath === path.id
          const Icon = path.icon

          return (
            <div
              key={path.id}
              className={cn(
                "rounded-xl border transition-all overflow-hidden",
                isExpanded ? path.borderColor + " shadow-md" : "border-[#e5e7eb]",
              )}
            >
              {/* Path Header */}
              <button
                onClick={() => setExpandedPath(isExpanded ? null : path.id)}
                className="w-full p-4 flex items-start gap-4 text-left premium-card"
              >
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", path.bgColor)}>
                  <Icon className={cn("w-6 h-6", path.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={cn("text-[10px] font-bold uppercase tracking-wider", path.color)}>
                      {path.subtitle}
                    </span>
                    {path.isPremium && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#C5A059]/10 text-[10px] font-medium text-[#C5A059]">
                        <Lock className="w-2.5 h-2.5" /> Premium
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-semibold text-[#1a1f36] truncate">{path.title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      {totalLessons(path)} lessons
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {totalHadiths(path).toLocaleString()} hadiths
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#f3f4f6] text-[10px] font-medium">
                      {path.level}
                    </span>
                  </div>
                </div>
                <ChevronRight
                  className={cn(
                    "w-5 h-5 text-muted-foreground shrink-0 transition-transform mt-1",
                    isExpanded && "rotate-90",
                  )}
                />
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-[#e5e7eb]">
                  <p className="text-xs text-muted-foreground py-3 leading-relaxed">{path.description}</p>

                  {/* Premium gate */}
                  {path.isPremium && !isPremium ? (
                    <PremiumGate featureName={path.title} />
                  ) : (
                    <div className="flex flex-col gap-3">
                      {path.modules.map((mod, modIdx) => (
                        <div key={mod.id} className="rounded-lg border border-[#e5e7eb] overflow-hidden">
                          {/* Module Header */}
                          <div className="px-3 py-2.5 bg-[#f9fafb]">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-muted-foreground uppercase">
                                Module {modIdx + 1}
                              </span>
                            </div>
                            <h4 className="text-sm font-semibold text-[#1a1f36] mt-0.5">{mod.title}</h4>
                            <p className="text-xs text-muted-foreground mt-0.5">{mod.description}</p>
                          </div>

                          {/* Lessons */}
                          <div className="divide-y divide-[#f3f4f6]">
                            {mod.lessons.map((lesson) => (
                              <button
                                key={lesson.id}
                                onClick={() => {
                                  if (lesson.bookNumber) {
                                    const bookId = bookIdMap[`${lesson.collectionSlug}:${lesson.bookNumber}`]
                                    if (bookId) {
                                      router.push(`/collections/${lesson.collectionSlug}/books/${bookId}`)
                                    } else {
                                      router.push(`/collections/${lesson.collectionSlug}`)
                                    }
                                  } else {
                                    router.push(`/collections/${lesson.collectionSlug}`)
                                  }
                                }}
                                className="w-full px-3 py-2.5 flex items-center gap-3 hover:bg-[#f9fafb] transition-colors text-left"
                              >
                                <div className="w-6 h-6 rounded-full border border-[#e5e7eb] flex items-center justify-center shrink-0">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground/30" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-[#1a1f36] truncate">{lesson.title}</p>
                                  <p className="text-[10px] text-muted-foreground">
                                    {lesson.hadithCount} hadiths
                                  </p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </main>

      <BottomNavigation />
    </div>
  )
}
