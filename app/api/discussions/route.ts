import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { moderateContent } from "@/lib/moderation/safety-engine"
import { checkDiscussionQuota, incrementDiscussionUsage } from "@/lib/moderation/discussion-quota"

/**
 * POST /api/discussions — Create a new discussion post with moderation.
 *
 * Flow:
 * 1. Auth check
 * 2. Rate limit check (free: 5/day, premium: 50/day, lifetime: 100/day)
 * 3. Content moderation (local patterns → AI review if needed)
 * 4. Insert with moderation_status
 * 5. Increment usage counter + track activity for XP
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const body = await request.json()
    const { hadith_id, content, parent_id } = body

    if (!hadith_id || !content?.trim()) {
      return NextResponse.json({ error: "hadith_id and content are required" }, { status: 400 })
    }

    const trimmed = content.trim()

    // Rate limit check
    const quota = await checkDiscussionQuota(user.id)
    if (!quota.allowed) {
      return NextResponse.json(
        { error: quota.reason, quota },
        { status: 429 },
      )
    }

    // Content moderation
    const moderation = await moderateContent(trimmed)

    // Insert the post
    const admin = getSupabaseAdmin()
    const { data: post, error } = await admin
      .from("discussions")
      .insert({
        hadith_id,
        user_id: user.id,
        content: trimmed,
        parent_id: parent_id || null,
        moderation_status: moderation.status,
        moderation_reason: moderation.reason,
        moderated_at: new Date().toISOString(),
        moderated_by: "ai",
      })
      .select("id, moderation_status")
      .single()

    if (error) {
      console.error("[Discussions] Insert error:", error)
      return NextResponse.json({ error: "Failed to create post" }, { status: 500 })
    }

    // Increment usage counter
    await incrementDiscussionUsage(user.id)

    // Track activity for XP (only if approved)
    if (moderation.status === "approved") {
      await admin.rpc("increment_stat", {
        p_user_id: user.id,
        p_stat_name: "discussion_post_count",
      }).catch(() => {}) // non-critical
    }

    return NextResponse.json({
      id: post.id,
      moderation_status: post.moderation_status,
      held: post.moderation_status === "held",
      message:
        post.moderation_status === "held"
          ? "Your post is being reviewed and will appear shortly."
          : post.moderation_status === "rejected"
            ? "Your post could not be published. Please review our community guidelines."
            : undefined,
    })
  } catch (err) {
    console.error("[Discussions] Error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
