"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { GraduationCap, ChevronRight, BookOpen, CheckCircle2 } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

interface LearningPathProgress {
  path_id: string
  path_title: string
  path_slug: string
  path_icon: string | null
  total_lessons: number
  completed_lessons: number
  current_lesson_id: string | null
  current_lesson_title: string | null
}

export function ContinueLearningWidget() {
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()
  const [paths, setPaths] = useState<LearningPathProgress[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
          setLoading(false)
          return
        }

        // Fetch all learning paths with their modules and lessons
        const { data: pathsData } = await supabase
          .from("learning_paths")
          .select("id, title, slug, icon, sort_order")
          .eq("is_published", true)
          .order("sort_order")

        if (!pathsData || pathsData.length === 0) {
          setLoading(false)
          return
        }

        // Fetch all lessons
        const { data: lessons } = await supabase
          .from("learning_lessons")
          .select("id, title, module_id, sort_order")
          .order("sort_order")

        // Fetch all modules
        const { data: modules } = await supabase
          .from("learning_modules")
          .select("id, path_id, sort_order")
          .order("sort_order")

        // Fetch user progress
        const { data: progress } = await supabase
          .from("learning_progress")
          .select("lesson_id, completed")
          .eq("user_id", user.id)

        const completedSet = new Set(
          (progress || []).filter((p: { completed: boolean }) => p.completed).map((p: { lesson_id: string }) => p.lesson_id)
        )

        // Build path progress
        const pathProgress: LearningPathProgress[] = []
        for (const path of pathsData) {
          const pathModules = (modules || []).filter((m: { path_id: string }) => m.path_id === path.id)
          const moduleIds = new Set(pathModules.map((m: { id: string }) => m.id))
          const pathLessons = (lessons || []).filter((l: { module_id: string }) => moduleIds.has(l.module_id))
          const completedLessons = pathLessons.filter((l: { id: string }) => completedSet.has(l.id))

          // Find next uncompleted lesson
          let currentLesson = null
          for (const lesson of pathLessons) {
            if (!completedSet.has(lesson.id)) {
              currentLesson = lesson
              break
            }
          }

          if (pathLessons.length > 0) {
            pathProgress.push({
              path_id: path.id,
              path_title: path.title,
              path_slug: path.slug,
              path_icon: path.icon,
              total_lessons: pathLessons.length,
              completed_lessons: completedLessons.length,
              current_lesson_id: currentLesson?.id || null,
              current_lesson_title: currentLesson?.title || null,
            })
          }
        }

        // Sort: in-progress paths first, then not-started, then completed
        pathProgress.sort((a, b) => {
          const aStarted = a.completed_lessons > 0 && a.completed_lessons < a.total_lessons
          const bStarted = b.completed_lessons > 0 && b.completed_lessons < b.total_lessons
          if (aStarted && !bStarted) return -1
          if (!aStarted && bStarted) return 1
          return 0
        })

        setPaths(pathProgress.slice(0, 3))
      } catch {
        // Failed to load
      }
      setLoading(false)
    }
    load()
  }, [supabase])

  if (loading || paths.length === 0) return null

  return (
    <section className="pb-6 md:pb-8" aria-label="Continue Learning">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-[#1B5E43]" />
          <h2 className="text-lg font-bold text-foreground">Continue Learning</h2>
        </div>
        <button
          onClick={() => router.push("/learn")}
          className="text-xs font-medium text-[#C5A059] hover:text-[#8A6E3A] transition-colors flex items-center gap-1"
        >
          View all
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {paths.map((path) => {
          const progressPercent =
            path.total_lessons > 0
              ? Math.round((path.completed_lessons / path.total_lessons) * 100)
              : 0
          const isCompleted = path.completed_lessons === path.total_lessons

          return (
            <button
              key={path.path_id}
              onClick={() =>
                path.current_lesson_id
                  ? router.push(`/learn/lesson/${path.current_lesson_id}`)
                  : router.push("/learn")
              }
              className="w-full premium-card rounded-xl p-4 text-left hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "w-11 h-11 rounded-xl flex items-center justify-center shrink-0",
                    isCompleted ? "bg-[#1B5E43]/10" : "bg-[#1B5E43]/10"
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-[#1B5E43]" />
                  ) : (
                    <BookOpen className="w-5 h-5 text-[#1B5E43]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground group-hover:text-[#1B5E43] transition-colors truncate">
                    {path.path_title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {isCompleted
                      ? "Completed"
                      : path.current_lesson_title
                        ? `Next: ${path.current_lesson_title}`
                        : `${path.completed_lessons}/${path.total_lessons} lessons`}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-[#C5A059] transition-colors shrink-0" />
              </div>

              <div className="mt-3 flex items-center gap-3">
                <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#1B5E43] to-[#2D7A5B] transition-all"
                    style={{ width: `${Math.max(progressPercent, isCompleted ? 100 : 1)}%` }}
                  />
                </div>
                <span className="text-[10px] font-medium text-[#1B5E43]">
                  {progressPercent}%
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
