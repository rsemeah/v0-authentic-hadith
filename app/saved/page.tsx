"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Bookmark, Trash2, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

interface SavedHadith {
  id: string
  hadith_id: string
  created_at: string
  hadiths: {
    id: string
    arabic_text: string
    english_translation: string
    collection: string
    reference: string
    grade: string
  }
}

export default function SavedPage() {
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()
  const [savedHadiths, setSavedHadiths] = useState<SavedHadith[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSavedHadiths = async () => {
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
    }

    fetchSavedHadiths()
  }, [supabase])

  const handleRemove = async (savedId: string) => {
    await supabase.from("saved_hadiths").delete().eq("id", savedId)
    setSavedHadiths((prev) => prev.filter((h) => h.id !== savedId))
  }

  const gradeColors = {
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
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full gold-icon-bg flex items-center justify-center">
              <Bookmark className="w-5 h-5 text-[#C5A059]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Saved Hadiths</h1>
              <p className="text-sm text-muted-foreground">{savedHadiths.length} saved</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {savedHadiths.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full gold-icon-bg flex items-center justify-center mx-auto mb-4">
              <Bookmark className="w-8 h-8 text-[#C5A059]" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">No Saved Hadiths</h2>
            <p className="text-muted-foreground mb-6">Start saving hadiths to access them here.</p>
            <button onClick={() => router.push("/collections")} className="gold-button px-6 py-2 rounded-lg">
              Browse Collections
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {savedHadiths.map((saved) => (
              <div key={saved.id} className="premium-card p-4 gold-border">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">{saved.hadiths.collection}</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">{saved.hadiths.reference}</span>
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-medium capitalize",
                        gradeColors[saved.hadiths.grade as keyof typeof gradeColors] || "bg-gray-100 text-gray-800",
                      )}
                    >
                      {saved.hadiths.grade}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
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

                <p className="text-lg font-arabic text-right text-foreground mb-3 leading-loose">
                  {saved.hadiths.arabic_text}
                </p>

                <p className="text-foreground leading-relaxed">{saved.hadiths.english_translation}</p>

                <p className="text-xs text-muted-foreground mt-3">
                  Saved on {new Date(saved.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
