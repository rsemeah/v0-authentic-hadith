"use client"

import Link from "next/link"
import { FolderOpen } from "lucide-react"

interface FolderCardProps {
  folder: {
    id: string
    name: string
    icon: string | null
    color: string
    item_count: number
    is_public: boolean
  }
}

export function FolderCard({ folder }: FolderCardProps) {
  return (
    <Link
      href={`/my-hadith/collections/${folder.id}`}
      className="group flex flex-col rounded-xl border border-border bg-card p-4 transition-all hover:border-secondary hover:shadow-sm"
    >
      <div className="mb-3 flex items-center justify-between">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg text-lg"
          style={{ backgroundColor: `${folder.color}20`, color: folder.color }}
        >
          {folder.icon || <FolderOpen className="h-5 w-5" />}
        </div>
        {folder.is_public && (
          <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
            Public
          </span>
        )}
      </div>
      <h3 className="text-sm font-semibold text-foreground mb-0.5 truncate">{folder.name}</h3>
      <span className="text-xs text-muted-foreground">
        {folder.item_count} {folder.item_count === 1 ? "item" : "items"}
      </span>
    </Link>
  )
}
