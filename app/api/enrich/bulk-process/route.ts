import { generateText, Output } from "ai"
import { z } from "zod"
import { createClient } from "@supabase/supabase-js"

export const maxDuration = 300

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://nqklipakrfuwebkdnhwg.supabase.co"

const enrichmentSchema = z.object({
  summary_line: z.string().min(5).max(80),
  category_slug: z.enum(["worship", "character", "family", "daily-life", "knowledge", "community", "afterlife"]),
  tag_slugs: z.array(z.string()).min(1).max(4),
  key_teaching_en: z.string().min(20).max(600),
  key_teaching_ar: z.string().min(10).max(800),
  summary_ar: z.string().min(3).max(120),
  confidence: z.number().min(0).max(1),
  rationale: z.string().max(200),
})

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!serviceKey || !anonKey) {
    return Response.json({ error: "Server config missing" }, { status: 500 })
  }

  // Verify admin role via user token
  const userClient = createClient(SUPABASE_URL, anonKey, {
    global: { headers: { Authorization: authHeader } },
  })
  const { data: { user } } = await userClient.auth.getUser()
  if (!user) return Response.json({ error: "Not authenticated" }, { status: 401 })

  const supabase = createClient(SUPABASE_URL, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single()
  if (!profile || !["admin", "reviewer"].includes(profile.role)) {
    return Response.json({ error: "Admin access required" }, { status: 403 })
  }

  const body = await req.json()
  const { offset = 0, batch_size = 25 } = body

  // Fetch category and tag lookups
  const { data: categories } = await supabase.from("categories").select("id, slug")
  const { data: tags } = await supabase.from("tags").select("id, slug")
  const categoryMap = new Map((categories || []).map((c: { id: string; slug: string }) => [c.slug, c.id]))
  const tagMap = new Map((tags || []).map((t: { id: string; slug: string }) => [t.slug, t.id]))

  // Get already enriched hadith IDs
  const { data: enrichedIds } = await supabase.from("hadith_enrichment").select("hadith_id")
  const enrichedSet = new Set((enrichedIds || []).map((e: { hadith_id: string }) => e.hadith_id))

  // Fetch candidate hadiths
  const { data: candidates } = await supabase
    .from("hadiths")
    .select("id, english_translation, arabic_text, narrator, grade, collection, reference")
    .not("english_translation", "is", null)
    .order("id", { ascending: true })
    .range(offset, offset + batch_size * 4)

  const hadiths = (candidates || []).filter((h: { id: string }) => !enrichedSet.has(h.id)).slice(0, batch_size)

  if (hadiths.length === 0) {
    return Response.json({
      message: "No more unenriched hadiths found at this offset",
      processed: 0,
      success: 0,
      failed: 0,
      next_offset: null,
    })
  }

  let successCount = 0
  let failCount = 0
  const errors: string[] = []

  for (const hadith of hadiths) {
    try {
      let text = hadith.english_translation || ""
      if (text.startsWith("{") && text.includes('"text"')) {
        try { text = JSON.parse(text).text || text } catch { /* keep raw */ }
      }
      if (text.length < 10) { failCount++; continue }

      const { output: object } = await generateText({
        model: "openai/gpt-4o-mini",
        output: Output.object({ schema: enrichmentSchema }),
        prompt: `You are a hadith scholar with expertise in Islamic jurisprudence and classical hadith commentary. Analyze this hadith and provide enrichment data.

Hadith Text: "${text}"
Narrator: ${hadith.narrator || "Unknown"}
Collection: ${hadith.collection}
Grade: ${hadith.grade}

Rules:
- summary_line: 5-12 words, present-tense, captures the core teaching
- key_teaching_en: 2-4 sentences. FIRST sentence: plain-language explanation anyone can understand. REMAINING: scholarly context referencing classical scholars (Ibn Hajar, Al-Nawawi, Ibn Qayyim, etc.) or related Quran verses when applicable. Do NOT repeat the hadith text.
- key_teaching_ar: Arabic translation of key_teaching_en. Same two-layer structure. Fluent Modern Standard Arabic.
- summary_ar: Arabic translation of summary_line. 3-10 words MSA.
- category_slug: SINGLE best-fit category from: worship, character, family, daily-life, knowledge, community, afterlife
- tag_slugs: 1-4 from: prayer, fasting, charity, pilgrimage, remembrance, patience, truthfulness, kindness, forgiveness, humility, anger, parents, marriage, children, relatives, neighbors, work, food, speech, cleanliness, greetings, seeking-knowledge, intention, faith, quran, justice, leadership, rights, brotherhood, death, judgment, paradise, hellfire
- confidence: 0.9+ clear, 0.6-0.8 ambiguous`,
      })

      if (!object) { failCount++; errors.push(`${hadith.id}: no output`); continue }

      const categoryId = categoryMap.get(object.category_slug)
      if (!categoryId) { failCount++; errors.push(`${hadith.id}: bad category ${object.category_slug}`); continue }

      const { data: enrichment, error: insertErr } = await supabase
        .from("hadith_enrichment")
        .insert({
          hadith_id: hadith.id,
          summary_line: object.summary_line,
          summary_ar: object.summary_ar,
          key_teaching_en: object.key_teaching_en,
          key_teaching_ar: object.key_teaching_ar,
          category_id: categoryId,
          status: "published",
          confidence: object.confidence,
          rationale: object.rationale,
          suggested_by: "openai-gpt-4o-mini",
          methodology_version: "v1.1",
        })
        .select("id")
        .single()

      if (insertErr) { failCount++; errors.push(`${hadith.id}: ${insertErr.message}`); continue }

      // Insert tags
      const validTags = object.tag_slugs.filter((s: string) => tagMap.has(s))
      if (validTags.length > 0 && enrichment) {
        await supabase.from("hadith_tags").insert(
          validTags.map((s: string) => ({
            hadith_id: hadith.id,
            tag_id: tagMap.get(s),
            enrichment_id: enrichment.id,
            status: "published",
          }))
        )
      }

      successCount++
    } catch (err) {
      failCount++
      errors.push(`${hadith.id}: ${err instanceof Error ? err.message : "unknown"}`)
    }
  }

  return Response.json({
    processed: successCount + failCount,
    success: successCount,
    failed: failCount,
    errors: errors.slice(0, 10),
    next_offset: offset + batch_size * 4,
    total_enriched_set_size: enrichedSet.size + successCount,
  })
}
