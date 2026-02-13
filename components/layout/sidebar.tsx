"use client"

import React, { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import {
  Home,
  BookOpen,
  Search,
  Bot,
  User,
  Settings,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Bookmark,
  Sun,
  Moon,
  Heart,
  Users,
  PenLine,
  BarChart3,
  HelpCircle,
  Tags,
  Shield,
  Star,
  Trophy,
} from "lucide-react"

interface NavGroup {
  label: string
  items: NavItem[]
}

interface NavItem {
  id: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  href: string
  iconColor?: string // resting color class
  iconHover?: string // hover color class
}

const navGroups: NavGroup[] = [
  {
    label: "",
    items: [{ id: "home", icon: Home, label: "Home", href: "/home", iconColor: "text-[#c5a059]/70", iconHover: "group-hover:text-[#c5a059]" }],
  },
  {
    label: "Study",
    items: [
      { id: "collections", icon: BookOpen, label: "Collections", href: "/collections", iconColor: "text-[#1b5e43]/60", iconHover: "group-hover:text-[#1b5e43]" },
      { id: "topics", icon: Tags, label: "Topics", href: "/topics", iconColor: "text-[#e8c77d]/80", iconHover: "group-hover:text-[#c5a059]" },
      { id: "sunnah", icon: Heart, label: "Sunnah", href: "/sunnah", iconColor: "text-[#c5a059]/60", iconHover: "group-hover:text-[#c5a059]" },
      { id: "learn", icon: GraduationCap, label: "Learning Paths", href: "/learn", iconColor: "text-[#2d7a5b]/60", iconHover: "group-hover:text-[#1b5e43]" },
      { id: "stories", icon: Users, label: "Stories", href: "/stories" },
    ],
  },
  {
    label: "Daily",
    items: [
      { id: "today", icon: Sun, label: "Today", href: "/today", iconColor: "text-[#e8c77d]/80", iconHover: "group-hover:text-[#c5a059]" },
      { id: "reflections", icon: PenLine, label: "Reflections", href: "/reflections" },
      { id: "progress", icon: BarChart3, label: "Progress", href: "/progress", iconColor: "text-[#2d7a5b]/60", iconHover: "group-hover:text-[#1b5e43]" },
    ],
  },
  {
    label: "Personal",
    items: [
      { id: "my-hadith", icon: Star, label: "My Hadith", href: "/my-hadith", iconColor: "text-[#c5a059]/70", iconHover: "group-hover:text-[#c5a059]" },
      { id: "achievements", icon: Trophy, label: "Achievements", href: "/achievements", iconColor: "text-[#e8c77d]/80", iconHover: "group-hover:text-[#c5a059]" },
      { id: "saved", icon: Bookmark, label: "Saved", href: "/saved" },
    ],
  },
  {
    label: "Tools",
    items: [
      { id: "search", icon: Search, label: "Search", href: "/search" },
      { id: "assistant", icon: Bot, label: "AI Assistant", href: "/assistant", iconColor: "text-[#1b5e43]/60", iconHover: "group-hover:text-[#1b5e43]" },
      { id: "quiz", icon: HelpCircle, label: "Quiz", href: "/quiz" },
    ],
  },
]

const bottomNavItems = [
  { id: "profile", icon: User, label: "Profile", href: "/profile" },
  { id: "settings", icon: Settings, label: "Settings", href: "/settings" },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [userName, setUserName] = useState<string | null>(null)
  const [userAvatar, setUserAvatar] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const { setTheme, resolvedTheme } = useTheme()
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("name, avatar_url")
            .eq("user_id", user.id)
            .single()
          if (profile) {
            setUserName(profile.name)
            setUserAvatar(profile.avatar_url)
          }
        }
      } catch {
        /* ignore */
      }
    }
    fetchUser()
  }, [supabase])

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/signout", { method: "POST" })
      await supabase.auth.signOut({ scope: "global" })
    } catch {
      /* ignore */
    }
    document.cookie = "qbos_onboarded=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    router.push("/login")
    router.refresh()
  }

  const isItemActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/")

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-50 h-screen bg-card border-r border-border",
        "hidden md:flex flex-col transition-all duration-300",
        collapsed ? "w-[72px]" : "w-[260px]",
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex items-center gap-3 p-4 border-b border-border",
          collapsed ? "justify-center" : "px-5",
        )}
      >
        <div className="relative w-10 h-10 flex-shrink-0">
          <Image
            src="/images/gemini-generated-image-xw5svjxw5svjxw5s.jpeg"
            alt="Authentic Hadith"
            fill
            className="object-contain"
          />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="font-semibold gold-text text-lg leading-tight whitespace-nowrap">
              Authentic Hadith
            </h1>
            <p className="text-xs text-muted-foreground whitespace-nowrap">
              Learn from verified sources
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {navGroups.map((group, groupIdx) => (
          <div key={group.label || `group-${groupIdx}`} className={cn(groupIdx > 0 && "mt-2")}>
            {group.label && !collapsed && (
              <div className="px-5 py-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                  {group.label}
                </span>
              </div>
            )}
            {group.label && collapsed && <div className="mx-4 my-1 border-t border-border/50" />}
            <ul className="space-y-0.5 px-3">
              {group.items.map((item) => {
                const isActive = isItemActive(item.href)
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => router.push(item.href)}
                      className={cn(
                        "relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg",
                        "transition-all duration-200 group",
                        isActive
                          ? "bg-gradient-to-r from-[#C5A059]/15 to-[#E8C77D]/10 text-[#8A6E3A]"
                          : "text-foreground hover:bg-muted",
                        collapsed && "justify-center px-0",
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-gradient-to-b from-[#C5A059] to-[#E8C77D]" />
                      )}
                      <item.icon
                        className={cn(
                          "w-5 h-5 flex-shrink-0 transition-colors",
                          isActive
                            ? "text-[#C5A059]"
                            : item.iconColor
                              ? cn(item.iconColor, item.iconHover)
                              : "text-muted-foreground group-hover:text-foreground",
                        )}
                      />
                      {!collapsed && (
                        <span className={cn("font-medium text-sm whitespace-nowrap", isActive && "gold-text")}>
                          {item.label}
                        </span>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="border-t border-border">
        <ul className="py-2 px-3 space-y-1">
          {bottomNavItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.id}>
                <button
                  onClick={() => router.push(item.href)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg",
                    "transition-all duration-200 group",
                    isActive
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    collapsed && "justify-center px-0",
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span className="text-sm whitespace-nowrap">{item.label}</span>}
                </button>
              </li>
            )
          })}
        </ul>

        {/* User */}
        <div className={cn("p-3 border-t border-border", collapsed && "flex justify-center")}>
          {collapsed ? (
            <button
              onClick={() => router.push("/profile")}
              className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#C5A059]/30 hover:border-[#C5A059] transition-colors"
            >
              {userAvatar ? (
                <img src={userAvatar || "/placeholder.svg"} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <User className="w-5 h-5 text-muted-foreground" />
                </div>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/profile")}
                className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#C5A059]/30 hover:border-[#C5A059] transition-colors flex-shrink-0"
              >
                {userAvatar ? (
                  <img src={userAvatar || "/placeholder.svg"} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <User className="w-5 h-5 text-muted-foreground" />
                  </div>
                )}
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{userName || "User"}</p>
                <button
                  onClick={handleSignOut}
                  className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
                >
                  <LogOut className="w-3 h-3" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Theme & Collapse */}
        <div className="p-2 border-t border-border flex items-center gap-2">
          {mounted && (
            <button
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className={cn(
                "flex items-center justify-center gap-2 py-2 rounded-lg",
                "text-muted-foreground hover:text-foreground hover:bg-muted transition-all",
                collapsed ? "w-full" : "px-3",
              )}
              aria-label="Toggle theme"
              title={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {resolvedTheme === "dark" ? (
                <Sun className="w-5 h-5 text-[#C5A059]" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
              {!collapsed && (
                <span className="text-xs">{resolvedTheme === "dark" ? "Light" : "Dark"}</span>
              )}
            </button>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "flex items-center justify-center gap-2 py-2 rounded-lg",
              "text-muted-foreground hover:text-foreground hover:bg-muted transition-all",
              collapsed ? "w-full" : "flex-1",
            )}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5" />
                <span className="text-xs">Collapse</span>
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  )
}
