"use client"

import Link from "next/link"
import { BookOpen, Trash2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface BookmarkedHadithCardProps {
  bookmark: {
    id: string
    item_id: string
    item_type: string
    bookmarked_at: string
    folder_id: string | null
    tags: string[]
  }
  folderColor?: string | null
  folderName?: string | null
  onRemove?: (id: string) => void
}

export function BookmarkedHadithCard({ bookmark, folderColor, folderName, onRemove }: BookmarkedHadithCardProps) {
  const getHref = () => {
    switch (bookmark.item_type) {
      case "hadith":
        return `/hadith/${bookmark.item_id}`
      case "story_part":
        return `/stories/part/${bookmark.item_id}`
      case "sahabi":
        return `/stories/${bookmark.item_id}`
      default:
        return `/hadith/${bookmark.item_id}`
    }
  }

  const getTypeLabel = () => {
    switch (bookmark.item_type) {
      case "hadith":
        return "Hadith"
      case "story_part":
        return "Story"
      case "sahabi":
        return "Companion"
      case "collection":
        return "Collection"
      default:
        return bookmark.item_type
    }
  }

  return (
    <div className="group flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-secondary">
      {folderColor && (
        <div className="w-1 self-stretch rounded-full shrink-0" style={{ backgroundColor: folderColor }} />
      )}
      <Link href={getHref()} className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="text-xs font-medium text-muted-foreground">{getTypeLabel()}</span>
          {folderName && (
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
              style={{
                backgroundColor: `${folderColor}15`,
                color: folderColor || "var(--muted-foreground)",
              }}
            >
              {folderName}
            </span>
          )}
        </div>
        <p className="text-sm font-medium text-foreground line-clamp-2">
          {bookmark.item_type === "hadith" ? `Hadith #${bookmark.item_id}` : `Saved item`}
        </p>
        <span className="text-xs text-muted-foreground mt-1 block">
          Saved {formatDistanceToNow(new Date(bookmark.bookmarked_at), { addSuffix: true })}
        </span>
      </Link>
      {onRemove && (
        <button
          type="button"
          onClick={() => onRemove(bookmark.id)}
          className="opacity-0 group-hover:opacity-100 shrink-0 p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
          aria-label="Remove bookmark"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
