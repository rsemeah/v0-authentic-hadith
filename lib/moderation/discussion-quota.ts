import { getSupabaseAdmin } from "@/lib/supabase/admin"

/**
 * Discussion post rate limits by tier.
 * Free users get enough to participate; paid users get generous limits.
 */
const DISCUSSION_LIMITS: Record<string, { daily: number }> = {
  free: { daily: 5 },
  premium: { daily: 50 },
  lifetime: { daily: 100 },
}

export type DiscussionQuotaResult = {
  allowed: boolean
  remaining: number
  limit: number
  tier: "free" | "premium" | "lifetime"
  reason?: string
}

export async function checkDiscussionQuota(userId: string): Promise<DiscussionQuotaResult> {
  const supabase = getSupabaseAdmin()

  // Get user tier
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_tier")
    .eq("user_id", userId)
    .single()

  const tier = (profile?.subscription_tier as "free" | "premium" | "lifetime") ?? "free"
  const { daily: limit } = DISCUSSION_LIMITS[tier] ?? DISCUSSION_LIMITS.free

  // Get today's usage
  const today = new Date().toISOString().split("T")[0]
  const { data: usage } = await supabase
    .from("discussion_usage")
    .select("post_count")
    .eq("user_id", userId)
    .eq("usage_date", today)
    .single()

  const used = usage?.post_count ?? 0
  const allowed = used < limit

  return {
    allowed,
    remaining: Math.max(limit - used, 0),
    limit,
    tier,
    reason: allowed ? undefined : `Daily post limit reached (${limit}/day). ${tier === "free" ? "Upgrade for more." : "Try again tomorrow."}`,
  }
}

export async function incrementDiscussionUsage(userId: string): Promise<void> {
  const supabase = getSupabaseAdmin()
  const today = new Date().toISOString().split("T")[0]

  const { data: existing } = await supabase
    .from("discussion_usage")
    .select("id, post_count")
    .eq("user_id", userId)
    .eq("usage_date", today)
    .single()

  if (existing) {
    await supabase
      .from("discussion_usage")
      .update({ post_count: existing.post_count + 1, updated_at: new Date().toISOString() })
      .eq("id", existing.id)
  } else {
    await supabase.from("discussion_usage").insert({
      user_id: userId,
      usage_date: today,
      post_count: 1,
    })
  }
}
