"use client"

import React from "react"
import { useState, useEffect, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, ChevronLeft, BookOpen, Hash, FolderOpen, Bookmark, Share2, SlidersHorizontal, X } from "lucide-react"

import { getCleanTranslation, getCollectionDisplayName } from "@/lib/hadith-utils"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const COLLECTIONS = [
  { slug: "sahih-bukhari", label: "Bukhari" },
  { slug: "sahih-muslim", label: "Muslim" },
  { slug: "sunan-abu-dawud", label: "Abu Dawud" },
  { slug: "jami-tirmidhi", label: "Tirmidhi" },
  { slug: "sunan-nasai", label: "Nasai" },
  { slug: "sunan-ibn-majah", label: "Ibn Majah" },
  { slug: "muwatta-malik", label: "Malik" },
  { slug: "musnad-ahmad", label: "Ahmad" },
]

const GRADES = [
  { value: "sahih", label: "Sahih" },
  { value: "hasan", label: "Hasan" },
  { value: "daif", label: "Daif" },
]

const suggestedTerms = ["intentions", "faith", "patience", "prayer", "charity", "knowledge", "Paradise", "repentance"]

function buildSearchUrl(params: {
  q: string
  collection: string
  grade: string
  narrator: string
  number: string
  tag: string
}) {
  const { q, collection, grade, narrator, number, tag } = params
  const hasFilter = q.length >= 2 || collection || grade || narrator || number || tag
  if (!hasFilter) return null

  const p = new URLSearchParams()
  if (q.length >= 2) p.set("q", q)
  if (collection) p.set("collection", collection)
  if (grade) p.set("grade", grade)
  if (narrator) p.set("narrator", narrator)
  if (number) p.set("number", number)
  if (tag) p.set("tag", tag)
  return `/api/search?${p.toString()}`
}

function SearchContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = getSupabaseBrowserClient()

  const [query, setQuery] = useState(searchParams.get("q") || "")
  const [debouncedQuery, setDebouncedQuery] = useState(searchParams.get("q") || "")
  const [collection, setCollection] = useState(searchParams.get("collection") || "")
  const [grade, setGrade] = useState(searchParams.get("grade") || "")
  const [narrator, setNarrator] = useState(searchParams.get("narrator") || "")
  const [number, setNumber] = useState(searchParams.get("number") || "")
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(!!(narrator || number))
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const handleQueryChange = (value: string) => {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedQuery(value), 300)
  }

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current) }, [])

  const apiUrl = buildSearchUrl({ q: debouncedQuery, collection, grade, narrator, number, tag: "" })
  const { data, isLoading } = useSWR(apiUrl, fetcher)

  const results = data?.results || []
  const facets: Array<{ slug: string; name_en: string; count: number }> = data?.facets || []

  const filteredResults = activeTag
    ? results.filter((h: any) => h.tags?.some((t: any) => t.slug === activeTag))
    : results

  const hasFilters = collection || grade || narrator || number
  const activeFilterCount = [collection, grade, narrator, number].filter(Boolean).length

  const clearAllFilters = () => {
    setCollection("")
    setGrade("")
    setNarrator("")
    setNumber("")
    setActiveTag(null)
  }

  const handleSave = async (e: React.MouseEvent, hadithId: string) => {
    e.stopPropagation()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (savedIds.has(hadithId)) {
      await supabase.from("saved_hadiths").delete().eq("user_id", user.id).eq("hadith_id", hadithId)
      setSavedIds((prev) => { const next = new Set(prev); next.delete(hadithId); return next })
    } else {
      await supabase.from("saved_hadiths").insert({ user_id: user.id, hadith_id: hadithId })
      setSavedIds((prev) => new Set(prev).add(hadithId))
    }
  }

  const handleShare = async (e: React.MouseEvent, hadith: any) => {
    e.stopPropagation()
    const url = `${window.location.origin}/hadith/${hadith.id}`
    const text = getCleanTranslation(hadith.english_translation).substring(0, 200)
    if (navigator.share) {
      await navigator.share({ title: `Hadith #${hadith.hadith_number}`, text: text + "...", url })
    } else {
      await navigator.clipboard.writeText(url)
    }
  }

  return (
    <div className="min-h-screen marble-bg pb-20 md:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center hover:border-[#C5A059] transition-colors shrink-0"
            aria-label="Go back"
          >
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="flex-1 flex items-center gap-3 px-4 py-2.5 rounded-full bg-card border-2 border-[#C5A059]">
            <Search className="w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Search by topic, Arabic term, narrator..."
              className="flex-1 bg-transparent outline-none text-foreground"
              autoFocus
            />
            {query && (
              <button onClick={() => handleQueryChange("")} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowAdvanced((v) => !v)}
            className={cn(
              "w-10 h-10 rounded-full border flex items-center justify-center transition-colors shrink-0 relative",
              showAdvanced || hasFilters
                ? "bg-[#C5A059] border-[#C5A059] text-white"
                : "bg-background border-border text-muted-foreground hover:border-[#C5A059]"
            )}
            aria-label="Toggle filters"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white text-[#C5A059] text-[10px] font-bold flex items-center justify-center border border-[#C5A059]">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Filter Panel */}
        {showAdvanced && (
          <div className="border-t border-border bg-background/95 px-4 sm:px-6 py-3 space-y-3">
            {/* Collection filter */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Collection</p>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setCollection("")}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-xs font-medium transition-colors",
                    !collection ? "bg-[#1B5E43] text-white" : "bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  All
                </button>
                {COLLECTIONS.map((c) => (
                  <button
                    key={c.slug}
                    onClick={() => setCollection(collection === c.slug ? "" : c.slug)}
                    className={cn(
                      "px-2.5 py-1 rounded-full text-xs font-medium transition-colors",
                      collection === c.slug
                        ? "bg-[#1B5E43] text-white"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Grade filter */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Grade</p>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setGrade("")}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-xs font-medium transition-colors",
                    !grade ? "bg-[#C5A059] text-white" : "bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  All
                </button>
                {GRADES.map((g) => (
                  <button
                    key={g.value}
                    onClick={() => setGrade(grade === g.value ? "" : g.value)}
                    className={cn(
                      "px-2.5 py-1 rounded-full text-xs font-medium transition-colors",
                      grade === g.value
                        ? "bg-[#C5A059] text-white"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Narrator + Hadith Number */}
            <div className="flex gap-3">
              <div className="flex-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Narrator</p>
                <input
                  type="text"
                  value={narrator}
                  onChange={(e) => setNarrator(e.target.value)}
                  placeholder="e.g. Abu Hurairah"
                  className="w-full px-3 py-1.5 rounded-lg border border-border bg-card text-sm outline-none focus:border-[#C5A059] transition-colors"
                />
              </div>
              <div className="w-32">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Hadith #</p>
                <input
                  type="number"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  placeholder="e.g. 1"
                  min={1}
                  className="w-full px-3 py-1.5 rounded-lg border border-border bg-card text-sm outline-none focus:border-[#C5A059] transition-colors"
                />
              </div>
            </div>

            {/* Clear all filters */}
            {hasFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-[#C5A059] hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {isLoading ? (
          <div className="space-y-4">
            <div className="h-4 w-32 rounded bg-[#e5e7eb] animate-pulse" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl p-4 premium-card border border-border space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-28 rounded bg-[#e5e7eb] animate-pulse" />
                  <div className="h-4 w-24 rounded bg-muted animate-pulse" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-full rounded bg-muted animate-pulse" />
                  <div className="h-4 w-5/6 rounded bg-muted animate-pulse" />
                  <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-2">
              Found {filteredResults.length} result{filteredResults.length !== 1 ? "s" : ""}
              {activeTag ? ` · #${activeTag}` : ""}
              {collection ? ` · ${getCollectionDisplayName(collection)}` : ""}
              {grade ? ` · ${grade}` : ""}
            </p>

            {/* Tag facets */}
            {facets.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pb-2">
                {activeTag && (
                  <button
                    onClick={() => setActiveTag(null)}
                    className="px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Clear filter
                  </button>
                )}
                {facets.map((facet) => (
                  <button
                    key={facet.slug}
                    onClick={() => setActiveTag(activeTag === facet.slug ? null : facet.slug)}
                    className={cn(
                      "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors",
                      activeTag === facet.slug
                        ? "bg-[#C5A059] text-white"
                        : "bg-[#C5A059]/10 text-[#8A6E3A] hover:bg-[#C5A059]/20"
                    )}
                  >
                    <Hash className="w-3 h-3" />
                    {facet.name_en}
                    <span className="opacity-60">({facet.count})</span>
                  </button>
                ))}
              </div>
            )}

            {filteredResults.map((hadith: any) => (
              <div
                key={hadith.id}
                role="button"
                tabIndex={0}
                onClick={() => router.push(`/hadith/${hadith.id}`)}
                onKeyDown={(e) => e.key === "Enter" && router.push(`/hadith/${hadith.id}`)}
                className="w-full gold-border rounded-xl p-4 premium-card text-left hover:-translate-y-0.5 transition-transform cursor-pointer"
              >
                {hadith.summary_line && (
                  <p className="text-xs font-semibold text-[#C5A059] mb-2">{hadith.summary_line}</p>
                )}
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 rounded text-xs font-bold text-white bg-gradient-to-r from-[#1B5E43] to-[#2D7A5B]">
                    {getCollectionDisplayName(hadith.collection)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Book {hadith.book_number} / Hadith {hadith.hadith_number}
                  </span>
                  {hadith.grade && (
                    <span className="ml-auto px-2 py-0.5 rounded text-xs font-medium bg-[#C5A059]/10 text-[#C5A059]">
                      {hadith.grade}
                    </span>
                  )}
                </div>
                {hadith.narrator && (
                  <p className="text-xs text-muted-foreground mb-1">Narrated by: {hadith.narrator}</p>
                )}
                <p className="text-sm text-foreground line-clamp-4 leading-relaxed">
                  {getCleanTranslation(hadith.english_translation)}
                </p>
                {(hadith.tags?.length > 0 || hadith.category) && (
                  <div className="flex flex-wrap items-center gap-1.5 mt-3">
                    {hadith.category && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#1B5E43]/10 text-[#1B5E43] text-[11px] font-medium whitespace-nowrap">
                        <FolderOpen className="w-2.5 h-2.5 shrink-0" />
                        {hadith.category.name_en}
                      </span>
                    )}
                    {hadith.tags?.map((tag: { slug: string; name_en: string }) => (
                      <span
                        key={tag.slug}
                        className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#C5A059]/10 text-[#8A6E3A] text-[11px] font-medium whitespace-nowrap"
                      >
                        <Hash className="w-2.5 h-2.5 shrink-0" />
                        {tag.name_en}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                  <button
                    onClick={(e) => handleSave(e, hadith.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all",
                      savedIds.has(hadith.id)
                        ? "bg-gradient-to-r from-[#C5A059] to-[#E8C77D] text-white"
                        : "border border-border text-muted-foreground hover:border-[#C5A059] hover:text-[#C5A059]",
                    )}
                  >
                    <Bookmark className={cn("w-3.5 h-3.5", savedIds.has(hadith.id) && "fill-current")} />
                    {savedIds.has(hadith.id) ? "Saved" : "Save"}
                  </button>
                  <button
                    onClick={(e) => handleShare(e, hadith)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:border-[#C5A059] hover:text-[#C5A059] transition-all"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    Share
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : apiUrl ? (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground/40" />
            <p className="text-muted-foreground mb-4">
              No hadiths found{debouncedQuery.length > 1 ? ` for "${debouncedQuery}"` : ""}
              {hasFilters ? " with the current filters" : ""}
            </p>
            {hasFilters && (
              <button onClick={clearAllFilters} className="text-sm text-[#C5A059] hover:underline">
                Clear filters and try again
              </button>
            )}
            {!hasFilters && (
              <p className="text-sm text-muted-foreground/60">Try: {suggestedTerms.join(", ")}</p>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground/40" />
            <p className="text-muted-foreground mb-6">Search by keyword, narrator, hadith number, or use filters</p>
            <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
              {suggestedTerms.map((term) => (
                <button
                  key={term}
                  onClick={() => handleQueryChange(term)}
                  className="px-3 py-1.5 rounded-full text-sm border border-[#C5A059] text-[#C5A059] hover:bg-[#C5A059] hover:text-white transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen marble-bg flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  )
}
