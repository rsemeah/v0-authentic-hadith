"use client"

import { useEffect } from "react"
import { useRouter, useParams } from "next/navigation"

export default function ChapterRedirectPage() {
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string
  const bookNumber = params.bookId as string
  const chapterId = params.chapterId as string

  useEffect(() => {
    // Redirect to book reader with chapter param
    router.replace(`/collections/${slug}/books/${bookNumber}?chapter=${chapterId}`)
  }, [router, slug, bookNumber, chapterId])

  return (
    <div className="min-h-screen marble-bg flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
