import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getSupabaseAdmin } from "@/lib/supabase/admin"

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: "Not authenticated" }, { status: 401 })
    }

    const admin = getSupabaseAdmin()

    // Get user tier
    const { data: profile } = await admin
      .from("profiles")
      .select("subscription_tier")
      .eq("user_id", user.id)
      .single()

    const tier = (profile?.subscription_tier as "free" | "premium" | "lifetime") ?? "free"

    // Saved count
    const { count: savedCount } = await admin
      .from("saved_hadiths")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)

    // AI usage today
    const today = new Date().toISOString().split("T")[0]
    const { data: aiUsage } = await admin
      .from("ai_usage")
      .select("query_count")
      .eq("user_id", user.id)
      .eq("usage_date", today)
      .single()

    // Quiz count today
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const { count: quizCount } = await admin
      .from("quiz_attempts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", todayStart.toISOString())

    // Limits based on tier
    const limits = {
      free: { saves: 40, aiPerDay: 5, quizzesPerDay: 1 },
      premium: { saves: Infinity, aiPerDay: 50, quizzesPerDay: Infinity },
      lifetime: { saves: Infinity, aiPerDay: 100, quizzesPerDay: Infinity },
    }

    const userLimits = limits[tier] ?? limits.free
    const isPremium = tier !== "free"

    return Response.json({
      tier,
      isPremium,
      usage: {
        saves: savedCount ?? 0,
        savesLimit: userLimits.saves,
        savesRemaining: Math.max(userLimits.saves - (savedCount ?? 0), 0),
        aiToday: aiUsage?.query_count ?? 0,
        aiDailyLimit: userLimits.aiPerDay,
        aiRemaining: Math.max(userLimits.aiPerDay - (aiUsage?.query_count ?? 0), 0),
        quizzesToday: quizCount ?? 0,
        quizDailyLimit: userLimits.quizzesPerDay,
        quizzesRemaining: Math.max(userLimits.quizzesPerDay - (quizCount ?? 0), 0),
      },
    })
  } catch (err) {
    console.error("Quota API error:", err)
    return Response.json({ error: "Failed to fetch quota" }, { status: 500 })
  }
}
