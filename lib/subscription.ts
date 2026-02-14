import { getSupabaseServerClient } from "@/lib/supabase/server"
import { checkRevenueCatEntitlement } from "@/lib/revenuecat/server"

export interface UserSubscription {
  isPremium: boolean
  tier: "free" | "premium" | "lifetime"
  plan: string | null
  status: string | null
  currentPeriodEnd: string | null
}

const FREE_SUBSCRIPTION: UserSubscription = {
  isPremium: false,
  tier: "free",
  plan: null,
  status: null,
  currentPeriodEnd: null,
}

export async function getUserSubscription(): Promise<UserSubscription> {
  try {
    const supabase = await getSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return FREE_SUBSCRIPTION

    const rcResult = await checkRevenueCatEntitlement(user.id)
    if (rcResult.isPro) {
      return {
        isPremium: true,
        tier: "premium",
        plan: rcResult.productIdentifier,
        status: "active",
        currentPeriodEnd: rcResult.expiresDate,
      }
    }

    return FREE_SUBSCRIPTION
  } catch {
    return FREE_SUBSCRIPTION
  }
}
