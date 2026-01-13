"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import Image from "next/image"
import { cn } from "@/lib/utils"
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
} from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

const mainNavItems = [
  { id: "home", icon: Home, label: "Home", href: "/home" },
  { id: "collections", icon: BookOpen, label: "Collections", href: "/collections" },
  { id: "search", icon: Search, label: "Search", href: "/search" },
  { id: "assistant", icon: Bot, label: "AI Assistant", href: "/assistant" },
  { id: "learn", icon: GraduationCap, label: "Learning Paths", href: "/learn" },
  { id: "saved", icon: Bookmark, label: "Saved", href: "/saved" },
]

const bottomNavItems = [
  { id: "profile", icon: User, label: "Profile", href: "/profile" },
  { id: "settings", icon: Settings, label: "Settings", href: "/settings" },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()
  const [collapsed, setCollapsed] = useState(false)
  const [userName, setUserName] = useState<string | null>(null)
  const [userAvatar, setUserAvatar] = useState<string | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
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
    }
    fetchUser()
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-50 h-screen bg-card border-r border-border",
        "hidden md:flex flex-col transition-all duration-300",
        collapsed ? "w-[72px]" : "w-[260px]",
      )}
    >
      {/* Logo Section */}
      <div className={cn("flex items-center gap-3 p-4 border-b border-border", collapsed ? "justify-center" : "px-5")}>
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
            <h1 className="font-semibold gold-text text-lg leading-tight whitespace-nowrap">Authentic Hadith</h1>
            <p className="text-xs text-muted-foreground whitespace-nowrap">Learn from verified sources</p>
          </div>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-3">
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
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
                  {/* Active indicator bar */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-gradient-to-b from-[#C5A059] to-[#E8C77D]" />
                  )}
                  <item.icon
                    className={cn(
                      "w-5 h-5 flex-shrink-0 transition-colors",
                      isActive ? "text-[#C5A059]" : "text-muted-foreground group-hover:text-foreground",
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
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-border">
        {/* Secondary Nav Items */}
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

        {/* User Section */}
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

        {/* Collapse Toggle */}
        <div className="p-2 border-t border-border">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-2 rounded-lg",
              "text-muted-foreground hover:text-foreground hover:bg-muted transition-all",
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
