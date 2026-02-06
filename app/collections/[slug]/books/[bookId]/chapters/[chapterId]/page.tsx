import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"

interface Props {
  params: Promise<{ slug: string; bookId: string; chapterId: string }>
}

/**
 * This page redirects to the book reader with the chapter query param.
 * The book reader at /collections/[slug]/books/[bookNumber]?chapter=X handles all chapter display.
 */
export default async function ChapterRedirectPage({ params }: Props) {
  const { slug, bookId: bookNumber, chapterId } = await params

  // chapterId could be a UUID or a chapter number. Try to resolve it.
  const supabase = await getSupabaseServerClient()

  // Try to find the chapter to get its number
  const { data: chapter } = await supabase
    .from("chapters")
    .select("number")
    .eq("id", chapterId)
    .single()

  const chapterNumber = chapter?.number ?? chapterId

  redirect(`/collections/${slug}/books/${bookNumber}?chapter=${chapterNumber}`)
}
