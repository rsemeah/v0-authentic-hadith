import { createClient } from "@supabase/supabase-js"
import { NextResponse, type NextRequest } from "next/server"
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabase/config"

// Routes that do NOT require authentication
const publicPaths = ["/", "/login", "/pricing", "/checkout/success", "/reset-password"]

// Routes that require authentication
const protectedPrefixes = ["/home", "/dashboard", "/onboarding", "/profile", "/settings", "/saved", "/collections", "/hadith", "/assistant", "/search", "/learn", "/today", "/sunnah", "/stories", "/reflections", "/quiz", "/progress", "/share", "/topics"]

export async function proxy(request: NextRequest) {
  const supabaseResponse = NextResponse.next({ request })

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: {
          cookie: request.headers.get("cookie") || "",
        },
      },
    })

    // Try to get user from access token in cookies
    const accessToken = request.cookies.get("sb-nqklipakrfuwebkdnhwg-auth-token")?.value
    let user = null

    if (accessToken) {
      try {
        const parsed = JSON.parse(accessToken)
        if (parsed?.access_token) {
          const { data } = await supabase.auth.getUser(parsed.access_token)
          user = data?.user
        }
      } catch {
        // Token parse failed, user stays null
      }
    }

    // If no cookie-based auth, try session
    if (!user) {
      const { data } = await supabase.auth.getUser()
      user = data?.user
    }

    const pathname = request.nextUrl.pathname
    const hasOnboarded = request.cookies.get("qbos_onboarded")?.value === "1"

    // Check if the current path is public
    const isPublic = publicPaths.some((p) => pathname === p) ||
      pathname.startsWith("/api") ||
      pathname.startsWith("/auth") ||
      pathname.startsWith("/admin") ||
      pathname.startsWith("/about") ||
      pathname.startsWith("/my-hadith")

    // Check if the current path is protected
    const isProtected = protectedPrefixes.some((prefix) => pathname.startsWith(prefix))

    // Redirect unauthenticated users away from protected routes
    if (!user && isProtected) {
      const url = request.nextUrl.clone()
      url.pathname = "/login"
      return NextResponse.redirect(url)
    }

    // Redirect authenticated users away from login page to home
    if (user && pathname === "/login") {
      const url = request.nextUrl.clone()
      url.pathname = hasOnboarded ? "/home" : "/onboarding"
      return NextResponse.redirect(url)
    }

    // Redirect to onboarding if authenticated but not onboarded
    if (user && !hasOnboarded && isProtected && pathname !== "/onboarding") {
      const url = request.nextUrl.clone()
      url.pathname = "/onboarding"
      return NextResponse.redirect(url)
    }
  } catch {
    // Proxy error - allow request to continue
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
