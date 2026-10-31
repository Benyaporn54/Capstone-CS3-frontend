export default function CourseDetailSkeleton() {
  return (
    <main
      aria-busy="true"
      className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-8"
    >
      <div className="bg-hover h-4 w-56 animate-pulse rounded-md" />
      <div className="flex flex-col gap-3">
        <div className="bg-hover h-4 w-20 animate-pulse rounded-md" />
        <div className="bg-hover h-9 w-80 max-w-full animate-pulse rounded-md" />
        <div className="bg-hover h-5 w-64 animate-pulse rounded-md" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="flex flex-col gap-3">
          <div className="bg-hover h-6 w-28 animate-pulse rounded-md" />
          <div className="bg-hover h-24 animate-pulse rounded-lg" />
          <div className="border-border h-32 animate-pulse rounded-lg border" />
          <div className="border-border h-32 animate-pulse rounded-lg border" />
        </div>
        <div className="flex flex-col gap-4">
          <div className="border-border bg-surface h-56 animate-pulse rounded-lg border" />
          <div className="border-border bg-surface h-40 animate-pulse rounded-lg border" />
        </div>
      </div>
    </main>
  );
}
