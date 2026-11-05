import PlanListHeader from "./PlanListHeader";

export default function PlanListSkeleton() {
  return (
    <>
      <PlanListHeader
        actions={
          <div className="flex items-center gap-4">
            <div className="bg-hover h-4 w-14 animate-pulse rounded-md" />
            <div className="bg-hover h-9 w-36 animate-pulse rounded-md" />
          </div>
        }
      />

      <ul
        aria-busy="true"
        aria-label="กำลังโหลดแผนการเรียน"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {Array.from({ length: 3 }).map((_, i) => (
          <li
            key={i}
            className="border-border bg-bg flex flex-col gap-3 rounded-lg border p-5"
          >
            <div className="bg-hover h-6 w-1/2 animate-pulse rounded-md" />
            <div className="bg-hover h-6 w-1/3 animate-pulse rounded-full" />
            <div className="bg-hover h-3 w-1/4 animate-pulse rounded-md" />
            <div className="border-border mt-1 border-t pt-3">
              <div className="bg-hover h-3 w-2/5 animate-pulse rounded-md" />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
