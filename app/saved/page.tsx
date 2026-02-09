"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import {
  Bookmark,
  Trash2,
  ExternalLink,
  PenLine,
  Check,
  X,
  FolderOpen,
  Search,
  Filter,
  StickyNote,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SavedHadith {
  id: string
  hadith_id: string
  created_at: string
  note: string | null
  folder: string | null
  hadiths: {
    id: string
    arabic_text: string
    english_translation: string
    collection: string
    reference: string
    grade: string
  }
}

const FOLDERS = [
  { id: "all", label: "All Saved" },
  { id: "default", label: "General" },
  { id: "favorites", label: "Favorites" },
  { id: "study", label: "Study Later" },
  { id: "share", label: "To Share" },
]

export default function SavedPage() {
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()
  const [savedHadiths, setSavedHadiths] = useState<SavedHadith[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFolder, setActiveFolder] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [noteText, setNoteText] = useState("")
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null)

  const fetchSavedHadiths = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from("saved_hadiths")
      .select(`
        id,
        hadith_id,
        created_at,
        note,
        folder,
        hadiths (
          id,
          arabic_text,
          english_translation,
          collection,
          reference,
          grade
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (data) {
      setSavedHadiths(data as unknown as SavedHadith[])
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchSavedHadiths()
  }, [fetchSavedHadiths])

  const handleRemove = async (savedId: string) => {
    await supabase.from("saved_hadiths").delete().eq("id", savedId)
    setSavedHadiths((prev) => prev.filter((h) => h.id !== savedId))
  }

  const handleSaveNote = async (savedId: string) => {
    await supabase.from("saved_hadiths").update({ note: noteText || null }).eq("id", savedId)
    setSavedHadiths((prev) => prev.map((h) => (h.id === savedId ? { ...h, note: noteText || null } : h)))
    setEditingNoteId(null)
    setNoteText("")
  }

  const handleMoveFolder = async (savedId: string, folder: string) => {
    await supabase.from("saved_hadiths").update({ folder }).eq("id", savedId)
    setSavedHadiths((prev) => prev.map((h) => (h.id === savedId ? { ...h, folder } : h)))
    setEditingFolderId(null)
  }

  const filtered = savedHadiths.filter((h) => {
    const matchesFolder = activeFolder === "all" || (h.folder || "default") === activeFolder
    const matchesSearch =
      !searchQuery ||
      h.hadiths.english_translation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.hadiths.reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.note?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFolder && matchesSearch
  })

  const gradeColors: Record<string, string> = {
    sahih: "bg-emerald-100 text-emerald-800",
    hasan: "bg-amber-100 text-amber-800",
    daif: "bg-red-100 text-red-800",
  }

  if (loading) {
    return (
      <div className="min-h-screen marble-bg flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen marble-bg">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full gold-icon-bg flex items-center justify-center">
              <Bookmark className="w-5 h-5 text-[#C5A059]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Saved Hadiths</h1>
              <p className="text-sm text-muted-foreground">
                {savedHadiths.length} saved{filtered.length !== savedHadiths.length && ` (${filtered.length} shown)`}
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search saved hadiths or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg premium-input text-sm"
            />
          </div>

          {/* Folder Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {FOLDERS.map((folder) => {
              const count =
                folder.id === "all"
                  ? savedHadiths.length
                  : savedHadiths.filter((h) => (h.folder || "default") === folder.id).length
              return (
                <button
                  key={folder.id}
                  onClick={() => setActiveFolder(folder.id)}
                  className={cn(
                    "flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                    activeFolder === folder.id
                      ? "bg-gradient-to-r from-[#C5A059] to-[#E8C77D] text-[#2c2416]"
                      : "border border-[#d4cfc7] text-muted-foreground hover:border-[#C5A059]",
                  )}
                >
                  {folder.label} ({count})
                </button>
              )
            })}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full gold-icon-bg flex items-center justify-center mx-auto mb-4">
              <Bookmark className="w-8 h-8 text-[#C5A059]" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              {savedHadiths.length === 0 ? "No Saved Hadiths" : "No matches"}
            </h2>
            <p className="text-muted-foreground mb-6">
              {savedHadiths.length === 0
                ? "Start saving hadiths to access them here."
                : "Try changing your folder or search query."}
            </p>
            {savedHadiths.length === 0 && (
              <button onClick={() => router.push("/collections")} className="gold-button px-6 py-2 rounded-lg">
                Browse Collections
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((saved) => (
              <div key={saved.id} className="premium-card gold-border rounded-xl overflow-hidden">
                <div className="p-4">
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">{saved.hadiths.collection}</span>
                      <span className="text-muted-foreground/40">|</span>
                      <span className="text-sm text-muted-foreground">{saved.hadiths.reference}</span>
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-xs font-medium capitalize",
                          gradeColors[saved.hadiths.grade] || "bg-gray-100 text-gray-800",
                        )}
                      >
                        {saved.hadiths.grade}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {/* Move to folder */}
                      <div className="relative">
                        <button
                          onClick={() =>
                            setEditingFolderId(editingFolderId === saved.id ? null : saved.id)
                          }
                          className="p-2 rounded-lg hover:bg-muted transition-colors"
                          title="Move to folder"
                        >
                          <FolderOpen className="w-4 h-4 text-muted-foreground" />
                        </button>
                        {editingFolderId === saved.id && (
                          <div className="absolute right-0 top-full mt-1 z-20 bg-card border border-border rounded-lg shadow-lg py-1 w-36">
                            {FOLDERS.filter((f) => f.id !== "all").map((folder) => (
                              <button
                                key={folder.id}
                                onClick={() => handleMoveFolder(saved.id, folder.id)}
                                className={cn(
                                  "w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors",
                                  (saved.folder || "default") === folder.id && "text-[#C5A059] font-medium",
                                )}
                              >
                                {folder.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => router.push(`/hadith/${saved.hadiths.id}`)}
                        className="p-2 rounded-lg hover:bg-muted transition-colors"
                        title="View full hadith"
                      >
                        <ExternalLink className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => handleRemove(saved.id)}
                        className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                        title="Remove from saved"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>

                  {/* Arabic Text */}
                  <p
                    className="text-lg font-arabic text-right text-foreground mb-3 leading-loose line-clamp-2"
                    dir="rtl"
                  >
                    {saved.hadiths.arabic_text}
                  </p>

                  {/* English Translation */}
                  <p className="text-foreground leading-relaxed line-clamp-3 mb-3">
                    {saved.hadiths.english_translation}
                  </p>

                  {/* Note Section */}
                  {editingNoteId === saved.id ? (
                    <div className="bg-[#fafaf9] rounded-lg p-3">
                      <textarea
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="Add a personal note..."
                        className="w-full bg-transparent border-none resize-none text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                        rows={3}
                        autoFocus
                      />
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => handleSaveNote(saved.id)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#1B5E43] text-white hover:bg-[#2D7A5B] transition-colors"
                        >
                          <Check className="w-3 h-3" />
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingNoteId(null)
                            setNoteText("")
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
                        >
                          <X className="w-3 h-3" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : saved.note ? (
                    <button
                      onClick={() => {
                        setEditingNoteId(saved.id)
                        setNoteText(saved.note || "")
                      }}
                      className="w-full text-left bg-[#C5A059]/5 border border-[#C5A059]/20 rounded-lg p-3 group hover:border-[#C5A059]/40 transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <StickyNote className="w-4 h-4 text-[#C5A059] flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-foreground/80 leading-relaxed">{saved.note}</p>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        Click to edit note
                      </p>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingNoteId(saved.id)
                        setNoteText("")
                      }}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border border-dashed border-[#d4cfc7] text-muted-foreground hover:border-[#C5A059] hover:text-[#C5A059] transition-colors"
                    >
                      <PenLine className="w-3 h-3" />
                      Add a note
                    </button>
                  )}

                  {/* Footer */}
                  <p className="text-xs text-muted-foreground mt-3">
                    Saved on {new Date(saved.created_at).toLocaleDateString()}
                    {saved.folder && saved.folder !== "default" && (
                      <span className="ml-2 px-2 py-0.5 rounded-full bg-muted text-[10px] font-medium capitalize">
                        {saved.folder}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
