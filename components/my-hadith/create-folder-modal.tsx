"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"

const FOLDER_COLORS = [
  "#1b5e43",
  "#c5a059",
  "#b91c1c",
  "#2563eb",
  "#7c3aed",
  "#ea580c",
  "#0891b2",
  "#6b7280",
]

interface CreateFolderModalProps {
  onCreated?: () => void
}

export function CreateFolderModal({ onCreated }: CreateFolderModalProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [color, setColor] = useState(FOLDER_COLORS[0])
  const [icon, setIcon] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleCreate() {
    if (!name.trim()) return
    setLoading(true)
    try {
      const res = await fetch("/api/my-hadith/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), color, icon: icon || null }),
      })
      if (res.ok) {
        setOpen(false)
        setName("")
        setIcon("")
        onCreated?.()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-4 transition-colors hover:border-secondary hover:bg-muted/50 min-h-[120px]"
        >
          <Plus className="h-6 w-6 text-muted-foreground mb-1" />
          <span className="text-xs text-muted-foreground">New Collection</span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle>Create Collection</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 pt-2">
          <div>
            <Label htmlFor="folder-name">Name</Label>
            <Input
              id="folder-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Favorites, Daily Reads"
              maxLength={50}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="folder-icon">Icon (optional emoji)</Label>
            <Input
              id="folder-icon"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="e.g., a single emoji"
              maxLength={4}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label>Color</Label>
            <div className="flex gap-2 mt-1.5">
              {FOLDER_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="h-8 w-8 rounded-full border-2 transition-all"
                  style={{
                    backgroundColor: c,
                    borderColor: color === c ? "var(--foreground)" : "transparent",
                  }}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
          </div>
          <Button onClick={handleCreate} disabled={!name.trim() || loading} className="w-full mt-2">
            {loading ? "Creating..." : "Create Collection"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
