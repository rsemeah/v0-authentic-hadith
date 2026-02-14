import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabase/config"
import { getSupabaseAdmin } from "@/lib/supabase/admin"

// All tables with user_id column that must be purged on account deletion
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

export async function POST(request: Request) {
  try {
    // Parse and validate the confirmation phrase
    const body = await request.json()
    if (body?.confirmation !== "DELETE MY ACCOUNT") {
      return NextResponse.json(
        { error: "Invalid confirmation. Please type 'DELETE MY ACCOUNT' to proceed." },
        { status: 400 }
      )
    }

    // Get the authenticated user via cookie-based session
    const cookieStore = await cookies()
    const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options)
          }
        },
      },
    })

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const userId = user.id
    const admin = getSupabaseAdmin()

    // Delete all user data from every table in order (respecting FK constraints)
    const deletionErrors: string[] = []

    for (const table of USER_DATA_TABLES) {
      const { error } = await admin.from(table).delete().eq("user_id", userId)
      if (error) {
        // Log but continue -- best-effort deletion
        console.error(`[v0] Failed to delete from ${table}:`, error.message)
        deletionErrors.push(`${table}: ${error.message}`)
      }
    }

    // Delete the user's avatar from storage if it exists
    const { data: avatarFiles } = await admin.storage.from("avatars").list(userId)
    if (avatarFiles && avatarFiles.length > 0) {
      const filePaths = avatarFiles.map((f) => `${userId}/${f.name}`)
      await admin.storage.from("avatars").remove(filePaths)
    }

    // Delete the auth user via admin API (this is permanent)
    const { error: deleteUserError } = await admin.auth.admin.deleteUser(userId)
    if (deleteUserError) {
      console.error("[v0] Failed to delete auth user:", deleteUserError.message)
      return NextResponse.json(
        { error: "Failed to delete account. Please contact support." },
        { status: 500 }
      )
    }

    // Sign out and clear cookies
    await supabase.auth.signOut()
    cookieStore.set("qbos_onboarded", "", { path: "/", maxAge: 0 })

    return NextResponse.json({
      success: true,
      deletionErrors: deletionErrors.length > 0 ? deletionErrors : undefined,
    })
  } catch (error) {
    console.error("[v0] Account deletion error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
