import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getSupabaseAdmin } from "@/lib/supabase/admin"

export async function POST(req: NextRequest) {
  try {
    let userId: string | null = null

    // ── Auth strategy 1: Bearer token (mobile app) ──
    const authHeader = req.headers.get("authorization")
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7)
      const admin = getSupabaseAdmin()
      const { data, error } = await admin.auth.getUser(token)
      if (!error && data.user) {
        userId = data.user.id
      }
    }

    // ── Auth strategy 2: Cookie session (web) ──
    if (!userId) {
      const supabase = await getSupabaseServerClient()
      const { data: { user }, error } = await supabase.auth.getUser()
      if (!error && user) {
        userId = user.id
      }
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // ── Use service-role client to run the RPC + delete auth user ──
    const admin = getSupabaseAdmin()

    // Archive & purge all user data via the SECURITY DEFINER function
    const { error: rpcError } = await admin.rpc("delete_user_account", {
      p_user_id: userId,
    })

    if (rpcError) {
      console.error("delete_user_account RPC failed:", rpcError)
      return NextResponse.json(
        { error: "Failed to delete user data" },
        { status: 500 }
      )
    }

    // Delete the auth.users row (removes login credentials)
    const { error: deleteAuthError } =
      await admin.auth.admin.deleteUser(userId)

    if (deleteAuthError) {
      console.error("deleteUser auth failed:", deleteAuthError)
      return NextResponse.json(
        { error: "Data deleted but auth removal failed — contact support" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("delete-account unexpected error:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
