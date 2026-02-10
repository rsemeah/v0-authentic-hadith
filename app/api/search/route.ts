import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get("q") || ""
  const category = searchParams.get("category") || ""
  const tag = searchParams.get("tag") || ""

  if (query.length < 2 && !category && !tag) {
    return Response.json({ results: [] })
  }

  const supabase = await getSupabaseServerClient()

  // If searching by tag, find hadith IDs tagged with it first
  if (tag) {
    const { data: tagRow } = await supabase
      .from("tags")
      .select("id")
      .eq("slug", tag)
      .single()

    if (!tagRow) return Response.json({ results: [] })

    const { data: taggedIds } = await supabase
      .from("hadith_tags")
      .select("hadith_id")
      .eq("tag_id", tagRow.id)
      .eq("status", "published")
      .limit(30)

    if (!taggedIds || taggedIds.length === 0) return Response.json({ results: [] })

    const ids = taggedIds.map((t: { hadith_id: string }) => t.hadith_id)
    const { data: hadiths } = await supabase
      .from("hadiths")
      .select("id, hadith_number, collection, book_number, arabic_text, english_translation, narrator, grade")
      .in("id", ids)

    const enriched = await attachEnrichments(supabase, hadiths || [])
    return Response.json({ results: enriched })
  }

  // If searching by category, find hadith IDs in that category
  if (category) {
    const { data: catRow } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", category)
      .single()

    if (!catRow) return Response.json({ results: [] })

    const { data: enrichments } = await supabase
      .from("hadith_enrichment")
      .select("hadith_id")
      .eq("category_id", catRow.id)
      .eq("status", "published")
      .limit(30)

    if (!enrichments || enrichments.length === 0) return Response.json({ results: [] })

    const ids = enrichments.map((e: { hadith_id: string }) => e.hadith_id)
    let hadithQuery = supabase
      .from("hadiths")
      .select("id, hadith_number, collection, book_number, arabic_text, english_translation, narrator, grade")
      .in("id", ids)

    // Further filter by text query if provided
    if (query.length >= 2) {
      hadithQuery = hadithQuery.or(
        `english_translation.ilike.%${query}%,narrator.ilike.%${query}%`,
      )
    }

    const { data: hadiths } = await hadithQuery
    const enriched = await attachEnrichments(supabase, hadiths || [])
    return Response.json({ results: enriched })
  }

  // Standard text search: search hadiths + summary_lines
  const { data: directResults, error } = await supabase
    .from("hadiths")
    .select("id, hadith_number, collection, book_number, arabic_text, english_translation, narrator, grade")
    .or(`english_translation.ilike.%${query}%,narrator.ilike.%${query}%,arabic_text.ilike.%${query}%`)
    .limit(20)

  if (error) {
    return Response.json({ results: [], error: error.message }, { status: 500 })
  }

  // Also search by summary_line in enrichments
  const { data: summaryMatches } = await supabase
    .from("hadith_enrichment")
    .select("hadith_id")
    .eq("status", "published")
    .ilike("summary_line", `%${query}%`)
    .limit(10)

  const directIds = new Set((directResults || []).map((h: { id: string }) => h.id))
  const extraIds = (summaryMatches || [])
    .map((e: { hadith_id: string }) => e.hadith_id)
    .filter((id: string) => !directIds.has(id))

  let allResults = directResults || []

  // Fetch additional hadiths found via summary search
  if (extraIds.length > 0) {
    const { data: extras } = await supabase
      .from("hadiths")
      .select("id, hadith_number, collection, book_number, arabic_text, english_translation, narrator, grade")
      .in("id", extraIds)

    if (extras) {
      allResults = [...allResults, ...extras]
    }
  }

  const enriched = await attachEnrichments(supabase, allResults)
  return Response.json({ results: enriched })
}

// Helper: attach enrichment data to hadith results
async function attachEnrichments(
  supabase: Awaited<ReturnType<typeof getSupabaseServerClient>>,
  hadiths: Array<Record<string, unknown>>,
) {
  if (hadiths.length === 0) return hadiths

  const ids = hadiths.map((h) => h.id as string)

  // Get enrichments
  const { data: enrichments } = await supabase
    .from("hadith_enrichment")
    .select("hadith_id, summary_line, category:categories!category_id(slug, name_en)")
    .eq("status", "published")
    .in("hadith_id", ids)

  // Get tags
  const { data: tagData } = await supabase
    .from("hadith_tags")
    .select("hadith_id, tag:tags!tag_id(slug, name_en)")
    .eq("status", "published")
    .in("hadith_id", ids)

  const enrichmentMap = new Map<string, Record<string, unknown>>()
  for (const e of enrichments || []) {
    enrichmentMap.set(e.hadith_id, e)
  }

  const tagMap = new Map<string, Array<{ slug: string; name_en: string }>>()
  for (const t of tagData || []) {
    const existing = tagMap.get(t.hadith_id) || []
    if (t.tag) existing.push(t.tag as { slug: string; name_en: string })
    tagMap.set(t.hadith_id, existing)
  }

  return hadiths.map((h) => {
    const enrichment = enrichmentMap.get(h.id as string)
    return {
      ...h,
      summary_line: enrichment?.summary_line || null,
      category: enrichment?.category || null,
      tags: tagMap.get(h.id as string) || [],
    }
  })
}
