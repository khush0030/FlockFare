export function DealSkeleton() {
  return (
    <div className="bg-paper border-4 border-ink rounded-[20px] shadow-brut overflow-hidden animate-pulse">
      <div className="bg-ffgray-200 border-b-4 border-ink px-5 py-4 h-20" />
      <div className="p-5 space-y-4">
        <div className="h-10 bg-ffgray-200 rounded-lg w-2/3" />
        <div className="h-4 bg-ffgray-100 rounded w-1/2" />
        <div className="h-3 bg-ffgray-100 rounded w-3/4" />
        <div className="h-12 bg-ffgray-200 rounded-full mt-6" />
      </div>
    </div>
  );
}

export function DealSkeletonGrid({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <DealSkeleton key={i} />
      ))}
    </div>
  );
}
