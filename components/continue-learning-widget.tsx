"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { BookOpen, ChevronRight, Play } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

interface ActivePath {
  path_id: string
  path_slug: string
  path_title: string
  path_color: string | null
  path_bg_color: string | null
  path_icon: string | null
  percent: number
  completedCount: number
  total: number
  next_lesson_title: string | null
  next_lesson_id: string | null
  last_activity_at: string | null
}

export function ContinueLearningWidget() {
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()
  const [activePath, setActivePath] = useState<ActivePath | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: auth } = await supabase.auth.getUser()
      if (!auth.user) {
        setLoading(false)
        return
      }

      // Get the most recently active path
      const { data: pathProgress } = await supabase
        .from("user_learning_path_progress")
        .select("path_id, status, last_lesson_id, last_activity_at")
        .eq("user_id", auth.user.id)
        .eq("status", "active")
        .order("last_activity_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      if (!pathProgress) {
        setLoading(false)
        return
      }

      // Get path details
      const { data: path } = await supabase
        .from("learning_paths")
        .select("slug, title, color, bg_color, icon")
        .eq("id", pathProgress.path_id)
        .single()

      if (!path) {
        setLoading(false)
        return
      }

      // Get all lessons for this path
      const { data: lessons } = await supabase
        .from("learning_path_lessons")
        .select("id, title")
        .eq("path_id", pathProgress.path_id)
        .order("order_index", { ascending: true })

      // Get completed lessons
      const { data: completed } = await supabase
        .from("user_lesson_progress")
        .select("lesson_id")
        .eq("user_id", auth.user.id)
        .eq("path_id", pathProgress.path_id)
        .eq("state", "completed")

      const completedIds = new Set((completed ?? []).map((c) => c.lesson_id))
      const total = lessons?.length ?? 0
      const completedCount = completedIds.size
      const percent = total ? Math.round((completedCount / total) * 100) : 0

      // Find next uncompleted lesson
      let nextLesson = null
      if (lessons) {
        const lastIdx = lessons.findIndex((l) => l.id === pathProgress.last_lesson_id)
        for (let i = lastIdx + 1; i < lessons.length; i++) {
          if (!completedIds.has(lessons[i].id)) {
            nextLesson = lessons[i]
            break
          }
        }
        if (!nextLesson) {
          nextLesson = lessons.find((l) => !completedIds.has(l.id)) ?? null
        }
      }

      setActivePath({
        path_id: pathProgress.path_id,
        path_slug: path.slug,
        path_title: path.title,
        path_color: path.color,
        path_bg_color: path.bg_color,
        path_icon: path.icon,
        percent,
        completedCount,
        total,
        next_lesson_title: nextLesson?.title ?? null,
        next_lesson_id: nextLesson?.id ?? null,
        last_activity_at: pathProgress.last_activity_at,
      })
      setLoading(false)
    }
    load()
  }, [supabase])

  if (loading || !activePath) return null

  const timeAgo = activePath.last_activity_at
    ? getRelativeTime(activePath.last_activity_at)
    : null

  return (
    <div
      className="rounded-xl border border-[#C5A059]/20 bg-gradient-to-r from-[#C5A059]/5 to-transparent p-4 cursor-pointer hover:border-[#C5A059]/40 transition-colors"
      onClick={() => router.push("/learn")}
    >
      <div className="flex items-center gap-3">
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", activePath.path_bg_color ?? "bg-[#C5A059]/10")}>
          <BookOpen className={cn("w-5 h-5", activePath.path_color ?? "text-[#C5A059]")} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground truncate">
              Continue: {activePath.path_title}
            </h3>
            {timeAgo && (
              <span className="text-[10px] text-muted-foreground shrink-0">{timeAgo}</span>
            )}
          </div>
          {activePath.next_lesson_title && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              Next: {activePath.next_lesson_title}
            </p>
          )}
          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-[#C5A059] transition-all"
                style={{ width: `${activePath.percent}%` }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground shrink-0">
              {activePath.completedCount}/{activePath.total}
            </span>
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-[#C5A059] flex items-center justify-center shrink-0">
          <Play className="w-3.5 h-3.5 text-white ml-0.5" />
        </div>
      </div>
    </div>
  )
}

function getRelativeTime(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = now - then
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return "yesterday"
  if (days < 7) return `${days}d ago`
  return `${Math.floor(days / 7)}w ago`
}
