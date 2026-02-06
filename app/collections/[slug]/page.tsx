import { notFound } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { CollectionDetailClient } from "@/components/collections/collection-detail-client"
import { EmptyState } from "@/components/collections/empty-state"

interface Props {
  params: Promise<{ slug: string }>
}

async function getCollectionData(slug: string) {
  const supabase = await getSupabaseServerClient()

  const { data: collection } = await supabase
    .from("collections")
    .select("*")
    .eq("slug", slug)
    .single()

  if (!collection) return null

  const { data: books } = await supabase
    .from("books")
    .select("*")
    .eq("collection_id", collection.id)
    .order("number", { ascending: true })

  return { collection, books: books ?? [] }
}

export default async function CollectionDetailPage({ params }: Props) {
  const { slug } = await params
  const data = await getCollectionData(slug)

  if (!data) {
    notFound()
  }

  const { collection, books } = data

  return (
    <CollectionDetailClient
      collection={collection}
      books={books}
      slug={slug}
    />
  )
}
