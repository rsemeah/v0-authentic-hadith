"use client"

import { usePathname, useRouter } from "next/navigation"
import { ChevronLeft, Home } from "lucide-react"
import { cn } from "@/lib/utils"

// Root-level pages where back button should NOT appear
const rootPages = ["/home", "/collections", "/today", "/assistant", "/my-hadith"]

// Pages excluded from showing the top bar entirely
const excludedPaths = ["/", "/login", "/onboarding", "/reset-password"]

// Derive a page title from the pathname
function getPageTitle(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean)
  if (segments.length === 0) return ""

  // Map known routes to labels
  const routeLabels: Record<string, string> = {
    home: "Home",
    collections: "Collections",
    today: "Today",
    assistant: "AI Assistant",
    "my-hadith": "My Hadith",
    search: "Search",
    saved: "Saved",
    quiz: "Quiz",
    topics: "Topics",
    sunnah: "Sunnah",
    learn: "Learning Paths",
    stories: "Stories",
    reflections: "Reflections",
    progress: "Progress",
    achievements: "Achievements",
    profile: "Profile",
    settings: "Settings",
    pricing: "Pricing",
    hadith: "Hadith",
    share: "Share",
    dashboard: "Dashboard",
    about: "About",
  }

  // For deep pages, show the last meaningful segment
  const lastSegment = segments[segments.length - 1]

  // Check if the first segment has a known label
  const firstLabel = routeLabels[segments[0]]

  if (segments.length === 1) {
    return firstLabel || capitalize(lastSegment)
  }

  // For nested routes like /collections/bukhari, /topics/faith, etc.
  // Show the parent label
  if (segments.length === 2) {
    return firstLabel || capitalize(segments[0])
  }

  // For deeply nested routes like /collections/bukhari/books/1/chapters/2
  // Show a contextual title
  if (segments[0] === "collections") {
    if (segments.includes("chapters")) return "Chapter"
    if (segments.includes("books")) return "Book"
    return "Collection"
  }

  return firstLabel || capitalize(segments[0])
}

function capitalize(s: string): string {
  return s
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}

export function MobileTopBar() {
  const pathname = usePathname()
  const router = useRouter()

  const isExcluded = excludedPaths.some(
    (path) => pathname === path || (path !== "/" && pathname.startsWith(path))
  )

  if (isExcluded) return null

  const isRootPage = rootPages.includes(pathname)
  const isHomePage = pathname === "/home"
  const title = getPageTitle(pathname)

  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex items-center h-12 px-2 bg-card/95 backdrop-blur-sm border-b border-border",
        "md:hidden" // Only show on mobile
      )}
    >
      {/* Back button - hidden on root pages */}
      <div className="w-10 flex items-center justify-center">
        {!isRootPage && (
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-muted transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
        )}
      </div>

      {/* Title */}
      <div className="flex-1 text-center">
        <h1 className="text-sm font-semibold text-foreground truncate px-2">
          {title}
        </h1>
      </div>

      {/* Home button - always visible, hidden on home page itself */}
      <div className="w-10 flex items-center justify-center">
        {!isHomePage && (
          <button
            onClick={() => router.push("/home")}
            className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-muted transition-colors"
            aria-label="Go home"
          >
            <Home className="w-5 h-5 text-[#C5A059]" />
          </button>
        )}
      </div>
    </header>
  )
}
