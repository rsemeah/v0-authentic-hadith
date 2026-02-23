import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * POST /api/social/follow — Follow a user.
 * DELETE /api/social/follow — Unfollow a user.
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

    const { following_id } = await request.json()

    if (!following_id) {
      return NextResponse.json({ error: "following_id is required" }, { status: 400 })
    }

    if (following_id === user.id) {
      return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 })
    }

    const { error } = await supabase.from("user_follows").insert({
      follower_id: user.id,
      following_id,
    })

    if (error) {
      if (error.message.includes("duplicate") || error.code === "23505") {
        return NextResponse.json({ error: "Already following this user" }, { status: 409 })
      }
      console.error("[Follow] Error:", error)
      return NextResponse.json({ error: "Failed to follow" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[Follow] Error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { following_id } = await request.json()

    if (!following_id) {
      return NextResponse.json({ error: "following_id is required" }, { status: 400 })
    }

    const { error } = await supabase
      .from("user_follows")
      .delete()
      .eq("follower_id", user.id)
      .eq("following_id", following_id)

    if (error) {
      console.error("[Unfollow] Error:", error)
      return NextResponse.json({ error: "Failed to unfollow" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[Unfollow] Error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
