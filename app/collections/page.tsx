import { getSupabaseServerClient } from "@/lib/supabase/server"
import { CollectionsClientContent } from "@/components/collections/collections-client-content"
import { EmptyState } from "@/components/collections/empty-state"
import type { Collection } from "@/lib/types/collections"

async function getCollectionsData() {
  const supabase = await getSupabaseServerClient()

  const [featuredResult, allResult] = await Promise.all([
    supabase
      .from("collections")
      .select("*")
      .eq("is_featured", true)
      .order("total_hadiths", { ascending: false })
      .limit(3),
    supabase
      .from("collections")
      .select("*")
      .order("name_en", { ascending: true }),
  ])

  const featured = featuredResult.data ?? []
  const all = allResult.data ?? []
  const scholars = [...new Set(all.map((c: Collection) => c.scholar))]

  return { featured, all, scholars }
}

export default async function CollectionsIndexPage() {
  const { featured, all, scholars } = await getCollectionsData()

  if (all.length === 0) {
    return (
      <div className="min-h-screen marble-bg flex items-center justify-center">
        <EmptyState
          title="No Collections Available"
          description="Hadith collections have not been loaded yet. Please check back later."
          actionLabel="Go Home"
          actionHref="/home"
        />
      </div>
    )
  }

  return (
    <CollectionsClientContent
      initialFeatured={featured}
      initialAll={all}
      initialScholars={scholars}
    />
  )
}
