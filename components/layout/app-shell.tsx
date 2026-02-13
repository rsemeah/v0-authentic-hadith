"use client"

import type { ReactNode } from "react"
import { usePathname } from "next/navigation"
import { Sidebar } from "./sidebar"
import { MobileTopBar } from "./mobile-top-bar"
import { BottomNavigation } from "@/components/home/bottom-navigation"
import { cn } from "@/lib/utils"

// Pages that should NOT show the sidebar/navigation
const excludedPaths = ["/", "/login", "/onboarding", "/reset-password", "/checkout/success"]

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname()

  // Check if current path should be excluded
  const isExcluded = excludedPaths.some((path) => pathname === path || (path !== "/" && pathname.startsWith(path)))

  if (isExcluded) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Top Bar with back/home buttons */}
      <MobileTopBar />

      {/* Main Content - Shifted right on desktop to account for sidebar */}
      <div
        className={cn(
          "transition-all duration-300",
          "md:ml-[260px]", // Default sidebar width
          "pb-20 md:pb-0", // Bottom padding for mobile nav
        )}
      >
        {children}
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}
