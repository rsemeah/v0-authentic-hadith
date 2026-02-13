import { getSupabaseAdmin } from "@/lib/supabase/admin"
import { checkAndUnlockAchievements } from "./achievement-engine"

type LearningEventType =
  | "lesson_started"
  | "lesson_completed"
  | "path_started"
  | "path_completed"
  | "path_resumed"
  | "note_saved"

interface LearningEventPayload {
  path_id?: string
  path_slug?: string
  lesson_id?: string
  lesson_title?: string
  path_title?: string
}

export async function trackLearningEvent(
  userId: string,
  eventType: LearningEventType,
  payload: LearningEventPayload = {},
): Promise<{ newAchievements: string[] }> {
  const supabase = getSupabaseAdmin()

  // Log event
  await supabase.from("learning_events").insert({
    user_id: userId,
    event_type: eventType,
    payload,
  })

  // Update user_stats counters
  if (eventType === "lesson_completed") {
    await supabase.rpc("increment_stat", {
      p_user_id: userId,
      p_stat_name: "lessons_completed",
    }).catch(() => {
      // Stat column may not exist yet - graceful fallback
    })
  }

  if (eventType === "path_completed") {
    await supabase.rpc("increment_stat", {
      p_user_id: userId,
      p_stat_name: "paths_completed",
    }).catch(() => {
      // Stat column may not exist yet - graceful fallback
    })
  }

  // Also track as generic activity for streaks
  await supabase.from("user_activity_log").upsert(
    {
      user_id: userId,
      activity_date: new Date().toISOString().split("T")[0],
      activity_type: eventType === "lesson_completed" ? "read_hadith" : "complete_story",
      item_id: payload.lesson_id || payload.path_id || null,
    },
    { onConflict: "user_id,activity_date,activity_type" },
  ).catch(() => {
    // Activity log table may not exist - graceful fallback
  })

  // Check for new achievement unlocks
  const newAchievements = await checkAndUnlockAchievements(userId).catch(() => [])

  return { newAchievements }
}
