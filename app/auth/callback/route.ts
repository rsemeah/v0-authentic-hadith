import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabase/config"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/onboarding"

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Handle server component cookie setting
          }
        },
      },
    })

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Check if user already has a profile (returning user)
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("user_id", user.id)
          .single()

        if (profile) {
          // Returning user - set onboarded cookie and go to home
          const response = NextResponse.redirect(`${origin}/home`)
          response.cookies.set("qbos_onboarded", "1", {
            path: "/",
            maxAge: 31536000,
            sameSite: "lax",
          })
          return response
        }
      }

      // New user - send to onboarding
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // OAuth error - redirect to auth error page
  return NextResponse.redirect(`${origin}/?error=auth`)
}
