import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { PlanDetail } from "@/types/plan";
import DefaultPlanBadge from "./DefaultPlanBadge";
import PlanTrackChip from "./PlanTrackChip";

type PlannerHeaderProps = {
  plan: PlanDetail;
};

export function PlannerBackLink() {
  return (
    <Link
      href="/planner"
      className="text-label text-fg-muted hover:text-fg inline-flex w-fit items-center gap-1.5 transition-colors"
    >
      <ArrowLeft size={16} aria-hidden />
      แผนการเรียนของฉัน
    </Link>
  );
}

export default function PlannerHeader({ plan }: PlannerHeaderProps) {
  const { currentYear, currentSemester } = plan.student;

  return (
    <header className="flex flex-col gap-4">
      <PlannerBackLink />
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-h1 text-fg break-words">{plan.planName}</h1>
          {plan.isDefault && <DefaultPlanBadge />}
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <PlanTrackChip track={plan.track} />
          <p className="text-body text-fg-muted">
            {plan.curriculum.name} · กำลังเรียนปี {currentYear} ภาคเรียนที่{" "}
            {currentSemester}
          </p>
        </div>
      </div>
    </header>
  );
}
