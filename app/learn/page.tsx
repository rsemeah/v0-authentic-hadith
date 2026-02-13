"use client"

import React, { useCallback } from "react"
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
  Play,
  RotateCcw,
} from "lucide-react"

import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useSubscription } from "@/hooks/use-subscription"
import { PremiumGate } from "@/components/premium-gate"
import { cn } from "@/lib/utils"

// Icon map for DB-stored icon names
const ICON_MAP: Record<string, React.ElementType> = {
  BookOpen,
  Star,
  GraduationCap,
  Trophy,
}

interface DBPath {
  id: string
  slug: string
  title: string
  subtitle: string | null
  description: string | null
  icon: string | null
  color: string | null
  bg_color: string | null
  border_color: string | null
  level: string | null
  is_premium: boolean
  sort_order: number
}

interface DBLesson {
  id: string
  path_id: string
  module_id: string
  module_title: string
  module_description: string | null
  slug: string
  title: string
  order_index: number
  collection_slug: string | null
  book_number: number | null
  hadith_count: number
}

interface LessonProgress {
  lesson_id: string
  state: string
  progress_percent: number
}

interface PathProgress {
  path_id: string
  status: string
  last_lesson_id: string | null
  last_activity_at: string | null
}

interface Module {
  id: string
  title: string
  description: string | null
  lessons: (DBLesson & { progress: LessonProgress | null })[]
}

export default function LearnPage() {
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()
  const { isPremium } = useSubscription()
  const [expandedPath, setExpandedPath] = useState<string | null>(null)
  const [paths, setPaths] = useState<DBPath[]>([])
  const [lessonsByPath, setLessonsByPath] = useState<Record<string, DBLesson[]>>({})
  const [lessonProgress, setLessonProgress] = useState<Map<string, LessonProgress>>(new Map())
  const [pathProgress, setPathProgress] = useState<Map<string, PathProgress>>(new Map())
  const [collectionStats, setCollectionStats] = useState<Record<string, number>>({})
  const [bookIdMap, setBookIdMap] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      // Get user
      const { data: auth } = await supabase.auth.getUser()
      const uid = auth.user?.id ?? null
      setUserId(uid)

      // Fetch paths
      const { data: pathData } = await supabase
        .from("learning_paths")
        .select("*")
        .eq("is_published", true)
        .order("sort_order", { ascending: true })

      if (pathData) {
        setPaths(pathData)
        // Auto-expand first path
        if (pathData.length > 0) setExpandedPath(pathData[0].slug)
      }

      // Fetch all lessons
      const pathIds = (pathData ?? []).map((p: DBPath) => p.id)
      if (pathIds.length > 0) {
        const { data: lessonData } = await supabase
          .from("learning_path_lessons")
          .select("*")
          .in("path_id", pathIds)
          .order("order_index", { ascending: true })

        if (lessonData) {
          const grouped: Record<string, DBLesson[]> = {}
          for (const l of lessonData) {
            if (!grouped[l.path_id]) grouped[l.path_id] = []
            grouped[l.path_id].push(l)
          }
          setLessonsByPath(grouped)
        }

        // Fetch user progress
        if (uid) {
          const { data: ppData } = await supabase
            .from("user_learning_path_progress")
            .select("path_id, status, last_lesson_id, last_activity_at")
            .eq("user_id", uid)
            .in("path_id", pathIds)

          if (ppData) {
            setPathProgress(new Map(ppData.map((p) => [p.path_id, p])))
          }

          const { data: lpData } = await supabase
            .from("user_lesson_progress")
            .select("lesson_id, state, progress_percent")
            .eq("user_id", uid)
            .in("path_id", pathIds)

          if (lpData) {
            setLessonProgress(new Map(lpData.map((p) => [p.lesson_id, p])))
          }
        }
      }

      // Collection stats
      const { data: colData } = await supabase.from("collections").select("slug, total_hadiths")
      if (colData) {
        const stats: Record<string, number> = {}
        for (const c of colData) stats[c.slug] = c.total_hadiths
        setCollectionStats(stats)
      }

      // Book IDs for deep-linking
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

      setLoading(false)
    }
    load()
  }, [supabase])

  const getModules = useCallback((pathId: string): Module[] => {
    const lessons = lessonsByPath[pathId] ?? []
    const moduleMap = new Map<string, Module>()
    for (const l of lessons) {
      if (!moduleMap.has(l.module_id)) {
        moduleMap.set(l.module_id, {
          id: l.module_id,
          title: l.module_title,
          description: l.module_description,
          lessons: [],
        })
      }
      moduleMap.get(l.module_id)!.lessons.push({
        ...l,
        progress: lessonProgress.get(l.id) ?? null,
      })
    }
    return Array.from(moduleMap.values())
  }, [lessonsByPath, lessonProgress])

  const totalLessons = (pathId: string) => (lessonsByPath[pathId] ?? []).length
  const totalHadiths = (pathId: string) =>
    (lessonsByPath[pathId] ?? []).reduce((sum, l) => sum + l.hadith_count, 0)
  const estimatedTimeRemaining = (pathId: string) => {
    const lessons = lessonsByPath[pathId] ?? []
    const remaining = lessons.filter((l) => lessonProgress.get(l.id)?.state !== "completed")
    const totalMin = remaining.reduce((sum, l) => sum + (l.hadith_count * 2 || 10), 0)
    if (totalMin < 60) return `~${totalMin} min`
    const hours = Math.round(totalMin / 60)
    return `~${hours}h`
  }

  const getPathPercent = (pathId: string) => {
    const lessons = lessonsByPath[pathId] ?? []
    if (lessons.length === 0) return 0
    const completed = lessons.filter((l) => lessonProgress.get(l.id)?.state === "completed").length
    return Math.round((completed / lessons.length) * 100)
  }

  const getResumeLesson = (pathId: string) => {
    const pp = pathProgress.get(pathId)
    const lessons = lessonsByPath[pathId] ?? []
    if (pp?.last_lesson_id) {
      // Find the next uncompleted lesson after last_lesson_id
      const lastIdx = lessons.findIndex((l) => l.id === pp.last_lesson_id)
      for (let i = lastIdx + 1; i < lessons.length; i++) {
        if (lessonProgress.get(lessons[i].id)?.state !== "completed") {
          return lessons[i]
        }
      }
      // If all after are completed, return first uncompleted
      return lessons.find((l) => lessonProgress.get(l.id)?.state !== "completed") ?? lessons[0]
    }
    return lessons.find((l) => lessonProgress.get(l.id)?.state !== "completed") ?? lessons[0]
  }

  const navigateToLesson = (lesson: DBLesson) => {
    if (lesson.book_number && lesson.collection_slug) {
      const bookId = bookIdMap[`${lesson.collection_slug}:${lesson.book_number}`]
      if (bookId) {
        router.push(`/collections/${lesson.collection_slug}/books/${bookId}?lpLesson=${lesson.id}&lpPath=${lesson.path_id}`)
      } else {
        router.push(`/collections/${lesson.collection_slug}?lpLesson=${lesson.id}&lpPath=${lesson.path_id}`)
      }
    } else if (lesson.collection_slug) {
      router.push(`/collections/${lesson.collection_slug}?lpLesson=${lesson.id}&lpPath=${lesson.path_id}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen marble-bg flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading learning paths...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen marble-bg pb-20 md:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center hover:border-[#C5A059] transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Learning Paths</h1>
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
              {paths.length} learning paths
            </div>
          </div>
        )}
      </section>

      {/* Learning Paths */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col gap-4">
        {paths.map((path) => {
          const isExpanded = expandedPath === path.slug
          const Icon = ICON_MAP[path.icon ?? ""] ?? BookOpen
          const percent = getPathPercent(path.id)
          const pp = pathProgress.get(path.id)
          const resumeLesson = getResumeLesson(path.id)

          return (
            <div
              key={path.id}
              className={cn(
                "rounded-xl border transition-all overflow-hidden",
                isExpanded ? (path.border_color ?? "border-border") + " shadow-md" : "border-border",
              )}
            >
              {/* Path Header */}
              <button
                onClick={() => setExpandedPath(isExpanded ? null : path.slug)}
                className="w-full p-4 flex items-start gap-4 text-left premium-card"
              >
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", path.bg_color)}>
                  <Icon className={cn("w-6 h-6", path.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={cn("text-[10px] font-bold uppercase tracking-wider", path.color)}>
                      {path.subtitle}
                    </span>
                    {path.is_premium && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#C5A059]/10 text-[10px] font-medium text-[#C5A059]">
                        <Lock className="w-2.5 h-2.5" /> Premium
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-semibold text-foreground truncate">{path.title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      {totalLessons(path.id)} lessons
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {totalHadiths(path.id).toLocaleString()} hadiths
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-muted text-[10px] font-medium">
                      {path.level}
                    </span>
                  </div>

                  {/* Progress bar */}
                  {userId && pp && percent > 0 && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                        <span>{percent}% complete</span>
                        {pp.status === "completed" ? (
                          <span className="text-[#1B5E43] font-semibold">Completed</span>
                        ) : (
                          <span>{estimatedTimeRemaining(path.id)} remaining</span>
                        )}
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            pp.status === "completed" ? "bg-[#1B5E43]" : "bg-[#C5A059]"
                          )}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  )}
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
                <div className="px-4 pb-4 border-t border-border">
                  <p className="text-xs text-muted-foreground py-3 leading-relaxed">{path.description}</p>

                  {/* Resume button */}
                  {userId && pp && resumeLesson && pp.status !== "completed" && (
                    <button
                      onClick={() => navigateToLesson(resumeLesson)}
                      className={cn(
                        "w-full mb-3 px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-medium text-white transition-colors",
                        "bg-[#C5A059] hover:bg-[#B8934D]"
                      )}
                    >
                      <Play className="w-4 h-4" />
                      Resume: {resumeLesson.title}
                    </button>
                  )}

                  {/* Completed: restart option */}
                  {userId && pp?.status === "completed" && resumeLesson && (
                    <button
                      onClick={() => navigateToLesson(lessonsByPath[path.id]?.[0] ?? resumeLesson)}
                      className="w-full mb-3 px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-medium border border-[#1B5E43] text-[#1B5E43] hover:bg-[#1B5E43]/5 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Review Path
                    </button>
                  )}

                  {/* Premium gate */}
                  {path.is_premium && !isPremium ? (
                    <PremiumGate featureName={path.title} />
                  ) : (
                    <div className="flex flex-col gap-3">
                      {getModules(path.id).map((mod, modIdx) => (
                        <div key={mod.id} className="rounded-lg border border-border overflow-hidden">
                          {/* Module Header */}
                          <div className="px-3 py-2.5 bg-muted/50">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-muted-foreground uppercase">
                                Module {modIdx + 1}
                              </span>
                            </div>
                            <h4 className="text-sm font-semibold text-foreground mt-0.5">{mod.title}</h4>
                            <p className="text-xs text-muted-foreground mt-0.5">{mod.description}</p>
                          </div>

                          {/* Lessons */}
                          <div className="divide-y divide-border/50">
                            {mod.lessons.map((lesson) => {
                              const lp = lesson.progress
                              const isCompleted = lp?.state === "completed"
                              const isInProgress = lp?.state === "in_progress"

                              return (
                                <button
                                  key={lesson.id}
                                  onClick={() => navigateToLesson(lesson)}
                                  className="w-full px-3 py-2.5 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left"
                                >
                                  <div
                                    className={cn(
                                      "w-6 h-6 rounded-full border flex items-center justify-center shrink-0",
                                      isCompleted
                                        ? "border-[#1B5E43] bg-[#1B5E43]"
                                        : isInProgress
                                          ? "border-[#C5A059] bg-[#C5A059]/10"
                                          : "border-border"
                                    )}
                                  >
                                    <CheckCircle2
                                      className={cn(
                                        "w-3.5 h-3.5",
                                        isCompleted
                                          ? "text-white"
                                          : isInProgress
                                            ? "text-[#C5A059]"
                                            : "text-muted-foreground/30"
                                      )}
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className={cn(
                                      "text-sm truncate",
                                      isCompleted ? "text-muted-foreground line-through" : "text-foreground"
                                    )}>
                                      {lesson.title}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">
                                      {lesson.hadith_count} hadiths
                                    </p>
                                  </div>
                                  <ChevronRight className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                                </button>
                              )
                            })}
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
    </div>
  )
}
