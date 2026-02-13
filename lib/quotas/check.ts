import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getSupabaseAdmin } from "@/lib/supabase/admin"

export type QuotaCheckResult = {
  allowed: boolean
  daily_remaining: number
  monthly_remaining: number
  daily_limit: number
  monthly_limit: number
  tier: "free" | "premium" | "lifetime"
  reason?: string
}

export async function checkAIQuota(userId: string): Promise<QuotaCheckResult> {
  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase
    .rpc("check_user_quota", { p_user_id: userId })
    .single()

  if (error || !data) {
    console.error("Quota check failed:", error)
    return {
      allowed: false,
      daily_remaining: 0,
      monthly_remaining: 0,
      daily_limit: 0,
      monthly_limit: 0,
      tier: "free",
      reason: "Failed to check quota",
    }
  }

  const result: QuotaCheckResult = {
    allowed: data.allowed,
    daily_remaining: data.daily_remaining,
    monthly_remaining: data.monthly_remaining,
    daily_limit: data.daily_limit,
    monthly_limit: data.monthly_limit,
    tier: data.tier,
  }

  if (!data.allowed) {
    if (data.daily_remaining <= 0) {
      result.reason = "Daily AI query limit reached. Upgrade for more."
    } else if (data.monthly_remaining <= 0) {
      result.reason = "Monthly AI query limit reached. Upgrade for more."
    } else {
      result.reason = "AI query quota exceeded."
    }
  }

  return result
}

export async function incrementAIUsage(userId: string): Promise<void> {
  const supabase = getSupabaseAdmin()

  const { error } = await supabase.rpc("increment_ai_usage", {
    p_user_id: userId,
  })

  if (error) {
    console.error("Failed to increment usage:", error)
  }
}

export async function getUserTier(userId: string): Promise<"free" | "premium" | "lifetime"> {
  const supabase = getSupabaseAdmin()

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_tier")
    .eq("user_id", userId)
    .single()

  return (profile?.subscription_tier as "free" | "premium" | "lifetime") ?? "free"
}

export async function canUseFeature(
  userId: string,
  feature: "advanced_search" | "semantic_search" | "priority_support",
): Promise<boolean> {
  const tier = await getUserTier(userId)

  const featureMap: Record<string, Record<string, boolean>> = {
    free: { advanced_search: false, semantic_search: false, priority_support: false },
    premium: { advanced_search: true, semantic_search: true, priority_support: true },
    lifetime: { advanced_search: true, semantic_search: true, priority_support: true },
  }

  return featureMap[tier]?.[feature] ?? false
}
