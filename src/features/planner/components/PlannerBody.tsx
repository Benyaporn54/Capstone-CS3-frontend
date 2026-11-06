"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import type { PlanCourse, PlanDetail, PlanYear } from "@/types/plan";
import PlannerYearNav from "./PlannerYearNav";
import PlannerYearSection from "./PlannerYearSection";

/** ป.ตรี 4 ปี เรียนได้ไม่เกิน 8 ปีการศึกษา */
const MAX_YEARS = 8;

type PlannerBodyProps = {
  plan: PlanDetail;
};

type AddedCourse = {
  year: number;
  semester: number;
  course: PlanCourse;
};

function emptyYear(year: number, admissionYear: number): PlanYear {
  return {
    year,
    academicYear: admissionYear + year - 1,
    status: "upcoming",
    totalCredits: 0,
    semesters: [1, 2].map((semester) => ({
      semester,
      status: "upcoming",
      totalCredits: 0,
      courses: [],
    })),
  };
}

export default function PlannerBody({ plan }: PlannerBodyProps) {
  // ปีที่เพิ่มด้วยปุ่ม "เพิ่มปีการศึกษา" อยู่แค่ฝั่ง FE (ไม่มี API ตาม SCRUM-168)
  // จะถูกบันทึกจริงเมื่อเพิ่มวิชาลงปีนั้น (SCRUM-170) — รีเฟรชแล้วปีว่างจะหายไป
  const [extraYearNumbers, setExtraYearNumbers] = useState<number[]>([]);
  const [addedCourses, setAddedCourses] = useState<AddedCourse[]>([]);

  const lastYear = plan.years.at(-1)?.year ?? 0;
  // ปีที่ BE บันทึกกลับมาแล้วจะถูกตัดออกจากรายการปีชั่วคราวโดยอัตโนมัติ
  const extraYears = extraYearNumbers.filter(
    (year) => !plan.years.some((item) => item.year === year),
  );
  const years = useMemo(() => {
    const result = structuredClone([
      ...plan.years,
      ...extraYears.map((year) => emptyYear(year, plan.student.admissionYear)),
    ]);
    const serverCourseIds = new Set(
      plan.years.flatMap((year) =>
        year.semesters.flatMap((semester) =>
          semester.courses.map((course) => course.courseId),
        ),
      ),
    );

    for (const added of addedCourses) {
      if (serverCourseIds.has(added.course.courseId)) continue;
      const year = result.find((item) => item.year === added.year);
      const semester = year?.semesters.find(
        (item) => item.semester === added.semester,
      );
      if (!year || !semester) continue;
      semester.courses.push(added.course);
      semester.totalCredits += added.course.credits;
      year.totalCredits += added.course.credits;
    }
    return result;
  }, [addedCourses, extraYears, plan]);
  const canAddYear = years.length < MAX_YEARS;
  const plannedCourseIds = new Set(
    years.flatMap((year) =>
      year.semesters.flatMap((semester) =>
        semester.courses.map((course) => course.courseId),
      ),
    ),
  );

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-8">
      <aside className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start">
        {/* TODO (SCRUM-175): การ์ดหน่วยกิตในแผน แยกตามหมวด วางตรงนี้ เหนือเมนูปี */}
        <PlannerYearNav years={years} />
      </aside>

      <div className="flex min-w-0 flex-col gap-10">
        {years.map((year, i) => (
          <PlannerYearSection
            key={year.year}
            year={year}
            studyPlanId={plan.studyPlanId}
            plannedCourseIds={plannedCourseIds}
            onCourseAdded={(semester, course) =>
              setAddedCourses((current) => [
                ...current.filter(
                  (item) => item.course.courseId !== course.courseId,
                ),
                { year: year.year, semester, course },
              ])
            }
            onRemove={
              // ลบได้เฉพาะปีที่เพิ่มเองล่าสุด ให้เลขปีต่อเนื่อง
              extraYears.length > 0 && i === years.length - 1
                ? () => setExtraYearNumbers((current) => current.slice(0, -1))
                : undefined
            }
          />
        ))}

        {canAddYear ? (
          <button
            type="button"
            onClick={() =>
              setExtraYearNumbers((current) => [
                ...current,
                Math.max(lastYear, ...current) + 1,
              ])
            }
            className="border-border-strong/60 text-body text-fg-muted hover:border-accent hover:bg-accent-soft hover:text-accent focus-visible:ring-accent flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-dashed transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            <Plus size={16} aria-hidden />
            เพิ่มปีการศึกษา
          </button>
        ) : (
          <p className="text-caption text-fg-muted text-center">
            วางแผนได้สูงสุด {MAX_YEARS} ปีการศึกษา
          </p>
        )}
      </div>
    </div>
  );
}
