import { notFound, redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { BookReaderShell } from "@/components/collections/book-reader-shell"
import { EmptyState } from "@/components/collections/empty-state"

interface Props {
  params: Promise<{ slug: string; bookId: string }>
  searchParams: Promise<{ chapter?: string }>
}

async function getBookReaderData(slug: string, bookNumber: string) {
  const supabase = await getSupabaseServerClient()

  // Get collection
  const { data: collection } = await supabase
    .from("collections")
    .select("id, name_en, name_ar, slug")
    .eq("slug", slug)
    .single()

  if (!collection) return null

  // Get book by number within this collection
  const { data: book } = await supabase
    .from("books")
    .select("*")
    .eq("collection_id", collection.id)
    .eq("number", parseInt(bookNumber, 10))
    .single()

  if (!book) return null

  // Get all chapters for this book
  const { data: chapters } = await supabase
    .from("chapters")
    .select("*")
    .eq("book_id", book.id)
    .order("number", { ascending: true })

  return {
    collection,
    book,
    chapters: chapters ?? [],
  }
}

async function getChapterHadiths(chapterId: string) {
  const supabase = await getSupabaseServerClient()

  // Get hadith IDs linked to this chapter
  const { data: links } = await supabase
    .from("collection_hadiths")
    .select("hadith_id, hadith_number")
    .eq("chapter_id", chapterId)
    .order("hadith_number", { ascending: true })

  if (!links || links.length === 0) return []

  const hadithIds = links.map((l) => l.hadith_id)
  const { data: hadiths } = await supabase
    .from("hadiths")
    .select("*")
    .in("id", hadithIds)

  if (!hadiths) return []

  // Merge hadith_number from collection_hadiths
  return links
    .map((link) => {
      const hadith = hadiths.find((h) => h.id === link.hadith_id)
      if (!hadith) return null
      return { ...hadith, hadith_number: link.hadith_number }
    })
    .filter(Boolean)
}

export default async function BookReaderPage({ params, searchParams }: Props) {
  const { slug, bookId: bookNumber } = await params
  const { chapter: chapterParam } = await searchParams

  const data = await getBookReaderData(slug, bookNumber)

  if (!data) {
    notFound()
  }

  const { collection, book, chapters } = data

  if (chapters.length === 0) {
    return (
      <div className="min-h-screen marble-bg flex items-center justify-center">
        <EmptyState
          title="No Chapters Available"
          description={`"${book.name_en}" does not have any chapters yet.`}
          actionLabel="Back to Collection"
          actionHref={`/collections/${slug}`}
        />
      </div>
    )
  }

  // Default to first chapter if none selected
  const selectedChapterNumber = chapterParam
    ? parseInt(chapterParam, 10)
    : chapters[0].number

  const selectedChapter = chapters.find((c) => c.number === selectedChapterNumber) ?? chapters[0]

  // Fetch hadiths for the selected chapter
  const hadiths = await getChapterHadiths(selectedChapter.id)

  return (
    <BookReaderShell
      collection={collection}
      book={book}
      chapters={chapters}
      selectedChapter={selectedChapter}
      hadiths={hadiths}
      slug={slug}
      bookNumber={parseInt(bookNumber, 10)}
    />
  )
}
