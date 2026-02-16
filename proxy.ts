import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

const publicPaths = ["/", "/login", "/pricing", "/checkout/success", "/reset-password"]
const protectedPrefixes = ["/home", "/dashboard", "/onboarding", "/profile", "/settings", "/saved", "/collections", "/hadith", "/assistant", "/search", "/learn", "/today", "/sunnah", "/stories", "/reflections", "/quiz", "/progress", "/share", "/topics"]

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const hasOnboarded = request.cookies.get("qbos_onboarded")?.value === "1"

  const isPublic = publicPaths.some((p) => pathname === p) ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/about") ||
    pathname.startsWith("/my-hadith")

  const isProtected = protectedPrefixes.some((prefix) => pathname.startsWith(prefix))

  if (!user && isProtected) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  if (user && pathname === "/login") {
    const url = request.nextUrl.clone()
    url.pathname = hasOnboarded ? "/home" : "/onboarding"
    return NextResponse.redirect(url)
  }

  if (user && !hasOnboarded && isProtected && pathname !== "/onboarding") {
    const url = request.nextUrl.clone()
    url.pathname = "/onboarding"
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
