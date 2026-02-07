import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabase/config"

function getAdminClient() {
  return createClient(
    SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY,
  )
}

export async function GET() {
  try {
    const supabase = getAdminClient()

    // Get all collections with books
    const { data: collections } = await supabase
      .from("collections")
      .select("id, name_en, slug, total_books, total_hadiths")
      .order("slug")

    if (!collections) return NextResponse.json({ error: "No collections" }, { status: 404 })

    const result = []

    for (const coll of collections) {
      const { data: books } = await supabase
        .from("books")
        .select("id, number, name_en, total_hadiths")
        .eq("collection_id", coll.id)
        .order("number")

      if (!books) continue

      const bookStatuses = []
      for (const book of books) {
        // Get first hadith to check if it has real content
        const { data: links } = await supabase
          .from("collection_hadiths")
          .select("hadith_id")
          .eq("book_id", book.id)
          .limit(1)

        let seeded = false
        if (links && links.length > 0) {
          const { data: sample } = await supabase
            .from("hadiths")
            .select("english_translation")
            .eq("id", links[0].hadith_id)
            .single()

          seeded = !!(
            sample?.english_translation &&
            sample.english_translation.length > 80 &&
            !sample.english_translation.includes("narrated a hadith.") &&
            !sample.english_translation.includes("[Content pending") &&
            !sample.english_translation.includes("This is hadith number")
          )
        }

        bookStatuses.push({
          number: book.number,
          name: book.name_en,
          total_hadiths: book.total_hadiths,
          seeded,
        })
      }

      result.push({
        slug: coll.slug,
        name: coll.name_en,
        total_books: coll.total_books,
        total_hadiths: coll.total_hadiths,
        books: bookStatuses,
        seeded_books: bookStatuses.filter(b => b.seeded).length,
        unseeded_books: bookStatuses.filter(b => !b.seeded).length,
      })
    }

    return NextResponse.json({
      collections: result,
      total_seeded: result.reduce((sum, c) => sum + c.seeded_books, 0),
      total_unseeded: result.reduce((sum, c) => sum + c.unseeded_books, 0),
    })
  } catch (error) {
    console.error("[seed-status] Error:", error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
