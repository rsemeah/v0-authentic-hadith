import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const token_hash = searchParams.get("token_hash")
  const type = searchParams.get("type")

  const supabase = await createClient()

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      return NextResponse.redirect(`${origin}/?error=auth`)
    }
  }

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as "signup" | "email",
      token_hash,
    })
    if (error) {
      return NextResponse.redirect(`${origin}/?error=auth`)
    }
  }

  if (!code && !token_hash) {
    return NextResponse.redirect(`${origin}/?error=auth`)
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single()

    if (!profile) {
      await supabase.from("profiles").insert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
        avatar_url: user.user_metadata?.avatar_url || null,
        is_premium: false,
        role: "user",
      })
    }

    const { data: prefs } = await supabase
      .from("user_preferences")
      .select("onboarded")
      .eq("user_id", user.id)
      .single()

    if (prefs?.onboarded) {
      const response = NextResponse.redirect(`${origin}/home`)
      response.cookies.set("qbos_onboarded", "1", {
        path: "/",
        maxAge: 31536000,
        sameSite: "lax",
      })
      return response
    }
  }

  return NextResponse.redirect(`${origin}/onboarding`)
}
