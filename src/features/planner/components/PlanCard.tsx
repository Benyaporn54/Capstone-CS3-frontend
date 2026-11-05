import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { PlanSummary } from "@/types/plan";
import { formatRelativeTime } from "../utils";
import DefaultPlanBadge from "./DefaultPlanBadge";
import PlanTrackChip from "./PlanTrackChip";

type PlanCardProps = {
  plan: PlanSummary;
};

export default function PlanCard({ plan }: PlanCardProps) {
  return (
    <Link
      href={`/planner/${plan.studyPlanId}`}
      className="group border-border bg-bg hover:border-border-strong focus-visible:ring-accent flex h-full flex-col rounded-lg border p-5 transition-colors focus-visible:ring-2 focus-visible:outline-none"
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-h3 text-fg line-clamp-2 break-words">
          {plan.planName}
        </h2>
        {plan.isDefault && <DefaultPlanBadge />}
      </div>

      <div className="mt-3 flex flex-1 flex-col gap-3">
        <PlanTrackChip track={plan.track} />
        {plan.curriculum && (
          <p className="text-caption text-fg-muted">{plan.curriculum.name}</p>
        )}
      </div>

      <div className="border-border text-caption text-fg-muted mt-4 flex items-center justify-between gap-2 border-t pt-3">
        <span>แก้ไขล่าสุด {formatRelativeTime(plan.updatedAt)}</span>
        <span className="group-hover:text-accent inline-flex items-center gap-0.5 transition-colors">
          เปิดแผน
          <ChevronRight size={14} aria-hidden />
        </span>
      </div>
    </Link>
  );
}
