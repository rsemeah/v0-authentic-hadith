"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { usePathname, useRouter } from "next/navigation"
import { Home, BookOpen, Sun, Bot, Star, Menu } from "lucide-react"
import { MobileDrawer } from "@/components/layout/mobile-drawer"

const navItems = [
  { id: "home", icon: Home, label: "Home", href: "/home" },
  { id: "collections", icon: BookOpen, label: "Study", href: "/collections" },
  { id: "today", icon: Sun, label: "Today", href: "/today" },
  { id: "assistant", icon: Bot, label: "Chat", href: "/assistant" },
  { id: "my-hadith", icon: Star, label: "My Hadith", href: "/my-hadith" },
]

const excludedPaths = ["/", "/login", "/onboarding", "/reset-password"]

export function BottomNavigation() {
  const pathname = usePathname()
  const router = useRouter()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const isExcluded = excludedPaths.some((path) => pathname === path || (path !== "/" && pathname.startsWith(path)))

  if (isExcluded) {
    return null
  }

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-[0_-2px_8px_rgba(0,0,0,0.1)] md:hidden">
        <div className="flex items-center justify-around h-[72px]">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <button
                type="button"
                key={item.id}
                onClick={() => router.push(item.href)}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full",
                  "transition-colors",
                )}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
              >
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-b-full bg-gradient-to-r from-[#C5A059] to-[#E8C77D]" />
                )}
                <item.icon className={cn("w-5 h-5 transition-colors", isActive ? "text-[#C5A059]" : "text-foreground")} />
                <span
                  className={cn(
                    "text-[10px] transition-colors",
                    isActive ? "text-[#C5A059] font-bold" : "text-foreground",
                  )}
                >
                  {item.label}
                </span>
              </button>
            )
          })}

          {/* More tab - opens drawer */}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className={cn(
              "relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full",
              "transition-colors",
            )}
            aria-label="More"
          >
            <Menu className="w-5 h-5 text-foreground" />
            <span className="text-[10px] text-foreground">More</span>
          </button>
        </div>
      </nav>

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  )
}
