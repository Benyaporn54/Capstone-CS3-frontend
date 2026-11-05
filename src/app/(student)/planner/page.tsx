import { Suspense } from "react";
import type { Metadata } from "next";
import PlanList from "@/features/planner/components/PlanList";
import PlanListSkeleton from "@/features/planner/components/PlanListSkeleton";

export const metadata: Metadata = {
  title: "แผนการเรียนของฉัน · planIT",
};

export default function PlansPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10">
      <Suspense fallback={<PlanListSkeleton />}>
        <PlanList />
      </Suspense>
    </main>
  );
}
