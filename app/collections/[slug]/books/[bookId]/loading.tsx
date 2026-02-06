import { BookReaderSkeleton } from "@/components/collections/loading-skeletons"

export default function BookReaderLoading() {
  return (
    <div className="min-h-screen marble-bg">
      {/* Header skeleton */}
      <div className="border-b border-[#e5e7eb] bg-[#F8F6F2]/95">
        <div className="max-w-full mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-full bg-[#e5e7eb] animate-pulse" />
            <div className="flex-1">
              <div className="h-4 bg-[#e5e7eb] rounded w-48 mb-1 animate-pulse" />
              <div className="h-3 bg-[#e5e7eb] rounded w-32 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
      <BookReaderSkeleton />
    </div>
  )
}
