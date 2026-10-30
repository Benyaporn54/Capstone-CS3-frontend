export default function CourseListSkeleton() {
  return (
    <div aria-busy="true" className="flex flex-col gap-6">
      <div className="bg-hover h-5 w-24 animate-pulse rounded-md" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="border-border bg-surface h-36 animate-pulse rounded-lg border"
          />
        ))}
      </div>
    </div>
  );
}
