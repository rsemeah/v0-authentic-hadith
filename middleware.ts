import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabase/config"

// Routes that don't require authentication
const PUBLIC_ROUTES = ["/", "/login", "/auth/callback", "/reset-password", "/pricing"]

// Routes that authenticated users should NOT see (redirect to /home)
const AUTH_ROUTES = ["/login"]

// API routes and static files -- skip middleware
const SKIP_PREFIXES = ["/api/", "/_next/", "/favicon", "/images/", "/icon", "/apple-icon"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for API routes, static files, etc.
  if (SKIP_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next()
  }

  // Create a response we can modify
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  // Create Supabase client that reads/writes cookies on the response
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          request.cookies.set(name, value)
          response.cookies.set(name, value, options)
        }
      },
    },
  })

  // Refresh the session (important: this updates cookies if the token was refreshed)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname)
  const isAuthRoute = AUTH_ROUTES.includes(pathname)

  // Not authenticated
  if (!user) {
    if (!isPublicRoute) {
      // Trying to access protected route -- redirect to login
      const loginUrl = new URL("/login", request.url)
      return NextResponse.redirect(loginUrl)
    }
    return response
  }

  // Authenticated user trying to access login page -- redirect to home
  if (isAuthRoute) {
    // Check if they've completed onboarding
    const { data: prefs } = await supabase
      .from("user_preferences")
      .select("onboarded")
      .eq("user_id", user.id)
      .single()

    if (prefs?.onboarded) {
      return NextResponse.redirect(new URL("/home", request.url))
    } else {
      return NextResponse.redirect(new URL("/onboarding", request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
}
