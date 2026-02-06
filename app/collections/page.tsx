import { Suspense } from "react"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { CollectionsClientContent } from "@/components/collections/collections-client-content"

export interface Collection {
  id: string
  name_en: string
  name_ar: string
  slug: string
  description_en: string | null
  total_hadiths: number
  scholar: string
  is_featured: boolean
  grade_distribution: {
    sahih: number
    hasan: number
    daif: number
  }
}

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

  return (
    <Suspense
      fallback={
        <div className="min-h-screen marble-bg flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CollectionsClientContent
        initialFeatured={featured}
        initialAll={all}
        initialScholars={scholars}
      />
    </Suspense>
  )
}
