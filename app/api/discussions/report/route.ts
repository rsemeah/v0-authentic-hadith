import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

const VALID_REASONS = ["inappropriate", "sectarian", "spam", "harassment", "other"] as const

/**
 * POST /api/discussions/report — Report a discussion post.
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
    const { content_id, reason, details } = body

    if (!content_id || !reason) {
      return NextResponse.json({ error: "content_id and reason are required" }, { status: 400 })
    }

    if (!VALID_REASONS.includes(reason)) {
      return NextResponse.json(
        { error: `Invalid reason. Must be one of: ${VALID_REASONS.join(", ")}` },
        { status: 400 },
      )
    }

    const admin = getSupabaseAdmin()

    // Check the discussion exists
    const { data: discussion } = await admin
      .from("discussions")
      .select("id, user_id")
      .eq("id", content_id)
      .single()

    if (!discussion) {
      return NextResponse.json({ error: "Discussion not found" }, { status: 404 })
    }

    // Can't report your own post
    if (discussion.user_id === user.id) {
      return NextResponse.json({ error: "Cannot report your own post" }, { status: 400 })
    }

    // Insert report
    const { error } = await admin.from("content_reports").insert({
      reporter_id: user.id,
      content_type: "discussion",
      content_id,
      reason,
      details: details?.trim() || null,
    })

    if (error) {
      if (error.message.includes("duplicate") || error.code === "23505") {
        return NextResponse.json({ error: "You have already reported this post" }, { status: 409 })
      }
      console.error("[Report] Insert error:", error)
      return NextResponse.json({ error: "Failed to submit report" }, { status: 500 })
    }

    // Auto-hold: if a post gets 3+ reports, auto-hold it for review
    const { count } = await admin
      .from("content_reports")
      .select("id", { count: "exact", head: true })
      .eq("content_id", content_id)
      .eq("content_type", "discussion")

    if (count && count >= 3) {
      await admin
        .from("discussions")
        .update({
          moderation_status: "held",
          moderation_reason: `Auto-held: ${count} reports received`,
          moderated_at: new Date().toISOString(),
          moderated_by: "auto",
        })
        .eq("id", content_id)
    }

    return NextResponse.json({ success: true, message: "Report submitted. Thank you for helping keep our community respectful." })
  } catch (err) {
    console.error("[Report] Error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
