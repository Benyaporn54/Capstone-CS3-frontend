import { Suspense } from "react";
import type { Metadata } from "next";
import PlannerSkeleton from "@/features/planner/components/PlannerSkeleton";
import PlannerView from "@/features/planner/components/PlannerView";

export const metadata: Metadata = {
  title: "แผนการเรียน · planIT",
};

type PlannerPageProps = {
  params: Promise<{ planId: string }>;
};

export default function PlannerPage({ params }: PlannerPageProps) {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10">
      <Suspense fallback={<PlannerSkeleton />}>
        <PlannerView params={params} />
      </Suspense>
    </main>
  );
}
