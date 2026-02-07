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

    // Get all collections with their actual hadith counts via collection_hadiths
    const { data: collections } = await supabase
      .from("collections")
      .select("id, name_en, slug, total_books, total_hadiths")
      .order("slug")

    if (!collections) return NextResponse.json({ error: "No collections" }, { status: 404 })

    const result = []

    for (const coll of collections) {
      // Count actual linked hadiths
      const { count: hadithCount } = await supabase
        .from("collection_hadiths")
        .select("id", { count: "exact", head: true })
        .eq("collection_id", coll.id)

      // Count books
      const { count: bookCount } = await supabase
        .from("books")
        .select("id", { count: "exact", head: true })
        .eq("collection_id", coll.id)

      result.push({
        slug: coll.slug,
        name: coll.name_en,
        expected_hadiths: coll.total_hadiths,
        hadith_count: hadithCount || 0,
        missing: Math.max(0, coll.total_hadiths - (hadithCount || 0)),
        book_count: bookCount || 0,
        expected_books: coll.total_books,
      })
    }

    const totalActual = result.reduce((sum, c) => sum + c.hadith_count, 0)
    const totalExpected = result.reduce((sum, c) => sum + c.expected_hadiths, 0)

    return NextResponse.json({
      collections: result,
      total_hadiths: totalActual,
      total_expected: totalExpected,
      total_missing: totalExpected - totalActual,
    })
  } catch (error) {
    console.error("[seed-status] Error:", error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
