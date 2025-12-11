
export default function FilterSkeleton() {
  return (
<aside className="lg:col-span-1 space-y-6 max-h-screen">
  {/* Header Skeleton */}
  <div className="flex justify-between items-center border-b pb-2">
    <div>
      <h1 className="text-3xl font-medium uppercase">FILTERS</h1>
      <p className="mt-1 min-h-6">
        <span className="inline-block w-32 h-5 bg-gray-200 rounded animate-pulse"></span>
      </p>
    </div>
    {/* Clear button placeholder (hidden when loading) */}
    <div className="w-28 h-9 bg-gray-100 rounded animate-pulse opacity-0"></div>
  </div>

  {/* Brands Filter Skeleton */}
  <div className="bg-white">
    <div className="border-b pb-2">
      <h3 className="font-semibold text-lg">Brands</h3>
    </div>

    <div className="mt-4">
      {/* Search Input Skeleton */}
      <div className="relative">
        <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 bg-gray-300 rounded animate-pulse"></div>
        <div className="h-10 bg-gray-100 border-b-2 border-transparent rounded-none animate-pulse"></div>
      </div>

      {/* Brand Items Skeleton */}
      <div className="space-y-3 mt-4 max-h-80 overflow-y-auto">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-gray-300 rounded animate-pulse"></div>
            <div className="flex-1 h-5 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-12 h-6 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        ))}
      </div>

      {/* See all / See less button skeleton */}
      <div className="mt-4">
        <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>
  </div>

  {/* Styles Filter Skeleton */}
  <div className="bg-white border-t pt-6">
    <h3 className="font-semibold text-lg mb-4">Style</h3>

    {/* Search Input Skeleton */}
    <div className="relative mb-4">
      <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 bg-gray-300 rounded animate-pulse"></div>
      <div className="h-10 bg-gray-100 border-b-2 border-transparent rounded-none animate-pulse"></div>
    </div>

    {/* Style Items Skeleton */}
    <div className="space-y-3 max-h-80 overflow-y-auto">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-gray-300 rounded animate-pulse"></div>
          <div className="flex-1 h-5 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-12 h-6 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
      ))}
    </div>

    {/* See all / See less button skeleton */}
    <div className="mt-4">
      <div className="h-5 w-36 bg-gray-200 rounded animate-pulse"></div>
    </div>
  </div>
</aside>
  )
}
