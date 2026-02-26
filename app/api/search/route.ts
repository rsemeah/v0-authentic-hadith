import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getSearchTerms } from "@/lib/search/topics"

// Supported query params:
//   ?q=<text>           full-text search with synonym expansion.
//                       Also parses natural language like "Bukhari 329" or
//                       "Sahih al-Bukhari 1" to extract collection + number.
//   ?collection=<slug>  filter by collection (e.g. sahih-bukhari)
//   ?narrator=<text>    filter by narrator (partial match)
//   ?number=<int>       filter by hadith number (exact)
//   ?grade=<sahih|hasan|daif>  filter by grade
//   ?tag=<slug>         filter by tag slug
//   ?category=<slug>    filter by category slug
//
// All filters are combined with AND logic.
// Explicit params always override values inferred from ?q.

// Maps common collection name variants to their slugs
const COLLECTION_ALIASES: Array<{ patterns: string[]; slug: string }> = [
  {
    patterns: ["bukhari", "al-bukhari", "sahih bukhari", "sahih al-bukhari", "sahih al bukhari"],
    slug: "sahih-bukhari",
  },
  { patterns: ["muslim", "sahih muslim"], slug: "sahih-muslim" },
  {
    patterns: ["abu dawud", "abu dawood", "sunan abu dawud", "sunan abu dawood"],
    slug: "sunan-abu-dawud",
  },
  { patterns: ["tirmidhi", "tirmizi", "jami tirmidhi", "jami at-tirmidhi"], slug: "jami-tirmidhi" },
  { patterns: ["nasai", "nasaai", "nasa'i", "sunan nasai", "sunan an-nasai"], slug: "sunan-nasai" },
  { patterns: ["ibn majah", "ibn maja", "sunan ibn majah"], slug: "sunan-ibn-majah" },
  { patterns: ["malik", "muwatta", "muwatta malik"], slug: "muwatta-malik" },
  { patterns: ["ahmad", "musnad ahmad"], slug: "musnad-ahmad" },
]

/**
 * Parses a free-text query for embedded collection names and hadith numbers.
 *
 * Examples:
 *   "Sahih al-Bukhari 329"  → { collection: "sahih-bukhari", number: "329", text: "" }
 *   "Bukhari 1"             → { collection: "sahih-bukhari", number: "1",   text: "" }
 *   "329"                   → { collection: "",               number: "329", text: "" }
 *   "prayer in Bukhari"     → { collection: "sahih-bukhari", number: "",    text: "prayer" }
 *   "patience"              → { collection: "",               number: "",    text: "patience" }
 */
function parseNaturalQuery(raw: string): { text: string; collection: string; number: string } {
  const trimmed = raw.trim()

  // Pure number: treat as hadith number lookup
  if (/^\d+$/.test(trimmed)) {
    return { text: "", collection: "", number: trimmed }
  }

  let text = trimmed
  let collection = ""
  let number = ""

  // Extract trailing number (e.g. "Bukhari 329" → number "329")
  const trailingNum = text.match(/\s+(\d+)$/)
  if (trailingNum) {
    number = trailingNum[1]
    text = text.slice(0, -trailingNum[0].length).trim()
  }

  // Match collection name in remaining text (case-insensitive)
  const lower = text.toLowerCase()
  outer: for (const { patterns, slug } of COLLECTION_ALIASES) {
    for (const pattern of patterns) {
      if (lower === pattern) {
        collection = slug
        text = ""
        break outer
      }
      if (lower.startsWith(pattern + " ")) {
        collection = slug
        text = text.slice(pattern.length).trim()
        break outer
      }
      if (lower.endsWith(" " + pattern)) {
        collection = slug
        text = text.slice(0, -(pattern.length + 1)).trim()
        break outer
      }
    }
  }

  // If collection + number fully account for the query, clear remaining text
  if (collection && number && text.length < 3) text = ""

  return { text, collection, number }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const rawQuery = searchParams.get("q") || ""

  // Parse natural language out of the text query
  const { text: parsedText, collection: parsedCollection, number: parsedNumber } = parseNaturalQuery(rawQuery)

  // Explicit params win over anything inferred from the text
  const query = parsedText
  const collection = searchParams.get("collection") || parsedCollection
  const narrator = searchParams.get("narrator") || ""
  const number = searchParams.get("number") || parsedNumber
  const grade = searchParams.get("grade") || ""
  const tag = searchParams.get("tag") || ""
  const category = searchParams.get("category") || ""

  const hasAnyFilter =
    query.length >= 2 || collection || narrator || number || grade || tag || category

  if (!hasAnyFilter) {
    return Response.json({ results: [] })
  }

  const supabase = await getSupabaseServerClient()

  // --- Step 1: Resolve tag/category filters to hadith ID sets ---
  let tagIds: string[] | null = null
  let categoryIds: string[] | null = null

  if (tag) {
    const { data: tagRow } = await supabase
      .from("tags")
      .select("id")
      .eq("slug", tag)
      .single()

    if (!tagRow) return Response.json({ results: [] })

    // Prefer weighted results (ordered by relevance score)
    const { data: weightedIds } = await supabase
      .from("hadith_tag_weights")
      .select("hadith_id")
      .eq("tag_id", tagRow.id)
      .order("weight", { ascending: false })
      .limit(50)

    let ids = (weightedIds || []).map((t: { hadith_id: string }) => t.hadith_id)

    if (ids.length === 0) {
      const { data: taggedIds } = await supabase
        .from("hadith_tags")
        .select("hadith_id")
        .eq("tag_id", tagRow.id)
        .eq("status", "published")
        .limit(50)
      ids = (taggedIds || []).map((t: { hadith_id: string }) => t.hadith_id)
    }

    if (ids.length === 0) return Response.json({ results: [] })
    tagIds = ids
  }

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
      .limit(50)

    if (!enrichments || enrichments.length === 0) return Response.json({ results: [] })
    categoryIds = enrichments.map((e: { hadith_id: string }) => e.hadith_id)
  }

  // Intersect tag and category ID sets if both are present
  let candidateIds: string[] | null = null
  if (tagIds && categoryIds) {
    const catSet = new Set(categoryIds)
    candidateIds = tagIds.filter((id) => catSet.has(id))
    if (candidateIds.length === 0) return Response.json({ results: [] })
  } else if (tagIds) {
    candidateIds = tagIds
  } else if (categoryIds) {
    candidateIds = categoryIds
  }

  // --- Step 2: Build main hadiths query with all direct filters ---
  let hadithQuery = supabase
    .from("hadiths")
    .select("id, hadith_number, collection, book_number, arabic_text, english_translation, narrator, grade")

  if (candidateIds) {
    hadithQuery = hadithQuery.in("id", candidateIds)
  }

  if (collection) {
    hadithQuery = hadithQuery.eq("collection", collection)
  }

  if (grade && ["sahih", "hasan", "daif"].includes(grade)) {
    hadithQuery = hadithQuery.eq("grade", grade)
  }

  if (narrator) {
    hadithQuery = hadithQuery.ilike("narrator", `%${narrator}%`)
  }

  if (number) {
    const num = parseInt(number, 10)
    if (!isNaN(num)) {
      hadithQuery = hadithQuery.eq("hadith_number", num)
    }
  }

  // Text search with synonym expansion — limited to 4 terms to keep SQL lean
  if (query.length >= 2) {
    const terms = getSearchTerms(query)
    const orConditions = terms
      .flatMap((term) => [
        `english_translation.ilike.%${term}%`,
        `narrator.ilike.%${term}%`,
        `arabic_text.ilike.%${term}%`,
      ])
      .join(",")
    hadithQuery = hadithQuery.or(orConditions)
  }

  hadithQuery = hadithQuery.limit(30)

  const { data: hadiths, error } = await hadithQuery

  if (error) {
    return Response.json({ results: [], error: error.message }, { status: 500 })
  }

  let allResults = hadiths || []

  // For text-only searches (no tag/category), also search enrichment summary lines
  if (query.length >= 2 && !candidateIds) {
    const { data: summaryMatches } = await supabase
      .from("hadith_enrichment")
      .select("hadith_id")
      .eq("status", "published")
      .ilike("summary_line", `%${query}%`)
      .limit(10)

    const directIds = new Set(allResults.map((h: { id: string }) => h.id))
    const extraIds = (summaryMatches || [])
      .map((e: { hadith_id: string }) => e.hadith_id)
      .filter((id: string) => !directIds.has(id))

    if (extraIds.length > 0) {
      let extrasQuery = supabase
        .from("hadiths")
        .select("id, hadith_number, collection, book_number, arabic_text, english_translation, narrator, grade")
        .in("id", extraIds)

      if (collection) extrasQuery = extrasQuery.eq("collection", collection)
      if (grade && ["sahih", "hasan", "daif"].includes(grade)) extrasQuery = extrasQuery.eq("grade", grade)

      const { data: extras } = await extrasQuery
      if (extras) allResults = [...allResults, ...extras]
    }
  }

  const enriched = await attachEnrichments(supabase, allResults)

  // Build tag facets from result set
  const facetMap = new Map<string, { slug: string; name_en: string; count: number }>()
  for (const h of enriched) {
    const tags = (h as Record<string, unknown>).tags as Array<{ slug: string; name_en: string }> | undefined
    if (tags) {
      for (const t of tags) {
        const existing = facetMap.get(t.slug)
        if (existing) {
          existing.count++
        } else {
          facetMap.set(t.slug, { slug: t.slug, name_en: t.name_en, count: 1 })
        }
      }
    }
  }
  const facets = [...facetMap.values()].sort((a, b) => b.count - a.count).slice(0, 10)

  return Response.json({ results: enriched, facets })
}

// Attaches enrichment data (summary, category, tags) to each hadith
async function attachEnrichments(
  supabase: Awaited<ReturnType<typeof getSupabaseServerClient>>,
  hadiths: Array<Record<string, unknown>>,
) {
  if (hadiths.length === 0) return hadiths

  const ids = hadiths.map((h) => h.id as string)

  const { data: enrichments } = await supabase
    .from("hadith_enrichment")
    .select("hadith_id, summary_line, category:categories!category_id(slug, name_en)")
    .eq("status", "published")
    .in("hadith_id", ids)

  // Primary tag source: hadith_tag_weights (scored)
  const { data: weightData } = await supabase
    .from("hadith_tag_weights")
    .select("hadith_id, tag_id, weight")
    .in("hadith_id", ids)
    .order("weight", { ascending: false })

  const uniqueTagIds = [...new Set((weightData || []).map((w: { tag_id: string }) => w.tag_id))]
  const tagLookup = new Map<string, { slug: string; name_en: string }>()
  if (uniqueTagIds.length > 0) {
    const { data: tagDetails } = await supabase
      .from("tags")
      .select("id, slug, name_en")
      .in("id", uniqueTagIds)
    for (const t of tagDetails || []) {
      tagLookup.set(t.id, { slug: t.slug, name_en: t.name_en })
    }
  }

  const enrichmentMap = new Map<string, Record<string, unknown>>()
  for (const e of enrichments || []) {
    enrichmentMap.set(e.hadith_id, e)
  }

  const tagMap = new Map<string, Array<{ slug: string; name_en: string }>>()
  for (const w of weightData || []) {
    const tag = tagLookup.get(w.tag_id)
    if (!tag) continue
    const existing = tagMap.get(w.hadith_id) || []
    if (!existing.some((t) => t.slug === tag.slug)) existing.push(tag)
    tagMap.set(w.hadith_id, existing)
  }

  // Fallback: hadith_tags for any extras not in weights
  const { data: tagData } = await supabase
    .from("hadith_tags")
    .select("hadith_id, tag:tags!tag_id(slug, name_en)")
    .eq("status", "published")
    .in("hadith_id", ids)

  for (const t of tagData || []) {
    if (!t.tag) continue
    const tag = t.tag as { slug: string; name_en: string }
    const existing = tagMap.get(t.hadith_id) || []
    if (!existing.some((et) => et.slug === tag.slug)) existing.push(tag)
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
