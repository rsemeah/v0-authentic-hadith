"use client"

import { useSearchParams } from "next/navigation"
import { useState } from "react"
import { CheckCircle2, BookOpen, ArrowLeft } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import Link from "next/link"

export function LearningProgressBanner() {
  const searchParams = useSearchParams()
  const lpLesson = searchParams.get("lpLesson")
  const lpPath = searchParams.get("lpPath")
  const [marking, setMarking] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [lessonTitle, setLessonTitle] = useState<string | null>(null)

  if (!lpLesson || !lpPath) return null

  // Fetch lesson title on first render
  if (lessonTitle === null) {
    const supabase = getSupabaseBrowserClient()
    supabase
      .from("learning_path_lessons")
      .select("title")
      .eq("id", lpLesson)
      .single()
      .then(({ data }) => {
        setLessonTitle(data?.title ?? "this lesson")
      })
  }

  const handleMarkComplete = async () => {
    setMarking(true)
    try {
      const supabase = getSupabaseBrowserClient()
      const { data: auth } = await supabase.auth.getUser()
      if (!auth.user) return

      const nowIso = new Date().toISOString()

      // Mark lesson complete
      await supabase.from("user_lesson_progress").upsert(
        {
          user_id: auth.user.id,
          path_id: lpPath,
          lesson_id: lpLesson,
          state: "completed",
          progress_percent: 100,
          completed_at: nowIso,
          started_at: nowIso,
        },
        { onConflict: "user_id,lesson_id" }
      )

      // Update path progress
      await supabase.from("user_learning_path_progress").upsert(
        {
          user_id: auth.user.id,
          path_id: lpPath,
          last_lesson_id: lpLesson,
          last_activity_at: nowIso,
          status: "active",
        },
        { onConflict: "user_id,path_id" }
      )

      // Check if all lessons complete
      const { data: allLessons } = await supabase
        .from("learning_path_lessons")
        .select("id")
        .eq("path_id", lpPath)

      const { data: completedLessons } = await supabase
        .from("user_lesson_progress")
        .select("lesson_id")
        .eq("user_id", auth.user.id)
        .eq("path_id", lpPath)
        .eq("state", "completed")

      if (
        allLessons &&
        completedLessons &&
        allLessons.length > 0 &&
        completedLessons.length >= allLessons.length
      ) {
        await supabase
          .from("user_learning_path_progress")
          .update({ status: "completed", completed_at: nowIso })
          .eq("user_id", auth.user.id)
          .eq("path_id", lpPath)
      }

      setCompleted(true)
    } catch (err) {
      console.error("Failed to mark lesson complete:", err)
    } finally {
      setMarking(false)
    }
  }

  // Also mark lesson as in_progress on mount
  if (!completed && lessonTitle !== null) {
    const supabase = getSupabaseBrowserClient()
    supabase.auth.getUser().then(({ data: auth }) => {
      if (!auth.user) return
      const nowIso = new Date().toISOString()
      supabase.from("user_lesson_progress").upsert(
        {
          user_id: auth.user.id,
          path_id: lpPath,
          lesson_id: lpLesson,
          state: "in_progress",
          progress_percent: 50,
          started_at: nowIso,
        },
        { onConflict: "user_id,lesson_id" }
      )
      supabase.from("user_learning_path_progress").upsert(
        {
          user_id: auth.user.id,
          path_id: lpPath,
          last_lesson_id: lpLesson,
          last_activity_at: nowIso,
          status: "active",
        },
        { onConflict: "user_id,path_id" }
      )
    })
  }

  return (
    <div
      className={cn(
        "mx-4 sm:mx-6 mt-4 rounded-lg border p-3 flex items-center gap-3 transition-colors",
        completed
          ? "border-[#1B5E43]/30 bg-[#1B5E43]/5"
          : "border-[#C5A059]/30 bg-[#C5A059]/5"
      )}
    >
      <BookOpen className={cn("w-5 h-5 shrink-0", completed ? "text-[#1B5E43]" : "text-[#C5A059]")} />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">
          {completed ? "Lesson completed!" : `Learning Path: ${lessonTitle ?? "Loading..."}`}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {completed ? (
          <Link
            href="/learn"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium text-[#1B5E43] border border-[#1B5E43]/30 hover:bg-[#1B5E43]/10 transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to Paths
          </Link>
        ) : (
          <button
            onClick={handleMarkComplete}
            disabled={marking}
            className={cn(
              "inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium text-white transition-colors",
              marking ? "bg-[#C5A059]/50" : "bg-[#C5A059] hover:bg-[#B8934D]"
            )}
          >
            <CheckCircle2 className="w-3 h-3" />
            {marking ? "Saving..." : "Mark Complete"}
          </button>
        )}
      </div>
    </div>
  )
}
