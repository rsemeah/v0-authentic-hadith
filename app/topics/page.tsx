"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, BookOpen, Hash, Loader2 } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { BottomNavigation } from "@/components/home/bottom-navigation"
import { cn } from "@/lib/utils"

interface Category {
  id: string
  slug: string
  name_en: string
  name_ar: string | null
  description: string | null
  icon: string | null
  display_order: number
  tag_count?: number
  hadith_count?: number
}

interface Tag {
  id: string
  slug: string
  name_en: string
  name_ar: string | null
  usage_count: number
  category_id: string | null
}

const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  worship: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-800", icon: "text-emerald-600" },
  character: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-800", icon: "text-amber-600" },
  family: { bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-800", icon: "text-rose-600" },
  "daily-life": { bg: "bg-sky-50", border: "border-sky-200", text: "text-sky-800", icon: "text-sky-600" },
  knowledge: { bg: "bg-violet-50", border: "border-violet-200", text: "text-violet-800", icon: "text-violet-600" },
  community: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-800", icon: "text-blue-600" },
  afterlife: { bg: "bg-slate-50", border: "border-slate-200", text: "text-slate-800", icon: "text-slate-600" },
}

const DEFAULT_COLOR = { bg: "bg-muted", border: "border-border", text: "text-foreground", icon: "text-muted-foreground" }

export default function TopicsPage() {
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      // Fetch categories
      const { data: cats } = await supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("display_order")

      // Fetch tags with usage counts
      const { data: tgs } = await supabase
        .from("tags")
        .select("*")
        .eq("is_active", true)
        .order("usage_count", { ascending: false })

      // Count published enrichments per category
      const { data: catCounts } = await supabase
        .from("hadith_enrichment")
        .select("category_id")
        .eq("status", "published")

      const countMap = new Map<string, number>()
      for (const row of catCounts || []) {
        if (row.category_id) {
          countMap.set(row.category_id, (countMap.get(row.category_id) || 0) + 1)
        }
      }

      const enrichedCats = (cats || []).map((c: Category) => ({
        ...c,
        hadith_count: countMap.get(c.id) || 0,
        tag_count: (tgs || []).filter((t: Tag) => t.category_id === c.id).length,
      }))

      setCategories(enrichedCats)
      setTags(tgs || [])
      setLoading(false)
    }
    fetchData()
  }, [supabase])

  if (loading) {
    return (
      <div className="min-h-screen marble-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#C5A059]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen marble-bg pb-20 md:pb-0">
      <header className="sticky top-0 z-40 border-b border-[#e5e7eb] bg-[#F8F6F2]/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-[#F8F6F2] border border-[#e5e7eb] flex items-center justify-center hover:border-[#C5A059] transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-[#6b7280]" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-[#1a1f36]">Browse by Topic</h1>
            <p className="text-xs text-muted-foreground">
              {categories.reduce((sum, c) => sum + (c.hadith_count || 0), 0)} enriched hadiths across{" "}
              {categories.length} categories
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Categories Grid */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Categories
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {categories.map((cat) => {
              const colors = CATEGORY_COLORS[cat.slug] || DEFAULT_COLOR
              const isExpanded = expandedCategory === cat.id
              const catTags = tags.filter((t) => t.category_id === cat.id)

              return (
                <div key={cat.id} className={cn("rounded-xl border overflow-hidden transition-all", colors.border, colors.bg)}>
                  <button
                    onClick={() => {
                      if (cat.hadith_count && cat.hadith_count > 0) {
                        router.push(`/topics/${cat.slug}`)
                      } else {
                        setExpandedCategory(isExpanded ? null : cat.id)
                      }
                    }}
                    className="w-full p-4 flex items-center gap-4 text-left"
                  >
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0", colors.bg)}>
                      {cat.icon || ""}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={cn("font-semibold text-sm", colors.text)}>{cat.name_en}</h3>
                      {cat.name_ar && (
                        <p className="text-xs text-muted-foreground" dir="rtl">
                          {cat.name_ar}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {cat.description}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={cn("text-lg font-bold", colors.text)}>
                        {cat.hadith_count || 0}
                      </p>
                      <p className="text-[10px] text-muted-foreground">hadiths</p>
                    </div>
                    <ChevronRight className={cn("w-5 h-5 flex-shrink-0", colors.icon)} />
                  </button>

                  {/* Expanded tags */}
                  {isExpanded && catTags.length > 0 && (
                    <div className="px-4 pb-4 border-t border-border/30 pt-3">
                      <div className="flex flex-wrap gap-1.5">
                        {catTags.map((tag) => (
                          <button
                            key={tag.id}
                            onClick={() => router.push(`/topics/tag/${tag.slug}`)}
                            className={cn(
                              "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors",
                              "bg-white/70 border border-border/50 hover:border-[#C5A059] hover:text-[#8A6E3A]",
                            )}
                          >
                            <Hash className="w-3 h-3" />
                            {tag.name_en}
                            {tag.usage_count > 0 && (
                              <span className="text-[10px] text-muted-foreground ml-0.5">
                                ({tag.usage_count})
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* Popular Tags */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Popular Tags
          </h2>
          <div className="flex flex-wrap gap-2">
            {tags
              .filter((t) => t.usage_count > 0)
              .slice(0, 20)
              .map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => router.push(`/topics/tag/${tag.slug}`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-white border border-[#e5e7eb] hover:border-[#C5A059] hover:text-[#8A6E3A] transition-colors"
                >
                  <Hash className="w-3.5 h-3.5 text-[#C5A059]" />
                  {tag.name_en}
                  <span className="text-xs text-muted-foreground">({tag.usage_count})</span>
                </button>
              ))}
          </div>
          {tags.filter((t) => t.usage_count > 0).length === 0 && (
            <div className="premium-card rounded-xl p-6 text-center">
              <BookOpen className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                No enriched hadiths yet. Tags will appear as hadiths are enriched and published.
              </p>
            </div>
          )}
        </section>
      </main>

      <BottomNavigation />
    </div>
  )
}
