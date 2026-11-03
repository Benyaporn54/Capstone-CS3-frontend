export default function TrackListSkeleton() {
  return (
    <div aria-busy="true" className="flex flex-col gap-8">
      {Array.from({ length: 2 }).map((_, section) => (
        <div key={section} className="flex flex-col gap-3">
          <div className="bg-hover h-5 w-36 animate-pulse rounded-md" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="border-border bg-surface h-36 animate-pulse rounded-lg border"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
