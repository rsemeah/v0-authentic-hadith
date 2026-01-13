"use client"

import { useRouter } from "next/navigation"
import { BookOpen, Bot, GraduationCap, Bookmark } from "lucide-react"
import { cn } from "@/lib/utils"

const quickActions = [
  {
    id: "collections",
    icon: BookOpen,
    label: "Browse Collections",
    href: "/collections",
  },
  {
    id: "assistant",
    icon: Bot,
    label: "Ask AI Assistant",
    href: "/assistant",
  },
  {
    id: "learn",
    icon: GraduationCap,
    label: "Learning Paths",
    href: "/learn",
  },
  {
    id: "saved",
    icon: Bookmark,
    label: "My Saved Hadiths",
    href: "/profile?tab=saved",
  },
]

export function QuickActionsGrid() {
  const router = useRouter()

  return (
    <div className="grid grid-cols-2 gap-3">
      {quickActions.map((action) => (
        <button
          key={action.id}
          onClick={() => router.push(action.href)}
          className={cn(
            "group relative aspect-square flex flex-col items-center justify-center gap-3 p-4",
            "bg-[#F8F6F2] border border-[#C5A059] rounded-xl",
            "hover:bg-gradient-to-br hover:from-[#C5A059] hover:to-[#E8C77D]",
            "hover:-translate-y-1 hover:shadow-lg",
            "transition-all duration-200",
          )}
          aria-label={action.label}
        >
          <action.icon className="w-8 h-8 text-[#1a1f36] group-hover:text-white transition-colors" />
          <span className="text-sm font-medium text-[#1a1f36] group-hover:text-white text-center transition-colors">
            {action.label}
          </span>
        </button>
      ))}
    </div>
  )
}
