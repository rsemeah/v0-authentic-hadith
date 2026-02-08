import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabase/config"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const token_hash = searchParams.get("token_hash")
  const type = searchParams.get("type")

  const cookieStore = await cookies()
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options)
          }
        } catch {
          // Handle server component cookie setting
        }
      },
    },
  })

  // Handle OAuth code exchange
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      return NextResponse.redirect(`${origin}/?error=auth`)
    }
  }

  // Handle email confirmation (token_hash + type)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as "signup" | "email",
      token_hash,
    })
    if (error) {
      return NextResponse.redirect(`${origin}/?error=auth`)
    }
  }

  // If neither code nor token_hash, something went wrong
  if (!code && !token_hash) {
    return NextResponse.redirect(`${origin}/?error=auth`)
  }

  // Check if user already has a profile + preferences (returning user)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const { data: prefs } = await supabase
      .from("user_preferences")
      .select("onboarded")
      .eq("user_id", user.id)
      .single()

    if (prefs?.onboarded) {
      // Returning user -- set onboarded cookie and go to home
      const response = NextResponse.redirect(`${origin}/home`)
      response.cookies.set("qbos_onboarded", "1", {
        path: "/",
        maxAge: 31536000,
        sameSite: "lax",
      })
      return response
    }
  }

  // New user or not yet onboarded -- send to onboarding
  return NextResponse.redirect(`${origin}/onboarding`)
}
