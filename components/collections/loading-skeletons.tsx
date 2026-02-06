export function CollectionCardSkeleton() {
  return (
    <div className="flex flex-col p-5 rounded-xl premium-card animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-lg bg-[#e5e7eb]" />
        <div className="flex-1">
          <div className="h-5 bg-[#e5e7eb] rounded w-3/4 mb-2" />
          <div className="h-4 bg-[#e5e7eb] rounded w-1/2 mb-3" />
          <div className="h-3 bg-[#e5e7eb] rounded w-2/3" />
        </div>
      </div>
      <div className="mt-4 h-2 bg-[#e5e7eb] rounded-full" />
      <div className="mt-4 h-4 bg-[#e5e7eb] rounded w-1/3" />
    </div>
  )
}

export function BookCardSkeleton() {
  return (
    <div className="flex flex-col p-5 rounded-xl premium-card animate-pulse min-h-[160px]">
      <div className="h-3 bg-[#e5e7eb] rounded w-16 mb-3" />
      <div className="h-5 bg-[#e5e7eb] rounded w-3/4 mb-2" />
      <div className="h-4 bg-[#e5e7eb] rounded w-1/2 mb-3" />
      <div className="h-3 bg-[#e5e7eb] rounded w-2/3 mb-3" />
      <div className="mt-auto h-4 bg-[#e5e7eb] rounded w-1/3" />
    </div>
  )
}

export function ChapterSidebarSkeleton() {
  return (
    <div className="flex flex-col gap-2 animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-3 rounded-lg">
          <div className="w-6 h-6 rounded bg-[#e5e7eb]" />
          <div className="flex-1">
            <div className="h-4 bg-[#e5e7eb] rounded w-3/4 mb-1" />
            <div className="h-3 bg-[#e5e7eb] rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function HadithCardSkeleton() {
  return (
    <div className="rounded-xl premium-card overflow-hidden border-l-4 border-l-[#e5e7eb] animate-pulse">
      <div className="p-5 md:p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-4 bg-[#e5e7eb] rounded w-24" />
          <div className="ml-auto h-5 bg-[#e5e7eb] rounded-full w-14" />
        </div>
        <div className="h-3 bg-[#e5e7eb] rounded w-40 mb-4" />
        <div className="space-y-2 mb-4">
          <div className="h-5 bg-[#e5e7eb] rounded w-full" />
          <div className="h-5 bg-[#e5e7eb] rounded w-4/5" />
        </div>
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-[#e5e7eb] rounded w-full" />
          <div className="h-4 bg-[#e5e7eb] rounded w-3/4" />
        </div>
        <div className="flex gap-2 pt-4 border-t border-[#e5e7eb]">
          <div className="h-8 bg-[#e5e7eb] rounded-lg w-16" />
          <div className="h-8 bg-[#e5e7eb] rounded-lg w-16" />
          <div className="ml-auto h-8 bg-[#e5e7eb] rounded-lg w-28" />
        </div>
      </div>
    </div>
  )
}

export function CollectionsPageSkeleton() {
  return (
    <div className="min-h-screen marble-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="h-8 bg-[#e5e7eb] rounded w-64 mb-2 animate-pulse" />
        <div className="h-5 bg-[#e5e7eb] rounded w-96 mb-8 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <CollectionCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}

export function BookReaderSkeleton() {
  return (
    <div className="flex h-[calc(100vh-120px)]">
      <div className="w-72 border-r border-[#e5e7eb] p-4 hidden md:block">
        <div className="h-10 bg-[#e5e7eb] rounded-lg mb-4 animate-pulse" />
        <ChapterSidebarSkeleton />
      </div>
      <div className="flex-1 p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <HadithCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
