import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getUserTier } from "@/lib/quotas/check"

/**
 * GET /api/social/friends — List friend requests (sent + received).
 * POST /api/social/friends — Send a friend request (paid tier only).
 * PATCH /api/social/friends — Accept or reject a request.
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

    const type = request.nextUrl.searchParams.get("type") || "all"

    if (type === "received") {
      const { data } = await supabase
        .from("friend_requests")
        .select("id, sender_id, status, created_at")
        .eq("receiver_id", user.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false })

      return NextResponse.json({ requests: data || [] })
    }

    if (type === "sent") {
      const { data } = await supabase
        .from("friend_requests")
        .select("id, receiver_id, status, created_at")
        .eq("sender_id", user.id)
        .order("created_at", { ascending: false })

      return NextResponse.json({ requests: data || [] })
    }

    // "all" — both sent and received
    const [{ data: received }, { data: sent }] = await Promise.all([
      supabase
        .from("friend_requests")
        .select("id, sender_id, receiver_id, status, created_at")
        .eq("receiver_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("friend_requests")
        .select("id, sender_id, receiver_id, status, created_at")
        .eq("sender_id", user.id)
        .order("created_at", { ascending: false }),
    ])

    return NextResponse.json({
      received: received || [],
      sent: sent || [],
    })
  } catch (err) {
    console.error("[Friends] Error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Friend requests are a paid feature
    const tier = await getUserTier(user.id)
    if (tier === "free") {
      return NextResponse.json(
        { error: "Friend requests require a premium subscription. Upgrade to connect with friends." },
        { status: 403 },
      )
    }

    const { receiver_id } = await request.json()

    if (!receiver_id) {
      return NextResponse.json({ error: "receiver_id is required" }, { status: 400 })
    }

    if (receiver_id === user.id) {
      return NextResponse.json({ error: "Cannot send friend request to yourself" }, { status: 400 })
    }

    // Check if there's already a request in either direction
    const { data: existing } = await supabase
      .from("friend_requests")
      .select("id, status, sender_id")
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${receiver_id}),and(sender_id.eq.${receiver_id},receiver_id.eq.${user.id})`)

    if (existing && existing.length > 0) {
      const req = existing[0]
      if (req.status === "accepted") {
        return NextResponse.json({ error: "You are already friends" }, { status: 409 })
      }
      if (req.status === "pending") {
        // If other person already sent us a request, auto-accept
        if (req.sender_id === receiver_id) {
          await supabase
            .from("friend_requests")
            .update({ status: "accepted", responded_at: new Date().toISOString() })
            .eq("id", req.id)
          return NextResponse.json({ success: true, auto_accepted: true, message: "Friend request accepted! They had already sent you a request." })
        }
        return NextResponse.json({ error: "Friend request already sent" }, { status: 409 })
      }
      // If rejected, allow re-sending by deleting old and creating new
      if (req.status === "rejected" && req.sender_id === user.id) {
        await supabase.from("friend_requests").delete().eq("id", req.id)
      }
    }

    const { error } = await supabase.from("friend_requests").insert({
      sender_id: user.id,
      receiver_id,
    })

    if (error) {
      console.error("[Friends] Insert error:", error)
      return NextResponse.json({ error: "Failed to send friend request" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[Friends] Error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { request_id, action } = await request.json()

    if (!request_id || !action) {
      return NextResponse.json({ error: "request_id and action are required" }, { status: 400 })
    }

    if (!["accept", "reject"].includes(action)) {
      return NextResponse.json({ error: "action must be 'accept' or 'reject'" }, { status: 400 })
    }

    const { error } = await supabase
      .from("friend_requests")
      .update({
        status: action === "accept" ? "accepted" : "rejected",
        responded_at: new Date().toISOString(),
      })
      .eq("id", request_id)
      .eq("receiver_id", user.id) // only receiver can respond

    if (error) {
      console.error("[Friends] Update error:", error)
      return NextResponse.json({ error: "Failed to respond to request" }, { status: 500 })
    }

    return NextResponse.json({ success: true, status: action === "accept" ? "accepted" : "rejected" })
  } catch (err) {
    console.error("[Friends] Error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
