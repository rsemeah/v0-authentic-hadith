import { getSupabaseServerClient } from "@/lib/supabase/server"

export interface UserSubscription {
  isPremium: boolean
  plan: string | null
  status: string | null
  currentPeriodEnd: string | null
}

const FREE_SUBSCRIPTION: UserSubscription = {
  isPremium: false,
  plan: null,
  status: null,
  currentPeriodEnd: null,
}

export async function getUserSubscription(): Promise<UserSubscription> {
  try {
    const supabase = await getSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return FREE_SUBSCRIPTION

    const { data: sub } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .in("status", ["active", "trialing", "lifetime"])
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (!sub) return FREE_SUBSCRIPTION

    return {
      isPremium: true,
      plan: sub.product_id,
      status: sub.status,
      currentPeriodEnd: sub.current_period_end,
    }
  } catch {
    return FREE_SUBSCRIPTION
  }
}
