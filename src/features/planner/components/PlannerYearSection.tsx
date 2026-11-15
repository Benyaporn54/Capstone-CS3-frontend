import { X } from "lucide-react";
import type { PlanCourse, PlanSemester, PlanYear } from "@/types/plan";
import type { GradeEnrollment, GradeValue } from "@/types/grade";
import { yearAnchorId, yearCredits } from "../utils";
import type { CourseAction, CourseLocation } from "./PlannerCourseRow";
import PlannerSemesterCard from "./PlannerSemesterCard";

type PlannerYearSectionProps = {
  year: PlanYear;
  studyPlanId: number;
  gradeEnrollments: GradeEnrollment[];
  onGradeSaved: (enrollmentId: number, grade: GradeValue) => void;
  plannedCourseIds: ReadonlySet<number>;
  onCourseAdded: (
    semester: number,
    course: PlanCourse,
    updatedSemester?: PlanSemester,
  ) => void;
  onCourseAction?: (
    action: CourseAction,
    course: PlanCourse,
    location: CourseLocation,
  ) => void;
  highlightedCourseId?: number | null;
  /** มีเฉพาะปีสุดท้ายที่เพิ่มเอง (ปี 5 ขึ้นไป) — SCRUM-209 */
  onRemove?: () => void;
};

export default function PlannerYearSection({
  year,
  studyPlanId,
  gradeEnrollments,
  onGradeSaved,
  plannedCourseIds,
  onCourseAdded,
  onCourseAction,
  highlightedCourseId,
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
            {year.academicYear} · {yearCredits(year)} หน่วยกิต
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
            academicYear={year.academicYear}
            gradeEnrollments={gradeEnrollments}
            onGradeSaved={onGradeSaved}
            plannedCourseIds={plannedCourseIds}
            onCourseAdded={(course, updatedSemester) =>
              onCourseAdded(semester.semester, course, updatedSemester)
            }
            onCourseAction={
              onCourseAction &&
              ((action, course) =>
                onCourseAction(action, course, {
                  year: year.year,
                  semester: semester.semester,
                }))
            }
            highlightedCourseId={highlightedCourseId}
          />
        ))}
      </div>
    </section>
  );
}
