import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getSupabaseAdmin } from "@/lib/supabase/admin"

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
    const body = await request.json()
    if (body?.confirmation !== "DELETE MY ACCOUNT") {
      return NextResponse.json(
        { error: "Invalid confirmation. Please type 'DELETE MY ACCOUNT' to proceed." },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const userId = user.id
    const admin = getSupabaseAdmin()
    const deletionErrors: string[] = []

    for (const table of USER_DATA_TABLES) {
      const { error } = await admin.from(table).delete().eq("user_id", userId)
      if (error) {
        console.error(`Failed to delete from ${table}:`, error.message)
        deletionErrors.push(`${table}: ${error.message}`)
      }
    }

    const { data: avatarFiles } = await admin.storage.from("avatars").list(userId)
    if (avatarFiles && avatarFiles.length > 0) {
      const filePaths = avatarFiles.map((f) => `${userId}/${f.name}`)
      await admin.storage.from("avatars").remove(filePaths)
    }

    const { error: deleteUserError } = await admin.auth.admin.deleteUser(userId)
    if (deleteUserError) {
      return NextResponse.json(
        { error: "Failed to delete account. Please contact support." },
        { status: 500 }
      )
    }

    await supabase.auth.signOut()

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
