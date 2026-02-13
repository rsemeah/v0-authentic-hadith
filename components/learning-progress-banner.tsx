"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { CheckCircle2, BookOpen, ArrowRight, ChevronRight, Clock, StickyNote } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { PathCompletionModal } from "@/components/path-completion-modal"

interface NextLessonInfo {
  id: string
  title: string
  path_id: string
  collection_slug: string | null
  book_number: number | null
}

export function LearningProgressBanner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const lpLesson = searchParams.get("lpLesson")
  const lpPath = searchParams.get("lpPath")
  const [marking, setMarking] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [lessonTitle, setLessonTitle] = useState<string | null>(null)
  const [pathTitle, setPathTitle] = useState<string | null>(null)
  const [estimatedMin, setEstimatedMin] = useState<number | null>(null)
  const [nextLesson, setNextLesson] = useState<NextLessonInfo | null>(null)
  const [pathCompleted, setPathCompleted] = useState(false)
  const [totalLessons, setTotalLessons] = useState(0)
  const [showNote, setShowNote] = useState(false)
  const [noteText, setNoteText] = useState("")
  const [noteSaved, setNoteSaved] = useState(false)
  const markedInProgress = useRef(false)

  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    if (!lpLesson || !lpPath) return

    async function loadMeta() {
      // Fetch lesson meta
      const { data: lesson } = await supabase
        .from("learning_path_lessons")
        .select("title, estimated_minutes, order_index, path_id, collection_slug, book_number")
        .eq("id", lpLesson!)
        .single()

      if (lesson) {
        setLessonTitle(lesson.title)
        setEstimatedMin(lesson.estimated_minutes)
      }

      // Fetch path title
      const { data: path } = await supabase
        .from("learning_paths")
        .select("title")
        .eq("id", lpPath!)
        .single()

      if (path) setPathTitle(path.title)

      // Fetch all lessons to find next one
      const { data: allLessons } = await supabase
        .from("learning_path_lessons")
        .select("id, title, order_index, path_id, collection_slug, book_number")
        .eq("path_id", lpPath!)
        .order("order_index", { ascending: true })

      if (allLessons) {
        setTotalLessons(allLessons.length)
        const currentIdx = allLessons.findIndex((l) => l.id === lpLesson)
        if (currentIdx >= 0 && currentIdx < allLessons.length - 1) {
          setNextLesson(allLessons[currentIdx + 1])
        }
      }

      // Load existing note
      const { data: auth } = await supabase.auth.getUser()
      if (auth.user) {
        const { data: note } = await supabase
          .from("user_lesson_notes")
          .select("note_text")
          .eq("user_id", auth.user.id)
          .eq("lesson_id", lpLesson!)
          .maybeSingle()

        if (note?.note_text) {
          setNoteText(note.note_text)
        }
      }
    }

    loadMeta()
  }, [lpLesson, lpPath, supabase])

  // Mark as in_progress on mount
  useEffect(() => {
    if (!lpLesson || !lpPath || markedInProgress.current) return
    markedInProgress.current = true

    async function markInProgress() {
      const { data: auth } = await supabase.auth.getUser()
      if (!auth.user) return

      const nowIso = new Date().toISOString()
      await supabase.from("user_lesson_progress").upsert(
        {
          user_id: auth.user.id,
          path_id: lpPath!,
          lesson_id: lpLesson!,
          state: "in_progress",
          progress_percent: 50,
          started_at: nowIso,
        },
        { onConflict: "user_id,lesson_id" }
      )
      await supabase.from("user_learning_path_progress").upsert(
        {
          user_id: auth.user.id,
          path_id: lpPath!,
          last_lesson_id: lpLesson!,
          last_activity_at: nowIso,
          status: "active",
        },
        { onConflict: "user_id,path_id" }
      )

      // Log event
      await supabase.from("learning_events").insert({
        user_id: auth.user.id,
        event_type: "lesson_started",
        payload: { path_id: lpPath, lesson_id: lpLesson, lesson_title: lessonTitle },
      }).catch(() => {})
    }

    markInProgress()
  }, [lpLesson, lpPath, supabase, lessonTitle])

  if (!lpLesson || !lpPath) return null

  const handleMarkComplete = async () => {
    setMarking(true)
    try {
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

      // Log event
      await supabase.from("learning_events").insert({
        user_id: auth.user.id,
        event_type: "lesson_completed",
        payload: { path_id: lpPath, lesson_id: lpLesson, lesson_title: lessonTitle },
      }).catch(() => {})

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

      const isPathComplete =
        allLessons &&
        completedLessons &&
        allLessons.length > 0 &&
        completedLessons.length >= allLessons.length

      if (isPathComplete) {
        await supabase
          .from("user_learning_path_progress")
          .update({ status: "completed", completed_at: nowIso })
          .eq("user_id", auth.user.id)
          .eq("path_id", lpPath)

        // Log path completion event
        await supabase.from("learning_events").insert({
          user_id: auth.user.id,
          event_type: "path_completed",
          payload: { path_id: lpPath, path_title: pathTitle },
        }).catch(() => {})

        setPathCompleted(true)
      }

      setCompleted(true)
    } catch (err) {
      console.error("Failed to mark lesson complete:", err)
    } finally {
      setMarking(false)
    }
  }

  const handleNavigateNext = () => {
    if (!nextLesson) return
    if (nextLesson.book_number && nextLesson.collection_slug) {
      // We need to look up the book ID - for now navigate to collection
      router.push(
        `/collections/${nextLesson.collection_slug}?lpLesson=${nextLesson.id}&lpPath=${nextLesson.path_id}`
      )
    } else if (nextLesson.collection_slug) {
      router.push(
        `/collections/${nextLesson.collection_slug}?lpLesson=${nextLesson.id}&lpPath=${nextLesson.path_id}`
      )
    }
  }

  const handleSaveNote = async () => {
    if (!noteText.trim()) return
    const { data: auth } = await supabase.auth.getUser()
    if (!auth.user) return

    await supabase.from("user_lesson_notes").upsert(
      {
        user_id: auth.user.id,
        lesson_id: lpLesson,
        path_id: lpPath,
        note_text: noteText.trim(),
      },
      { onConflict: "user_id,lesson_id" }
    )

    // Log event
    await supabase.from("learning_events").insert({
      user_id: auth.user.id,
      event_type: "note_saved",
      payload: { path_id: lpPath, lesson_id: lpLesson },
    }).catch(() => {})

    setNoteSaved(true)
    setTimeout(() => setNoteSaved(false), 2000)
  }

  return (
    <>
      {/* Path completion celebration */}
      {pathCompleted && pathTitle && (
        <PathCompletionModal
          pathTitle={pathTitle}
          totalLessons={totalLessons}
          onClose={() => setPathCompleted(false)}
        />
      )}

      <div
        className={cn(
          "mx-4 sm:mx-6 mt-4 rounded-lg border transition-colors",
          completed
            ? "border-[#1B5E43]/30 bg-[#1B5E43]/5"
            : "border-[#C5A059]/30 bg-[#C5A059]/5"
        )}
      >
        {/* Main banner row */}
        <div className="p-3 flex items-center gap-3">
          <BookOpen className={cn("w-5 h-5 shrink-0", completed ? "text-[#1B5E43]" : "text-[#C5A059]")} />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground">
              {completed ? "Lesson completed!" : `${lessonTitle ?? "Loading..."}`}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {pathTitle ?? "Learning Path"}
              {estimatedMin && !completed && (
                <span className="inline-flex items-center gap-0.5 ml-2">
                  <Clock className="w-2.5 h-2.5 inline" />
                  ~{estimatedMin} min
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {/* Note toggle */}
            <button
              onClick={() => setShowNote(!showNote)}
              className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center transition-colors",
                showNote ? "bg-[#C5A059]/20 text-[#C5A059]" : "bg-muted text-muted-foreground hover:text-foreground"
              )}
              title="Add note"
            >
              <StickyNote className="w-3.5 h-3.5" />
            </button>

            {completed ? (
              nextLesson ? (
                <button
                  onClick={handleNavigateNext}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium text-white bg-[#1B5E43] hover:bg-[#164a36] transition-colors"
                >
                  Next Lesson
                  <ChevronRight className="w-3 h-3" />
                </button>
              ) : (
                <button
                  onClick={() => router.push("/learn")}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium text-[#1B5E43] border border-[#1B5E43]/30 hover:bg-[#1B5E43]/10 transition-colors"
                >
                  <ArrowRight className="w-3 h-3" />
                  All Paths
                </button>
              )
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

        {/* Notes section */}
        {showNote && (
          <div className="px-3 pb-3 border-t border-border/50">
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Add a personal note about this lesson..."
              className="w-full mt-2 p-2 text-xs rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground resize-none"
              rows={3}
            />
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-[10px] text-muted-foreground">
                {noteSaved ? "Saved!" : "Notes are private and sync across devices"}
              </span>
              <button
                onClick={handleSaveNote}
                disabled={!noteText.trim()}
                className="text-xs font-medium text-[#C5A059] hover:text-[#B8934D] disabled:opacity-40"
              >
                Save Note
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
