import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get("q") || ""

  if (query.length < 2) {
    return Response.json({ results: [] })
  }

  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase
    .from("hadiths")
    .select("id, hadith_number, collection, book_number, arabic_text, english_translation, narrator, grade")
    .or(`english_translation.ilike.%${query}%,narrator.ilike.%${query}%,arabic_text.ilike.%${query}%`)
    .limit(20)

  if (error) {
    return Response.json({ results: [], error: error.message }, { status: 500 })
  }

  return Response.json({ results: data || [] })
}
