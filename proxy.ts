import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabase/config"

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  try {
    const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value)
          }
          supabaseResponse = NextResponse.next({
            request,
          })
          for (const { name, value, options } of cookiesToSet) {
            supabaseResponse.cookies.set(name, value, options)
          }
        },
      },
    })

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const pathname = request.nextUrl.pathname
    let hasOnboarded = request.cookies.get("qbos_onboarded")?.value === "1"

    // If user is authenticated but cookie is missing, check the database
    if (user && !hasOnboarded) {
      const { data: prefs } = await supabase
        .from("user_preferences")
        .select("onboarded")
        .eq("user_id", user.id)
        .single()

      if (prefs?.onboarded) {
        hasOnboarded = true
        // Set the cookie so we don't need to check DB every time
        supabaseResponse.cookies.set("qbos_onboarded", "1", {
          path: "/",
          maxAge: 31536000,
          sameSite: "lax",
        })
      }
    }

    // Protect dashboard and home routes
    if (!user && (pathname.startsWith("/dashboard") || pathname.startsWith("/home"))) {
      const url = request.nextUrl.clone()
      url.pathname = "/"
      return NextResponse.redirect(url)
    }

    // Protect onboarding route
    if (!user && pathname.startsWith("/onboarding")) {
      const url = request.nextUrl.clone()
      url.pathname = "/"
      return NextResponse.redirect(url)
    }

    // Redirect authenticated users from auth page
    if (user && pathname === "/") {
      const url = request.nextUrl.clone()
      url.pathname = hasOnboarded ? "/home" : "/onboarding"
      return NextResponse.redirect(url)
    }

    // Redirect to onboarding if not onboarded
    if (
      user &&
      !hasOnboarded &&
      pathname !== "/onboarding" &&
      pathname !== "/" &&
      !pathname.startsWith("/api") &&
      !pathname.startsWith("/admin") &&
      !pathname.startsWith("/auth")
    ) {
      const url = request.nextUrl.clone()
      url.pathname = "/onboarding"
      return NextResponse.redirect(url)
    }
  } catch (err) {
    console.error("[v0] Proxy error:", err)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
