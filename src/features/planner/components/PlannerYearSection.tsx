import { X } from "lucide-react";
import type { PlanCourse, PlanYear } from "@/types/plan";
import { yearAnchorId } from "../utils";
import PlannerSemesterCard from "./PlannerSemesterCard";

type PlannerYearSectionProps = {
  year: PlanYear;
  studyPlanId: number;
  plannedCourseIds: ReadonlySet<number>;
  onCourseAdded: (semester: number, course: PlanCourse) => void;
  /** มีเฉพาะปีที่เพิ่มเองฝั่ง FE และยังว่าง */
  onRemove?: () => void;
};

export default function PlannerYearSection({
  year,
  studyPlanId,
  plannedCourseIds,
  onCourseAdded,
  onRemove,
}: PlannerYearSectionProps) {
  const headingId = `${yearAnchorId(year.year)}-heading`;

  return (
    <section
      id={yearAnchorId(year.year)}
      aria-labelledby={headingId}
      className="flex scroll-mt-6 flex-col gap-3"
    >
      <div className="flex items-baseline justify-between gap-3">
        <div className="flex items-baseline gap-3">
          <h2 id={headingId} className="text-h3 text-fg">
            ปี {year.year}
          </h2>
          <span className="text-body text-fg-muted">
            {year.academicYear} · {year.totalCredits} หน่วยกิต
          </span>
        </div>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-caption text-fg-muted hover:bg-hover hover:text-fg inline-flex h-8 items-center gap-1 rounded-md px-2 transition-colors"
          >
            <X size={14} aria-hidden />
            ลบปีนี้
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
        {year.semesters.map((semester) => (
          <PlannerSemesterCard
            key={semester.semester}
            semester={semester}
            studyPlanId={studyPlanId}
            studyYear={year.year}
            plannedCourseIds={plannedCourseIds}
            onCourseAdded={(course) => onCourseAdded(semester.semester, course)}
          />
        ))}
      </div>
    </section>
  );
}
