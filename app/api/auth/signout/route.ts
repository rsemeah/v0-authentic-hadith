import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabase/config"

export async function POST() {
  const cookieStore = await cookies()
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  await supabase.auth.signOut()

  // Clear the onboarding cookie
  cookieStore.set("qbos_onboarded", "", {
    path: "/",
    maxAge: 0,
  })

  return NextResponse.json({ success: true })
}
