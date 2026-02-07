import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabase/config"

function getAdminClient() {
  return createClient(
    SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY,
  )
}

// Maps our DB slug to the fawazahmed0 hadith-api edition names
const EDITION_MAP: Record<string, { eng: string; ara: string; apiSlug: string }> = {
  "sahih-bukhari": { eng: "eng-bukhari", ara: "ara-bukhari", apiSlug: "bukhari" },
  "sahih-muslim": { eng: "eng-muslim", ara: "ara-muslim", apiSlug: "muslim" },
  "sunan-abu-dawud": { eng: "eng-abudawud", ara: "ara-abudawud", apiSlug: "abudawud" },
  "jami-tirmidhi": { eng: "eng-tirmidhi", ara: "ara-tirmidhi", apiSlug: "tirmidhi" },
  "sunan-nasai": { eng: "eng-nasai", ara: "ara-nasai", apiSlug: "nasai" },
  "sunan-ibn-majah": { eng: "eng-ibnmajah", ara: "ara-ibnmajah", apiSlug: "ibnmajah" },
  "muwatta-malik": { eng: "eng-malik", ara: "ara-malik", apiSlug: "malik" },
  "musnad-ahmad": { eng: "eng-ahmad", ara: "ara-ahmad", apiSlug: "ahmad" },
}

const COLLECTION_DISPLAY: Record<string, string> = {
  "sahih-bukhari": "Sahih al-Bukhari",
  "sahih-muslim": "Sahih Muslim",
  "sunan-abu-dawud": "Sunan Abu Dawud",
  "jami-tirmidhi": "Jami at-Tirmidhi",
  "sunan-nasai": "Sunan an-Nasai",
  "sunan-ibn-majah": "Sunan Ibn Majah",
  "muwatta-malik": "Muwatta Malik",
  "musnad-ahmad": "Musnad Ahmad",
}

const CDN_BASE = "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions"

interface ApiHadith {
  hadithnumber: number
  arabicnumber?: number
  text: string
  grades: Array<{ name: string; grade: string }>
  reference: { book: number; hadith: number }
}

interface ApiSection {
  metadata: {
    name: string
    section: Record<string, string>
    section_detail: Record<string, {
      hadithnumber_first: number
      hadithnumber_last: number
    }>
  }
  hadiths: ApiHadith[]
}

function determineGrade(grades: Array<{ name: string; grade: string }>, collectionSlug: string): string {
  if (collectionSlug === "sahih-bukhari" || collectionSlug === "sahih-muslim") return "sahih"
  if (grades.length === 0) return "hasan"
  
  // Check for known graders
  for (const g of grades) {
    const grade = g.grade.toLowerCase()
    if (grade.includes("sahih")) return "sahih"
    if (grade.includes("hasan")) return "hasan"
    if (grade.includes("daif") || grade.includes("da'if") || grade.includes("weak") || grade.includes("maudu")) return "daif"
  }
  return "hasan"
}

function extractNarrator(text: string): string {
  const patterns = [
    /^(?:Narrated|It was narrated from|It was narrated that|It is narrated on the authority of|It is reported on the authority of)\s+([^:]+?)(?:\s*:)/i,
    /^(?:['"]?)([A-Z][a-z]+(?: (?:bin|ibn|al-|b\.|Abu|Umm|Abd)[A-Za-z\s'-]*)*)\s+(?:reported|said|narrated)/i,
  ]
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      let narrator = match[1].replace(/\(.*?\)/g, "").trim()
      if (narrator.length > 80) narrator = narrator.substring(0, 80)
      return narrator
    }
  }
  return ""
}

/**
 * Seed a single collection section (book) from the hadith-api CDN.
 * Fetches English + Arabic, creates missing books/chapters/hadiths, and links them.
 */
async function seedSection(
  supabase: ReturnType<typeof createClient>,
  collectionId: string,
  collectionSlug: string,
  sectionNumber: number,
  edition: { eng: string; ara: string },
): Promise<{ inserted: number; skipped: number; error?: string }> {
  
  // Fetch English edition for this section
  let engData: ApiSection
  try {
    const engResp = await fetch(`${CDN_BASE}/${edition.eng}/${sectionNumber}.min.json`, {
      signal: AbortSignal.timeout(30000),
    })
    if (!engResp.ok) return { inserted: 0, skipped: 0, error: `eng HTTP ${engResp.status}` }
    engData = await engResp.json()
  } catch {
    return { inserted: 0, skipped: 0, error: `eng fetch failed for section ${sectionNumber}` }
  }

  // Fetch Arabic edition for this section
  let araData: ApiSection | null = null
  try {
    const araResp = await fetch(`${CDN_BASE}/${edition.ara}/${sectionNumber}.min.json`, {
      signal: AbortSignal.timeout(30000),
    })
    if (araResp.ok) araData = await araResp.json()
  } catch {
    // Arabic is optional - continue without it
  }

  // Build Arabic text lookup by hadith number
  const arabicMap = new Map<number, string>()
  if (araData?.hadiths) {
    for (const h of araData.hadiths) {
      arabicMap.set(h.hadithnumber, h.text)
    }
  }

  if (!engData.hadiths || engData.hadiths.length === 0) {
    return { inserted: 0, skipped: 0, error: "no hadiths in section" }
  }

  // Ensure the book exists in DB
  const { data: existingBook } = await supabase
    .from("books")
    .select("id")
    .eq("collection_id", collectionId)
    .eq("number", sectionNumber)
    .single()

  let bookId: string
  if (existingBook) {
    bookId = existingBook.id
  } else {
    // Create the book
    const sectionNames = engData.metadata?.section || {}
    const bookName = sectionNames[String(sectionNumber)] || `Book ${sectionNumber}`
    const { data: newBook, error: bookErr } = await supabase
      .from("books")
      .insert({
        collection_id: collectionId,
        name_en: bookName,
        name_ar: "",
        number: sectionNumber,
        description_en: "",
        description_ar: "",
        total_hadiths: engData.hadiths.length,
        total_chapters: Object.keys(engData.metadata?.section_detail || {}).length || 1,
        sort_order: sectionNumber,
      })
      .select("id")
      .single()
    
    if (bookErr || !newBook) return { inserted: 0, skipped: 0, error: `book create failed: ${bookErr?.message}` }
    bookId = newBook.id
  }

  // Update book name if it was a placeholder
  const sectionNames = engData.metadata?.section || {}
  const bookName = sectionNames[String(sectionNumber)]
  if (bookName) {
    await supabase.from("books").update({ 
      name_en: bookName,
      total_hadiths: engData.hadiths.length,
    }).eq("id", bookId)
  }

  // Ensure chapters exist
  const sectionDetail = engData.metadata?.section_detail || {}
  for (const [chNum, chName] of Object.entries(sectionNames)) {
    const chapterNumber = parseInt(chNum)
    if (isNaN(chapterNumber)) continue

    const { data: existingCh } = await supabase
      .from("chapters")
      .select("id")
      .eq("book_id", bookId)
      .eq("number", chapterNumber)
      .single()

    if (!existingCh) {
      const detail = sectionDetail[chNum]
      const totalInChapter = detail 
        ? (detail.hadithnumber_last - detail.hadithnumber_first + 1)
        : 0
      await supabase.from("chapters").insert({
        book_id: bookId,
        name_en: chName || `Chapter ${chapterNumber}`,
        name_ar: "",
        number: chapterNumber,
        total_hadiths: totalInChapter,
        sort_order: chapterNumber,
      })
    } else if (chName) {
      await supabase.from("chapters").update({ name_en: chName }).eq("id", existingCh.id)
    }
  }

  // Get all chapters for this book to map hadiths
  const { data: chapters } = await supabase
    .from("chapters")
    .select("id, number")
    .eq("book_id", bookId)
    .order("number")

  // Get existing hadith numbers for this book to avoid duplicates
  const { data: existingLinks } = await supabase
    .from("collection_hadiths")
    .select("hadith_number")
    .eq("book_id", bookId)

  const existingNumbers = new Set((existingLinks || []).map(l => l.hadith_number))

  let inserted = 0
  let skipped = 0

  // Process hadiths in batches
  const BATCH_SIZE = 50
  const newHadiths = engData.hadiths.filter(h => !existingNumbers.has(h.hadithnumber))

  for (let i = 0; i < newHadiths.length; i += BATCH_SIZE) {
    const batch = newHadiths.slice(i, i + BATCH_SIZE)
    
    // Insert hadiths
    const hadithInserts = batch.map(h => ({
      hadith_number: h.hadithnumber,
      book_number: sectionNumber,
      arabic_text: arabicMap.get(h.hadithnumber) || "",
      english_translation: h.text,
      narrator: extractNarrator(h.text),
      grade: determineGrade(h.grades, collectionSlug),
      reference: `${COLLECTION_DISPLAY[collectionSlug] || collectionSlug} ${h.hadithnumber}`,
      collection: collectionSlug,
      is_featured: false,
    }))

    const { data: insertedHadiths, error: insertErr } = await supabase
      .from("hadiths")
      .insert(hadithInserts)
      .select("id, hadith_number")

    if (insertErr) {
      console.error(`[seed-full] Batch insert error for ${collectionSlug} section ${sectionNumber}:`, insertErr.message)
      // Try one by one for failed batch
      for (const single of hadithInserts) {
        const { data: singleResult, error: singleErr } = await supabase
          .from("hadiths")
          .insert(single)
          .select("id, hadith_number")
          .single()
        
        if (!singleErr && singleResult) {
          // Find chapter
          let chapterId: string | null = null
          if (chapters && chapters.length > 0) {
            // Find which chapter this hadith belongs to based on section_detail ranges
            for (const [chNum, detail] of Object.entries(sectionDetail)) {
              const d = detail as { hadithnumber_first: number; hadithnumber_last: number }
              if (singleResult.hadith_number >= d.hadithnumber_first && singleResult.hadith_number <= d.hadithnumber_last) {
                const ch = chapters.find(c => c.number === parseInt(chNum))
                if (ch) chapterId = ch.id
                break
              }
            }
            if (!chapterId && chapters.length > 0) chapterId = chapters[0].id
          }

          await supabase.from("collection_hadiths").insert({
            collection_id: collectionId,
            book_id: bookId,
            chapter_id: chapterId,
            hadith_id: singleResult.id,
            hadith_number: singleResult.hadith_number,
          })
          inserted++
        }
      }
      continue
    }

    if (insertedHadiths && insertedHadiths.length > 0) {
      // Create collection_hadiths links
      const links = insertedHadiths.map(h => {
        let chapterId: string | null = null
        if (chapters && chapters.length > 0) {
          for (const [chNum, detail] of Object.entries(sectionDetail)) {
            const d = detail as { hadithnumber_first: number; hadithnumber_last: number }
            if (h.hadith_number >= d.hadithnumber_first && h.hadith_number <= d.hadithnumber_last) {
              const ch = chapters.find(c => c.number === parseInt(chNum))
              if (ch) chapterId = ch.id
              break
            }
          }
          if (!chapterId && chapters.length > 0) chapterId = chapters[0].id
        }

        return {
          collection_id: collectionId,
          book_id: bookId,
          chapter_id: chapterId,
          hadith_id: h.id,
          hadith_number: h.hadith_number,
        }
      })

      const { error: linkErr } = await supabase.from("collection_hadiths").insert(links)
      if (linkErr) {
        console.error(`[seed-full] Link insert error:`, linkErr.message)
      }
      inserted += insertedHadiths.length
    }
  }

  skipped = existingNumbers.size

  return { inserted, skipped }
}

/**
 * POST /api/seed-full
 * Body: { collection: "sahih-bukhari" } or { collection: "all" }
 * Seeds all missing hadiths for the given collection(s) from the hadith-api CDN.
 */
export async function POST(request: Request) {
  try {
    const { collection } = await request.json()
    if (!collection) {
      return NextResponse.json({ error: "collection required (slug or 'all')" }, { status: 400 })
    }

    const supabase = getAdminClient()
    const slugs = collection === "all" ? Object.keys(EDITION_MAP) : [collection]
    const results: Record<string, { total_inserted: number; total_skipped: number; sections: number; errors: string[] }> = {}

    for (const slug of slugs) {
      const edition = EDITION_MAP[slug]
      if (!edition) {
        results[slug] = { total_inserted: 0, total_skipped: 0, sections: 0, errors: [`Unknown collection: ${slug}`] }
        continue
      }

      // Get collection from DB
      const { data: coll } = await supabase
        .from("collections")
        .select("id, name_en, total_hadiths")
        .eq("slug", slug)
        .single()

      if (!coll) {
        results[slug] = { total_inserted: 0, total_skipped: 0, sections: 0, errors: [`Collection not found in DB: ${slug}`] }
        continue
      }

      // Discover how many sections exist by fetching the full edition info
      let maxSection = 150 // Upper bound, we'll stop when we get 404s
      let totalInserted = 0
      let totalSkipped = 0
      let sectionCount = 0
      const errors: string[] = []

      // Fetch sections sequentially (1, 2, 3, ...) until we get a 404
      for (let sectionNum = 1; sectionNum <= maxSection; sectionNum++) {
        const result = await seedSection(supabase, coll.id, slug, sectionNum, edition)
        
        if (result.error?.includes("HTTP 404") || result.error?.includes("eng HTTP 4")) {
          // No more sections
          break
        }

        sectionCount++
        totalInserted += result.inserted
        totalSkipped += result.skipped

        if (result.error) {
          errors.push(`Section ${sectionNum}: ${result.error}`)
        }
      }

      // Update collection total_hadiths count
      const { count } = await supabase
        .from("collection_hadiths")
        .select("id", { count: "exact", head: true })
        .eq("collection_id", coll.id)

      if (count) {
        await supabase.from("collections").update({ total_hadiths: count }).eq("id", coll.id)
      }

      results[slug] = {
        total_inserted: totalInserted,
        total_skipped: totalSkipped,
        sections: sectionCount,
        errors,
      }
    }

    return NextResponse.json({ results })
  } catch (error) {
    console.error("[seed-full] Error:", error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export const maxDuration = 300
