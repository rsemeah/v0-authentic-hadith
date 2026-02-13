"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import {
  X,
  Tags,
  Heart,
  GraduationCap,
  Users,
  PenLine,
  BarChart3,
  Trophy,
  Bookmark,
  Search,
  HelpCircle,
  User,
  Settings,
  LogOut,
  Sun,
  Moon,
} from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

interface MobileDrawerProps {
  open: boolean
  onClose: () => void
}

const drawerGroups = [
  {
    label: "Study",
    items: [
      { icon: Tags, label: "Topics", href: "/topics" },
      { icon: Heart, label: "Sunnah", href: "/sunnah" },
      { icon: GraduationCap, label: "Learning Paths", href: "/learn" },
      { icon: Users, label: "Stories", href: "/stories" },
    ],
  },
  {
    label: "Daily",
    items: [
      { icon: PenLine, label: "Reflections", href: "/reflections" },
      { icon: BarChart3, label: "Progress", href: "/progress" },
    ],
  },
  {
    label: "Personal",
    items: [
      { icon: Trophy, label: "Achievements", href: "/achievements" },
      { icon: Bookmark, label: "Saved", href: "/saved" },
    ],
  },
  {
    label: "Tools",
    items: [
      { icon: Search, label: "Search", href: "/search" },
      { icon: HelpCircle, label: "Quiz", href: "/quiz" },
    ],
  },
  {
    label: "Account",
    items: [
      { icon: User, label: "Profile", href: "/profile" },
      { icon: Settings, label: "Settings", href: "/settings" },
    ],
  },
]

export function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { resolvedTheme, setTheme } = useTheme()

  // Close drawer on route change
  useEffect(() => {
    if (open) {
      onClose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  const handleNavigation = (href: string) => {
    router.push(href)
    onClose()
  }

  const handleSignOut = async () => {
    const supabase = getSupabaseBrowserClient()
    await fetch("/api/auth/signout", { method: "POST" })
    await supabase.auth.signOut({ scope: "global" })
    document.cookie = "qbos_onboarded=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    router.push("/login")
    router.refresh()
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer panel */}
      <div
        className={cn(
          "fixed top-0 right-0 z-[70] h-full w-[280px] bg-card border-l border-border shadow-xl",
          "transform transition-transform duration-300 ease-in-out md:hidden",
          "overflow-y-auto",
          open ? "translate-x-0" : "translate-x-full",
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">Menu</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center"
            aria-label="Close menu"
          >
            <X className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {/* Navigation Groups */}
        <div className="py-2">
          {drawerGroups.map((group) => (
            <div key={group.label} className="px-3 py-2">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-1">
                {group.label}
              </p>
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                return (
                  <button
                    type="button"
                    key={item.href}
                    onClick={() => handleNavigation(item.href)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors",
                      "min-h-[44px]",
                      isActive
                        ? "bg-[#C5A059]/10 text-[#C5A059]"
                        : "text-foreground hover:bg-muted/50 active:bg-muted",
                    )}
                  >
                    <item.icon className={cn("w-5 h-5 shrink-0", isActive ? "text-[#C5A059]" : "text-muted-foreground")} />
                    <span className={cn("text-sm", isActive && "font-semibold")}>{item.label}</span>
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        {/* Theme Toggle */}
        <div className="px-6 py-3 border-t border-border">
          <button
            type="button"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors min-h-[44px] text-foreground hover:bg-muted/50 active:bg-muted"
          >
            {resolvedTheme === "dark" ? (
              <Sun className="w-5 h-5 text-[#C5A059] shrink-0" />
            ) : (
              <Moon className="w-5 h-5 text-muted-foreground shrink-0" />
            )}
            <span className="text-sm">{resolvedTheme === "dark" ? "Light Mode" : "Dark Mode"}</span>
          </button>
        </div>

        {/* Sign Out */}
        <div className="px-6 py-3 border-t border-border">
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors min-h-[44px] text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 active:bg-red-100"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span className="text-sm">Sign Out</span>
          </button>
        </div>
      </div>
    </>
  )
}
