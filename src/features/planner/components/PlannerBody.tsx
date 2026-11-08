"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import type {
  PlanCourse,
  PlanDetail,
  PlanSemester,
  PlanYear,
} from "@/types/plan";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { removeCourseAction } from "../actions";
import MoveCourseModal from "./MoveCourseModal";
import type { CourseAction, CourseLocation } from "./PlannerCourseRow";
import PlannerCreditSummary from "./PlannerCreditSummary";
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
  updatedSemester?: PlanSemester;
};

type CourseActionTarget = {
  action: CourseAction;
  course: PlanCourse;
  location: CourseLocation;
};

/** ไฮไลต์แถวที่ย้ายมานานเท่าไร */
const HIGHLIGHT_MS = 2500;

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
      itFoundationCredits: 0,
      generalEducationCredits: 0,
      trackCredits: 0,
      projectAndWorkCredits: 0,
      freeElectiveCredits: 0,
      courses: [],
    })),
  };
}

export default function PlannerBody({ plan }: PlannerBodyProps) {
  // ปีที่เพิ่มด้วยปุ่ม "เพิ่มปีการศึกษา" อยู่แค่ฝั่ง FE (ไม่มี API ตาม SCRUM-168)
  // จะถูกบันทึกจริงเมื่อเพิ่มวิชาลงปีนั้น (SCRUM-170) — รีเฟรชแล้วปีว่างจะหายไป
  const [extraYearNumbers, setExtraYearNumbers] = useState<number[]>([]);
  const [addedCourses, setAddedCourses] = useState<AddedCourse[]>([]);
  // SCRUM-172: เมนู ⋯ ของวิชาที่เพิ่มเอง
  const [actionTarget, setActionTarget] = useState<CourseActionTarget | null>(
    null,
  );
  const [removeError, setRemoveError] = useState<string | null>(null);
  const [removing, startRemove] = useTransition();
  const [highlightedCourseId, setHighlightedCourseId] = useState<number | null>(
    null,
  );
  const { showToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (highlightedCourseId === null) return;
    const timer = setTimeout(() => setHighlightedCourseId(null), HIGHLIGHT_MS);
    return () => clearTimeout(timer);
  }, [highlightedCourseId]);

  /** วิชาที่ย้าย/ลบแล้วต้องไม่ถูกเติมกลับจากรายการที่เพิ่งเพิ่มฝั่ง client */
  const forgetAddedCourse = (courseId: number) =>
    setAddedCourses((current) =>
      current.filter((item) => item.course.courseId !== courseId),
    );

  const closeAction = () => {
    setActionTarget(null);
    setRemoveError(null);
  };

  const confirmRemove = () => {
    if (!actionTarget || actionTarget.course.studyPlanCourseId === null) return;
    const { course } = actionTarget;
    setRemoveError(null);
    startRemove(async () => {
      const result = await removeCourseAction({
        studyPlanId: plan.studyPlanId,
        studyPlanCourseId: course.studyPlanCourseId!,
      });
      if (result.ok) {
        forgetAddedCourse(course.courseId);
        closeAction();
        showToast(`เอา ${course.courseCode} ออกจากแผนแล้ว`);
        router.refresh();
      } else {
        setRemoveError(result.message);
      }
    });
  };

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
      // ใช้ผลคำนวณแยกหมวดจาก BE; หากยังดึงไม่ได้ ให้แสดงว่าไม่พร้อมแทนตัวเลขเก่า
      for (const field of [
        "itFoundationCredits",
        "generalEducationCredits",
        "trackCredits",
        "projectAndWorkCredits",
        "freeElectiveCredits",
      ] as const) {
        semester[field] = added.updatedSemester?.[field];
      }
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
        <PlannerCreditSummary
          years={years}
          requiredCredits={plan.curriculum.totalCredits}
        />
        <PlannerYearNav years={years} />
      </aside>

      <div className="flex min-w-0 flex-col gap-10">
        {years.map((year, i) => (
          <PlannerYearSection
            key={year.year}
            year={year}
            studyPlanId={plan.studyPlanId}
            plannedCourseIds={plannedCourseIds}
            onCourseAdded={(semester, course, updatedSemester) =>
              setAddedCourses((current) => [
                ...current.filter(
                  (item) => item.course.courseId !== course.courseId,
                ),
                { year: year.year, semester, course, updatedSemester },
              ])
            }
            onCourseAction={(action, course, location) =>
              setActionTarget({ action, course, location })
            }
            highlightedCourseId={highlightedCourseId}
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

      {actionTarget?.action === "move" && (
        <MoveCourseModal
          studyPlanId={plan.studyPlanId}
          course={actionTarget.course}
          from={actionTarget.location}
          years={years}
          onClose={closeAction}
          onMoved={(course, to) => {
            forgetAddedCourse(course.courseId);
            closeAction();
            setHighlightedCourseId(course.studyPlanCourseId);
            showToast(
              `ย้าย ${course.courseCode} ไป ปี ${to.year} ภาคเรียนที่ ${to.semester} แล้ว`,
            );
          }}
        />
      )}

      <Modal
        isOpen={actionTarget?.action === "remove"}
        onClose={() => !removing && closeAction()}
        type="danger"
        title={`เอา ${actionTarget?.course.courseCode ?? ""} ออกจากแผน?`}
        description={
          actionTarget &&
          `${actionTarget.course.nameTh} จะถูกเอาออกจาก ปี ${actionTarget.location.year} ภาคเรียนที่ ${actionTarget.location.semester} ของ “${plan.planName}” เพิ่มกลับได้ภายหลังด้วยปุ่ม “+ เพิ่มวิชา”`
        }
        showCancel
        confirmLabel="เอาออก"
        loadingLabel="กำลังเอาออก…"
        closeOnConfirm={false}
        loading={removing}
        errorMessage={removeError}
        onConfirm={confirmRemove}
      />
    </div>
  );
}
