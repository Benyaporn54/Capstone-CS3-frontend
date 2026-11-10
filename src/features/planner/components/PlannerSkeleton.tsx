import { PlannerBackLink } from "./PlannerHeader";

function SemesterSkeleton() {
  return (
    <div className="border-border bg-bg rounded-lg border">
      <div className="border-border flex justify-between border-b px-4 py-3">
        <div className="bg-hover h-4 w-24 animate-pulse rounded-md" />
        <div className="bg-hover h-4 w-14 animate-pulse rounded-md" />
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="border-border flex flex-col gap-1.5 border-b px-4 py-3 last:border-b-0"
        >
          <div className="bg-hover h-4 w-3/5 animate-pulse rounded-md" />
          <div className="bg-hover h-3 w-2/5 animate-pulse rounded-md" />
        </div>
      ))}
    </div>
  );
}

export default function PlannerSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="กำลังโหลดแผนการเรียน"
      className="contents"
    >
      <div className="flex flex-col gap-4">
        <PlannerBackLink />
        <div className="bg-hover h-10 w-56 animate-pulse rounded-md" />
        <div className="bg-hover h-5 w-80 max-w-full animate-pulse rounded-md" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-8">
        <div className="flex flex-col gap-4">
          <div className="bg-hover hidden h-44 animate-pulse rounded-lg lg:block" />
        </div>
        <div className="flex flex-col gap-3">
          <div className="bg-hover h-7 w-40 animate-pulse rounded-md" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <SemesterSkeleton />
            <SemesterSkeleton />
          </div>
        </div>
        <div className="bg-hover hidden h-64 animate-pulse rounded-lg min-[1440px]:block" />
      </div>
    </div>
  );
}
