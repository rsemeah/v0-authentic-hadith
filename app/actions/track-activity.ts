"use server";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import { checkAndUnlockAchievements } from "@/lib/gamification/achievement-engine";

const XP_REWARDS: Record<string, number> = {
  read_hadith: 5,
  bookmark: 10,
  note: 15,
  share: 10,
  complete_story: 50,
  quiz_completed: 30,
};

export async function trackActivity(
  activityType: string,
  itemId?: string
) {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Not authenticated" };

  try {
    // Log activity (trigger auto-updates streak)
    const { error: activityError } = await supabase
      .from("user_activity_log")
      .insert({
        user_id: user.id,
        activity_type: activityType,
        item_id: itemId || null,
      });

    // Ignore duplicate activity errors (same day, same type, same item)
    if (activityError && !activityError.message.includes("duplicate")) {
      console.error("Activity log error:", activityError);
    }

    // Award XP
    const xp = XP_REWARDS[activityType] || 0;
    if (xp > 0) {
      await supabase.rpc("increment_user_xp", {
        p_user_id: user.id,
        p_xp_amount: xp,
      });
    }

    // Increment the relevant stat
    const statMap: Record<string, string> = {
      read_hadith: "hadith_read_count",
      bookmark: "bookmarks_count",
      note: "notes_count",
      share: "shares_count",
      complete_story: "stories_completed",
    };

    const statName = statMap[activityType];
    if (statName) {
      await supabase.rpc("increment_stat", {
        p_user_id: user.id,
        p_stat_name: statName,
      });
    }

    // Delegate to canonical achievement engine (single source of truth)
    const newAchievements = await checkAndUnlockAchievements(user.id);

    return { success: true, xpEarned: xp, newAchievements };
  } catch (error) {
    console.error("Track activity error:", error);
    return { success: false, error: "Failed to track activity" };
  }
}
