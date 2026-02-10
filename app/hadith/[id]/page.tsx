"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { ChevronLeft, Bookmark, Share2, BookOpen, ImageIcon, CheckCircle2, Hash, FolderOpen } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { BottomNavigation } from "@/components/home/bottom-navigation"
import { DiscussionSection } from "@/components/hadith/discussion-section"
import { cn } from "@/lib/utils"
import { parseEnglishTranslation, getCollectionDisplayName } from "@/lib/hadith-utils"
import { trackActivity } from "@/app/actions/track-activity"

interface Hadith {
  id: string
  arabic_text: string
  english_translation: string
  collection: string
  book_number: number
  hadith_number: number
  reference: string
  grade: "sahih" | "hasan" | "daif"
  narrator: string
}

export default function HadithDetailPage() {
  const router = useRouter()
  const params = useParams()
  const supabase = getSupabaseBrowserClient()
  const [hadith, setHadith] = useState<Hadith | null>(null)
  const [isSaved, setIsSaved] = useState(false)
  const [isRead, setIsRead] = useState(false)
  const [loading, setLoading] = useState(true)
  const [enrichment, setEnrichment] = useState<{
    summary_line: string | null
    category: { slug: string; name_en: string } | null
    tags: Array<{ slug: string; name_en: string }>
  } | null>(null)

  useEffect(() => {
    const fetchHadith = async () => {
      const { data } = await supabase.from("hadiths").select("*").eq("id", params.id).single()

      if (data) {
        setHadith(data)

        // Check if saved
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user) {
          const { data: savedData } = await supabase
            .from("saved_hadiths")
            .select("id")
            .eq("user_id", user.id)
            .eq("hadith_id", data.id)
            .single()

          setIsSaved(!!savedData)

          // Check if marked as read
          const { data: readData } = await supabase
            .from("reading_progress")
            .select("id")
            .eq("user_id", user.id)
            .eq("hadith_id", data.id)
            .single()
          setIsRead(!!readData)

          // Track view
          await supabase
            .from("hadith_views")
            .upsert(
              { user_id: user.id, hadith_id: data.id, viewed_at: new Date().toISOString() },
              { onConflict: "user_id,hadith_id" },
            )
        }
      }
      // Fetch enrichment data
      const { data: enrichData } = await supabase
        .from("hadith_enrichment")
        .select("summary_line, category:categories!category_id(slug, name_en)")
        .eq("hadith_id", params.id)
        .eq("status", "published")
        .single()

      if (enrichData) {
        // Fetch tags
        const { data: tagData } = await supabase
          .from("hadith_tags")
          .select("tag:tags!tag_id(slug, name_en)")
          .eq("hadith_id", params.id as string)
          .eq("status", "published")

        setEnrichment({
          summary_line: enrichData.summary_line,
          category: enrichData.category as { slug: string; name_en: string } | null,
          tags: (tagData || []).map((t: { tag: { slug: string; name_en: string } | null }) => t.tag).filter(Boolean) as Array<{ slug: string; name_en: string }>,
        })
      }

      setLoading(false)
    }

    fetchHadith()
  }, [supabase, params.id])

  const handleSave = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user || !hadith) return

    if (isSaved) {
      await supabase.from("saved_hadiths").delete().eq("user_id", user.id).eq("hadith_id", hadith.id)
      // Also remove from user_bookmarks
      await supabase
        .from("user_bookmarks")
        .delete()
        .eq("user_id", user.id)
        .eq("item_id", hadith.id)
        .eq("item_type", "hadith")
    } else {
      await supabase.from("saved_hadiths").insert({
        user_id: user.id,
        hadith_id: hadith.id,
      })
      // Also add to user_bookmarks for My Hadith
      await supabase.from("user_bookmarks").upsert(
        {
          user_id: user.id,
          item_id: hadith.id,
          item_type: "hadith",
          bookmarked_at: new Date().toISOString(),
        },
        { onConflict: "user_id,item_id,item_type" },
      )
      trackActivity("hadith_save", hadith.id).catch(() => {})
    }
    setIsSaved(!isSaved)
  }

  const handleMarkRead = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user || !hadith) return

    if (isRead) {
      await supabase.from("reading_progress").delete().eq("user_id", user.id).eq("hadith_id", hadith.id)
    } else {
      // Find the collection_id for this hadith
      const { data: collData } = await supabase
        .from("collections")
        .select("id")
        .eq("slug", hadith.collection)
        .single()

      await supabase.from("reading_progress").insert({
        user_id: user.id,
        hadith_id: hadith.id,
        collection_id: collData?.id || null,
      })

      // Award XP for reading a hadith
      trackActivity("hadith_read", hadith.id).catch(() => {})
    }
    setIsRead(!isRead)
  }

  const handleShare = async () => {
    if (!hadith) return
    if (navigator.share) {
      await navigator.share({
        title: "Authentic Hadith",
        text: hadith.english_translation,
        url: window.location.href,
      })
    } else {
      await navigator.clipboard.writeText(window.location.href)
      alert("Link copied to clipboard!")
    }
    trackActivity("hadith_shared", hadith.id).catch(() => {})
  }

  const gradeColors = {
    sahih: "from-[#10b981] to-[#34d399]",
    hasan: "from-[#3b82f6] to-[#60a5fa]",
    daif: "from-[#6b7280] to-[#9ca3af]",
  }

  const gradeLabels = {
    sahih: "Sahih",
    hasan: "Hasan",
    daif: "Da'if",
  }

  if (loading) {
    return (
      <div className="min-h-screen marble-bg flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!hadith) {
    return (
      <div className="min-h-screen marble-bg flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground/40" />
          <p className="text-muted-foreground">Hadith not found</p>
          <button onClick={() => router.push("/home")} className="mt-4 px-4 py-2 rounded-lg gold-button">
            Go Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen marble-bg pb-20 md:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center hover:border-[#C5A059] transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <h1 className="text-lg font-semibold text-foreground">Hadith Detail</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                isSaved
                  ? "bg-gradient-to-r from-[#C5A059] to-[#E8C77D] text-white"
                  : "bg-background border border-border text-muted-foreground hover:border-[#C5A059]",
              )}
            >
              <Bookmark className={cn("w-5 h-5", isSaved && "fill-current")} />
            </button>
            <button
              onClick={() => router.push(`/share?hadith=${hadith?.id}`)}
              className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground hover:border-[#C5A059] transition-colors"
              title="Create sharing card"
            >
              <ImageIcon className="w-5 h-5" />
            </button>
            <button
              onClick={handleShare}
              className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground hover:border-[#C5A059] transition-colors"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="gold-border rounded-2xl p-6 sm:p-8 premium-card">
          {/* Badges */}
          <div className="flex items-center justify-between mb-6">
            <span className="px-3 py-1.5 rounded-md text-xs font-bold text-white bg-gradient-to-r from-[#1B5E43] to-[#2D7A5B]">
              {getCollectionDisplayName(hadith.collection)}
            </span>
            <span
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-bold text-white bg-gradient-to-r",
                gradeColors[hadith.grade],
              )}
            >
              {gradeLabels[hadith.grade]}
            </span>
          </div>

          {/* Enrichment: Summary + Tags */}
          {enrichment && (
            <div className="mb-6 space-y-3">
              {enrichment.summary_line && (
                <p className="text-base font-semibold text-[#C5A059] leading-snug">
                  {enrichment.summary_line}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-1.5">
                {enrichment.category && (
                  <button
                    onClick={() => router.push(`/topics/${enrichment.category!.slug}`)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#1B5E43]/10 text-[#1B5E43] text-xs font-medium hover:bg-[#1B5E43]/20 transition-colors"
                  >
                    <FolderOpen className="w-3 h-3" />
                    {enrichment.category.name_en}
                  </button>
                )}
                {enrichment.tags.map((tag) => (
                  <button
                    key={tag.slug}
                    onClick={() => router.push(`/topics/tag/${tag.slug}`)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#C5A059]/10 text-[#8A6E3A] text-xs font-medium hover:bg-[#C5A059]/20 transition-colors"
                  >
                    <Hash className="w-3 h-3" />
                    {tag.name_en}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Arabic Text */}
          <div className="mb-8" dir="rtl" lang="ar">
            <p
              className="text-2xl sm:text-3xl leading-[2] text-foreground text-right"
              style={{ fontFamily: "Amiri, serif" }}
            >
              {hadith.arabic_text}
            </p>
          </div>

          {/* Divider */}
          <div className="gold-divider mb-8" />

          {/* English Translation */}
          <div className="mb-8" dir="ltr" lang="en">
            <h3 className="text-sm font-semibold text-[#C5A059] mb-3 uppercase tracking-wider">Translation</h3>
            {(() => {
              const { narrator: parsedNarrator, text: parsedText } = parseEnglishTranslation(hadith.english_translation)
              return (
                <>
                  {parsedNarrator && (
                    <p className="text-sm font-medium text-muted-foreground italic mb-2">
                      Narrated by {parsedNarrator}
                    </p>
                  )}
                  <p className="text-lg leading-relaxed text-foreground/80">{parsedText}</p>
                </>
              )
            })()}
          </div>

          {/* Metadata */}
          <div className="bg-muted/50 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Reference</span>
              <span className="text-foreground font-medium">{hadith.reference}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Narrator</span>
              <span className="text-foreground font-medium">
                {hadith.narrator || parseEnglishTranslation(hadith.english_translation).narrator || "Unknown"}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Grade</span>
              <span className="text-foreground font-medium">{gradeLabels[hadith.grade]}</span>
            </div>
          </div>

          {/* Mark as Read Button */}
          <div className="mt-6 pt-6 border-t border-border">
            <button
              onClick={handleMarkRead}
              className={cn(
                "w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all",
                isRead
                  ? "bg-[#1B5E43]/10 border-2 border-[#1B5E43] text-[#1B5E43]"
                  : "emerald-button text-white",
              )}
            >
              <CheckCircle2 className={cn("w-5 h-5", isRead && "fill-[#1B5E43] text-white")} />
              {isRead ? "Marked as Read" : "Mark as Read"}
            </button>
          </div>
        </div>

        {/* Community Discussion */}
        <DiscussionSection hadithId={hadith.id} />
      </main>

      <BottomNavigation />
    </div>
  )
}
