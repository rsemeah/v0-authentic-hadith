import { NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getSupabaseAdmin } from "@/lib/supabase/admin"

export async function POST(req: NextRequest) {
  try {
    // 1. Verify the caller is authenticated (anon-key session)
    const supabase = await getSupabaseServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // 2. Use service-role client to run the RPC + delete auth user
    const admin = getSupabaseAdmin()

    // Archive & purge all user data via the SECURITY DEFINER function
    const { error: rpcError } = await admin.rpc("delete_user_account", {
      p_user_id: user.id,
    })

    if (rpcError) {
      console.error("delete_user_account RPC failed:", rpcError)
      return NextResponse.json(
        { error: "Failed to delete user data" },
        { status: 500 }
      )
    }

    // 3. Delete the auth.users row (removes login credentials)
    const { error: deleteAuthError } =
      await admin.auth.admin.deleteUser(user.id)

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
