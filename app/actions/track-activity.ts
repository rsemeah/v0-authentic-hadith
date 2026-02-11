"use server";

import { getSupabaseServerClient } from "@/lib/supabase/server";

const XP_REWARDS: Record<string, number> = {
  hadith_read: 5,
  hadith_save: 10,
  note_written: 15,
  hadith_shared: 10,
  story_completed: 50,
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
      hadith_read: "hadith_read_count",
      hadith_save: "bookmarks_count",
      note_written: "notes_count",
      hadith_shared: "shares_count",
      story_completed: "stories_completed",
    };

    const statName = statMap[activityType];
    if (statName) {
      await supabase.rpc("increment_stat", {
        p_user_id: user.id,
        p_stat_name: statName,
      });
    }

    // Check for achievements
    await checkAndUnlockAchievements(user.id, supabase);

    return { success: true, xpEarned: xp };
  } catch (error) {
    console.error("Track activity error:", error);
    return { success: false, error: "Failed to track activity" };
  }
}

async function checkAndUnlockAchievements(
  userId: string,
  supabase: Awaited<ReturnType<typeof getSupabaseServerClient>>
) {
  // Get user stats
  const { data: stats } = await supabase
    .from("user_stats")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (!stats) return;

  // Get all achievements not yet unlocked
  const { data: allAchievements } = await supabase
    .from("achievements")
    .select("*")
    .eq("is_active", true);

  const { data: userAchievements } = await supabase
    .from("user_achievements")
    .select("achievement_id")
    .eq("user_id", userId);

  const unlockedIds = new Set(
    (userAchievements || []).map(
      (ua: { achievement_id: string }) => ua.achievement_id
    )
  );

  for (const achievement of allAchievements || []) {
    if (unlockedIds.has(achievement.id)) continue;

    const criteria = achievement.criteria as {
      type: string;
      threshold?: number;
      date?: string;
    };
    let shouldUnlock = false;

    switch (criteria.type) {
      case "hadith_read_count":
        shouldUnlock =
          (stats.hadith_read_count || 0) >= (criteria.threshold || 0);
        break;
      case "notes_count":
        shouldUnlock = (stats.notes_count || 0) >= (criteria.threshold || 0);
        break;
      case "streak_days":
        shouldUnlock =
          (stats.current_streak_days || 0) >= (criteria.threshold || 0);
        break;
      case "shares":
        shouldUnlock =
          (stats.shares_count || 0) >= (criteria.threshold || 0);
        break;
      case "bookmarks_count":
        shouldUnlock =
          (stats.bookmarks_count || 0) >= (criteria.threshold || 0);
        break;
      case "story_complete":
        shouldUnlock =
          (stats.stories_completed || 0) >= (criteria.threshold || 0);
        break;
      case "account_age_before":
        shouldUnlock = criteria.date
          ? new Date() < new Date(criteria.date)
          : false;
        break;
    }

    if (shouldUnlock) {
      await supabase.from("user_achievements").insert({
        user_id: userId,
        achievement_id: achievement.id,
      });

      // Award XP for achievement
      if (achievement.xp_reward > 0) {
        await supabase.rpc("increment_user_xp", {
          p_user_id: userId,
          p_xp_amount: achievement.xp_reward,
        });
      }
    }
  }
}
