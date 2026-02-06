import { BookCardSkeleton } from "@/components/collections/loading-skeletons"

export default function CollectionDetailLoading() {
  return (
    <div className="min-h-screen marble-bg">
      {/* Header skeleton */}
      <div className="border-b border-[#e5e7eb] bg-[#F8F6F2]/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="h-10 bg-[#e5e7eb] rounded w-32 animate-pulse" />
        </div>
      </div>
      {/* Collection header skeleton */}
      <div className="border-b border-[#e5e7eb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8">
          <div className="flex gap-6">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-[#e5e7eb] animate-pulse" />
            <div className="flex-1">
              <div className="h-8 bg-[#e5e7eb] rounded w-72 mb-2 animate-pulse" />
              <div className="h-6 bg-[#e5e7eb] rounded w-48 mb-3 animate-pulse" />
              <div className="h-4 bg-[#e5e7eb] rounded w-56 mb-4 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
      {/* Books grid skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8">
        <div className="h-6 bg-[#e5e7eb] rounded w-24 mb-4 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <BookCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
