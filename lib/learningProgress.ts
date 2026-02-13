"use server"

import { getSupabaseServerClient } from "@/lib/supabase/server"
import { trackLearningEvent } from "@/lib/gamification/track-learning"

type StartPathArgs = { pathId: string }
type MarkLessonCompleteArgs = { pathId: string; lessonId: string }

export async function startLearningPath({ pathId }: StartPathArgs) {
  const supabase = await getSupabaseServerClient()
  const { data: auth } = await supabase.auth.getUser()
  const user = auth.user
  if (!user) throw new Error("Not authenticated")

  const { data: ulpp, error: ulppErr } = await supabase
    .from("user_learning_path_progress")
    .upsert(
      {
        user_id: user.id,
        path_id: pathId,
        status: "active",
        last_activity_at: new Date().toISOString(),
      },
      { onConflict: "user_id,path_id" }
    )
    .select()
    .single()

  if (ulppErr) throw ulppErr

  // Fire gamification event
  trackLearningEvent(user.id, "path_started", { path_id: pathId }).catch(() => {})

  return ulpp
}

export async function markLessonComplete({
  pathId,
  lessonId,
}: MarkLessonCompleteArgs) {
  const supabase = await getSupabaseServerClient()
  const { data: auth } = await supabase.auth.getUser()
  const user = auth.user
  if (!user) throw new Error("Not authenticated")

  const nowIso = new Date().toISOString()

  // Update lesson progress
  const { error: lessonErr } = await supabase
    .from("user_lesson_progress")
    .upsert(
      {
        user_id: user.id,
        path_id: pathId,
        lesson_id: lessonId,
        state: "completed",
        progress_percent: 100,
        completed_at: nowIso,
        started_at: nowIso,
      },
      { onConflict: "user_id,lesson_id" }
    )

  if (lessonErr) throw lessonErr

  // Fire gamification event
  trackLearningEvent(user.id, "lesson_completed", {
    path_id: pathId,
    lesson_id: lessonId,
  }).catch(() => {})

  // Update path progress resume point
  const { error: pathErr } = await supabase
    .from("user_learning_path_progress")
    .upsert(
      {
        user_id: user.id,
        path_id: pathId,
        last_lesson_id: lessonId,
        last_activity_at: nowIso,
        status: "active",
      },
      { onConflict: "user_id,path_id" }
    )

  if (pathErr) throw pathErr

  // Check if all lessons are complete → auto-complete path
  const { data: allLessons } = await supabase
    .from("learning_path_lessons")
    .select("id")
    .eq("path_id", pathId)

  const { data: completedLessons } = await supabase
    .from("user_lesson_progress")
    .select("lesson_id")
    .eq("user_id", user.id)
    .eq("path_id", pathId)
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
      .eq("user_id", user.id)
      .eq("path_id", pathId)

    // Fire path completion gamification event
    trackLearningEvent(user.id, "path_completed", { path_id: pathId }).catch(() => {})
  }

  return { ok: true }
}

export async function markLessonInProgress({
  pathId,
  lessonId,
}: MarkLessonCompleteArgs) {
  const supabase = await getSupabaseServerClient()
  const { data: auth } = await supabase.auth.getUser()
  const user = auth.user
  if (!user) throw new Error("Not authenticated")

  const nowIso = new Date().toISOString()

  const { error } = await supabase
    .from("user_lesson_progress")
    .upsert(
      {
        user_id: user.id,
        path_id: pathId,
        lesson_id: lessonId,
        state: "in_progress",
        progress_percent: 50,
        started_at: nowIso,
      },
      { onConflict: "user_id,lesson_id" }
    )

  if (error) throw error

  // Update path resume point
  await supabase
    .from("user_learning_path_progress")
    .upsert(
      {
        user_id: user.id,
        path_id: pathId,
        last_lesson_id: lessonId,
        last_activity_at: nowIso,
        status: "active",
      },
      { onConflict: "user_id,path_id" }
    )

  return { ok: true }
}
