import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * GET /api/social/users?q=search — Search users by name.
 * GET /api/social/users?id=uuid — Get a single user profile.
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const query = request.nextUrl.searchParams.get("q")
    const userId = request.nextUrl.searchParams.get("id")

    // Single user profile lookup
    if (userId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_id, name, avatar_url, bio, followers_count, following_count, friends_count")
        .eq("user_id", userId)
        .single()

      if (!profile) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      // Check follow/friend status
      const [{ data: followStatus }, { data: friendStatus }] = await Promise.all([
        supabase
          .from("user_follows")
          .select("id")
          .eq("follower_id", user.id)
          .eq("following_id", userId)
          .maybeSingle(),
        supabase
          .from("friend_requests")
          .select("id, status, sender_id")
          .or(`and(sender_id.eq.${user.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${user.id})`)
          .maybeSingle(),
      ])

      return NextResponse.json({
        ...profile,
        is_following: !!followStatus,
        friend_status: friendStatus?.status || null,
        friend_request_sender: friendStatus?.sender_id || null,
        is_self: userId === user.id,
      })
    }

    // User search
    if (query && query.length >= 2) {
      const { data: users } = await supabase
        .from("profiles")
        .select("user_id, name, avatar_url, bio")
        .ilike("name", `%${query}%`)
        .neq("user_id", user.id) // exclude self
        .limit(20)

      return NextResponse.json({ users: users || [] })
    }

    return NextResponse.json({ error: "Provide ?q=search or ?id=userId" }, { status: 400 })
  } catch (err) {
    console.error("[Users] Error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
