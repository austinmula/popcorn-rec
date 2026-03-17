export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
      {/* Page title placeholder */}
      <div className="h-8 w-48 bg-white/10 rounded-lg mb-8" />

      {/* Card grid skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {Array.from({ length: 18 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="w-full aspect-[2/3] bg-white/10 rounded-lg" />
            <div className="h-3.5 bg-white/10 rounded w-4/5" />
            <div className="h-3 bg-white/5 rounded w-1/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
