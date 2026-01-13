import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Check if user has completed onboarding
  const hasOnboarded = request.cookies.get("qbos_onboarded")?.value === "1"

  // Protect dashboard and home routes - require auth
  if (!user && (pathname.startsWith("/dashboard") || pathname.startsWith("/home"))) {
    const url = request.nextUrl.clone()
    url.pathname = "/"
    return NextResponse.redirect(url)
  }

  // Protect onboarding route - require auth
  if (!user && pathname.startsWith("/onboarding")) {
    const url = request.nextUrl.clone()
    url.pathname = "/"
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users from auth page
  if (user && pathname === "/") {
    const url = request.nextUrl.clone()
    // If not onboarded, send to onboarding
    if (!hasOnboarded) {
      url.pathname = "/onboarding"
    } else {
      url.pathname = "/home"
    }
    return NextResponse.redirect(url)
  }

  // Redirect to onboarding if authenticated but not onboarded
  if (user && !hasOnboarded && pathname !== "/onboarding" && pathname !== "/" && !pathname.startsWith("/api")) {
    const url = request.nextUrl.clone()
    url.pathname = "/onboarding"
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
