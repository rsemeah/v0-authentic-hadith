"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { ChevronLeft, Hash, Loader2, BookOpen } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { BottomNavigation } from "@/components/home/bottom-navigation"
import { HadithCardCondensed } from "@/components/collections/hadith-card-condensed"
import { cn } from "@/lib/utils"

interface Tag {
  id: string
  slug: string
  name_en: string
  usage_count: number
}

interface EnrichedHadith {
  id: string
  arabic_text: string
  english_translation: string
  narrator: string
  grade: "sahih" | "hasan" | "daif"
  collection: string
  reference: string
  hadith_number: number
  summary_line?: string
  tags?: string[]
}

export default function CategoryDetailPage() {
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string
  const supabase = getSupabaseBrowserClient()

  const [category, setCategory] = useState<{ name_en: string; name_ar: string | null; description: string | null; icon: string | null } | null>(null)
  const [hadiths, setHadiths] = useState<EnrichedHadith[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      // Get category
      const { data: cat } = await supabase
        .from("categories")
        .select("id, name_en, name_ar, description, icon")
        .eq("slug", slug)
        .single()

      if (!cat) {
        setLoading(false)
        return
      }
      setCategory(cat)

      // Get tags for this category
      const { data: catTags } = await supabase
        .from("tags")
        .select("id, slug, name_en, usage_count")
        .eq("category_id", cat.id)
        .eq("is_active", true)
        .order("usage_count", { ascending: false })
      setTags(catTags || [])

      // Get published enrichments for this category
      const { data: enrichments } = await supabase
        .from("hadith_enrichment")
        .select("hadith_id, summary_line")
        .eq("category_id", cat.id)
        .eq("status", "published")
        .limit(100)

      if (enrichments && enrichments.length > 0) {
        const hadithIds = enrichments.map((e: { hadith_id: string }) => e.hadith_id)
        const { data: hadithData } = await supabase
          .from("hadiths")
          .select("id, arabic_text, english_translation, narrator, grade, collection, reference, hadith_number")
          .in("id", hadithIds)

        // Merge summary lines
        const summaryMap = new Map(enrichments.map((e: { hadith_id: string; summary_line: string }) => [e.hadith_id, e.summary_line]))
        const merged = (hadithData || []).map((h: EnrichedHadith) => ({
          ...h,
          summary_line: summaryMap.get(h.id) || undefined,
        }))
        setHadiths(merged)
      }

      setLoading(false)
    }
    fetchData()
  }, [supabase, slug])

  // Filter by tag
  useEffect(() => {
    if (!activeTag || !category) return

    const filterByTag = async () => {
      setLoading(true)
      // Get hadith_ids for this tag
      const { data: taggedIds } = await supabase
        .from("hadith_tags")
        .select("hadith_id")
        .eq("tag_id", activeTag)
        .eq("status", "published")

      if (taggedIds && taggedIds.length > 0) {
        const ids = taggedIds.map((t: { hadith_id: string }) => t.hadith_id)
        const { data: hadithData } = await supabase
          .from("hadiths")
          .select("id, arabic_text, english_translation, narrator, grade, collection, reference, hadith_number")
          .in("id", ids)

        // Get summaries
        const { data: enrichments } = await supabase
          .from("hadith_enrichment")
          .select("hadith_id, summary_line")
          .in("hadith_id", ids)
          .eq("status", "published")

        const summaryMap = new Map((enrichments || []).map((e: { hadith_id: string; summary_line: string }) => [e.hadith_id, e.summary_line]))
        setHadiths(
          (hadithData || []).map((h: EnrichedHadith) => ({
            ...h,
            summary_line: summaryMap.get(h.id) || undefined,
          })),
        )
      } else {
        setHadiths([])
      }
      setLoading(false)
    }
    filterByTag()
  }, [activeTag, supabase, category])

  if (loading) {
    return (
      <div className="min-h-screen marble-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#C5A059]" />
      </div>
    )
  }

  if (!category) {
    return (
      <div className="min-h-screen marble-bg flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground/40" />
          <p className="text-muted-foreground">Category not found</p>
          <button onClick={() => router.push("/topics")} className="mt-4 px-4 py-2 rounded-lg gold-button text-sm">
            Back to Topics
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen marble-bg pb-20 md:pb-0">
      <header className="sticky top-0 z-40 border-b border-[#e5e7eb] bg-[#F8F6F2]/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => router.push("/topics")}
            className="w-10 h-10 rounded-full bg-[#F8F6F2] border border-[#e5e7eb] flex items-center justify-center hover:border-[#C5A059] transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-[#6b7280]" />
          </button>
          <div className="flex items-center gap-3">
            {category.icon && <span className="text-2xl">{category.icon}</span>}
            <div>
              <h1 className="text-lg font-bold text-[#1a1f36]">{category.name_en}</h1>
              <p className="text-xs text-muted-foreground">{hadiths.length} hadiths</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Description */}
        {category.description && (
          <p className="text-sm text-muted-foreground leading-relaxed">{category.description}</p>
        )}

        {/* Tag Filters */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTag(null)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                !activeTag
                  ? "bg-[#1B5E43] text-white"
                  : "bg-white border border-[#e5e7eb] text-muted-foreground hover:border-[#1B5E43]",
              )}
            >
              All
            </button>
            {tags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => setActiveTag(tag.id === activeTag ? null : tag.id)}
                className={cn(
                  "flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                  tag.id === activeTag
                    ? "bg-[#C5A059] text-white"
                    : "bg-white border border-[#e5e7eb] text-muted-foreground hover:border-[#C5A059]",
                )}
              >
                <Hash className="w-3 h-3" />
                {tag.name_en}
              </button>
            ))}
          </div>
        )}

        {/* Hadith List */}
        {hadiths.length === 0 ? (
          <div className="premium-card rounded-xl p-8 text-center">
            <BookOpen className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-muted-foreground">No published hadiths in this category yet.</p>
            <p className="text-xs text-muted-foreground mt-1">
              Hadiths will appear here once they are enriched and published by reviewers.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {hadiths.map((hadith, idx) => (
              <div key={hadith.id} className="space-y-1">
                {hadith.summary_line && (
                  <p className="text-xs font-medium text-[#C5A059] px-1">{hadith.summary_line}</p>
                )}
                <HadithCardCondensed
                  hadith={hadith}
                  referenceNumber={idx + 1}
                  collectionName={hadith.collection}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  )
}
