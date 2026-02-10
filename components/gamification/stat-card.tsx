"use client"

import React from "react"

import { cn } from "@/lib/utils"
import { BookOpen, Flame, Star, Bookmark, Share2, PenLine } from "lucide-react"

const iconMap: Record<string, React.ElementType> = {
  BookOpen,
  Flame,
  Star,
  Bookmark,
  Share2,
  PenLine,
}

interface StatCardProps {
  icon: string
  label: string
  value: number | string
  className?: string
}

export function StatCard({ icon, label, value, className }: StatCardProps) {
  const IconComponent = iconMap[icon] || Star

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-1.5 rounded-xl border border-border bg-card p-4 text-center",
        className,
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/15">
        <IconComponent className="h-5 w-5 text-secondary" />
      </div>
      <span className="text-2xl font-bold text-foreground">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}
