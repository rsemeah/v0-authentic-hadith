import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getSupabaseAdmin } from "@/lib/supabase/admin"
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabase/config"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"

const USER_DATA_TABLES = [
  "discussion_likes",
  "discussions",
  "quiz_attempts",
  "reading_progress",
  "hadith_views",
  "reflections",
  "saved_hadiths",
  "saved_collections",
  "sahaba_reading_progress",
  "user_achievements",
  "user_activity_log",
  "user_bookmarks",
  "user_notes",
  "user_folders",
  "user_stats",
  "user_streaks",
  "user_preferences",
  "subscriptions",
  "profiles",
] as const

/**
 * Resolves the authenticated user from either:
 * 1. Bearer token in Authorization header (mobile app)
 * 2. Cookie-based session (web app)
 */
async function getAuthenticatedUser(request: Request) {
  const authHeader = request.headers.get("authorization")

  // Mobile app sends Bearer token
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7)
    const client = createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { autoRefreshToken: false, persistSession: false },
    })
    return client.auth.getUser(token)
  }

  // Web app uses cookie-based session
  const supabase = await createClient()
  return supabase.auth.getUser()
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    if (body?.confirmation !== "DELETE MY ACCOUNT") {
      return NextResponse.json(
        { error: "Invalid confirmation. Please type 'DELETE MY ACCOUNT' to proceed." },
        { status: 400 }
      )
    }

    const { data: { user }, error: authError } = await getAuthenticatedUser(request)

    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const userId = user.id
    const admin = getSupabaseAdmin()
    const deletionErrors: string[] = []

    // Archive user data first via RPC (if migration has been applied)
    const { error: archiveError } = await admin.rpc("delete_user_account", {
      p_user_id: userId,
    })
    if (archiveError) {
      // RPC not available — fall back to table-by-table deletion
      console.warn("Archive RPC unavailable, falling back to direct deletion:", archiveError.message)
      for (const table of USER_DATA_TABLES) {
        const { error } = await admin.from(table).delete().eq("user_id", userId)
        if (error) {
          console.error(`Failed to delete from ${table}:`, error.message)
          deletionErrors.push(`${table}: ${error.message}`)
        }
      }
    }

    // Clean up avatar storage
    const { data: avatarFiles } = await admin.storage.from("avatars").list(userId)
    if (avatarFiles && avatarFiles.length > 0) {
      const filePaths = avatarFiles.map((f) => `${userId}/${f.name}`)
      await admin.storage.from("avatars").remove(filePaths)
    }

    // Delete auth user
    const { error: deleteUserError } = await admin.auth.admin.deleteUser(userId)
    if (deleteUserError) {
      return NextResponse.json(
        { error: "Failed to delete account. Please contact support." },
        { status: 500 }
      )
    }

    const response = NextResponse.json({
      success: true,
      deletionErrors: deletionErrors.length > 0 ? deletionErrors : undefined,
    })
    response.cookies.set("qbos_onboarded", "", { path: "/", maxAge: 0 })
    return response
  } catch (error) {
    console.error("Account deletion error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
