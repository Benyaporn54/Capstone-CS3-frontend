"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, X } from "lucide-react";
import Button from "@/components/ui/Button";
import RadioButton from "@/components/ui/RadioButton";
import type { PlanCourse, PlanYear } from "@/types/plan";
import { semesterCredits } from "../utils";
import { moveCourseAction } from "../actions";
import type { CourseLocation } from "./PlannerCourseRow";

type MoveCourseModalProps = {
  studyPlanId: number;
  course: PlanCourse;
  from: CourseLocation;
  /** ทุกปีที่แสดงในหน้า รวมปีที่กด "เพิ่มปีการศึกษา" ไว้ */
  years: PlanYear[];
  onClose: () => void;
  onMoved: (course: PlanCourse, to: CourseLocation) => void;
};

const termKey = (year: number, semester: number) => `${year}-${semester}`;

/** SCRUM-172: เลือกภาคเรียนปลายทาง (เฉพาะเทอมที่ยังไม่ถึง) แล้ว PATCH ผ่าน server action */
export default function MoveCourseModal({
  studyPlanId,
  course,
  from,
  years,
  onClose,
  onMoved,
}: MoveCourseModalProps) {
  const [selected, setSelected] = useState<CourseLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const groups = years
    .map((year) => ({
      year,
      semesters: year.semesters.filter((s) => s.status === "upcoming"),
    }))
    .filter((group) => group.semesters.length > 0);
  const hasOtherTerm = groups.some((group) =>
    group.semesters.some(
      (s) => group.year.year !== from.year || s.semester !== from.semester,
    ),
  );

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !pending) onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, pending]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!selected || pending || course.studyPlanCourseId === null) return;
    setError(null);
    startTransition(async () => {
      const result = await moveCourseAction({
        studyPlanId,
        studyPlanCourseId: course.studyPlanCourseId!,
        studyYear: selected.year,
        studySemester: selected.semester,
      });
      if (result.ok) {
        onMoved(result.course, selected);
        router.refresh();
      } else {
        setError(result.message);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:items-center">
      <div
        className="bg-fg/40 fixed inset-0"
        onClick={() => !pending && onClose()}
        aria-hidden
      />

      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="move-course-title"
        onSubmit={submit}
        className="border-border bg-bg shadow-pop relative z-10 my-8 flex w-full max-w-[440px] flex-col rounded-lg border"
      >
        <div className="flex items-start justify-between gap-4 px-5 pt-5">
          <h2 id="move-course-title" className="text-h3 text-fg">
            ย้ายวิชาไปภาคเรียนอื่น
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            aria-label="ปิด"
            className="text-fg-muted hover:bg-hover hover:text-fg focus-visible:ring-accent -mr-2 rounded-md p-1.5 transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40"
          >
            <X size={18} aria-hidden />
          </button>
        </div>

        <div className="flex flex-col gap-3 px-5 py-4">
          <div className="border-border bg-surface rounded-md border px-3 py-2.5">
            <p className="text-body text-fg truncate" title={course.nameEn}>
              {course.nameTh}
            </p>
            <p className="text-caption text-fg-muted">
              <span className="text-fg font-medium">{course.courseCode}</span>
              {" · "}
              {course.credits} หน่วยกิต · ตอนนี้อยู่ ปี {from.year} ภาคเรียนที่{" "}
              {from.semester}
            </p>
          </div>

          {hasOtherTerm ? (
            <fieldset className="flex flex-col gap-2">
              <legend className="sr-only">เลือกภาคเรียนปลายทาง</legend>
              {groups.map(({ year, semesters }) => (
                <div key={year.year} className="flex flex-col gap-1.5">
                  <p className="text-caption text-fg-muted font-medium">
                    ปี {year.year} · {year.academicYear}
                  </p>
                  {semesters.map((semester) => {
                    const isCurrentTerm =
                      year.year === from.year &&
                      semester.semester === from.semester;
                    const isSelected =
                      selected?.year === year.year &&
                      selected.semester === semester.semester;
                    const select = () =>
                      !isCurrentTerm &&
                      !pending &&
                      setSelected({
                        year: year.year,
                        semester: semester.semester,
                      });
                    return (
                      <div
                        key={termKey(year.year, semester.semester)}
                        onClick={select}
                        className={`flex items-center justify-between gap-3 rounded-md border px-3 py-2 transition-colors ${
                          isCurrentTerm
                            ? "border-border bg-surface"
                            : isSelected
                              ? "border-accent bg-accent-soft cursor-pointer"
                              : "border-border hover:bg-hover cursor-pointer"
                        }`}
                      >
                        <RadioButton
                          name="move-target"
                          value={termKey(year.year, semester.semester)}
                          checked={isSelected}
                          disabled={isCurrentTerm || pending}
                          onChange={select}
                          label={`ภาคเรียนที่ ${semester.semester}`}
                        />
                        {isCurrentTerm ? (
                          <span className="bg-hover text-caption text-fg-muted rounded-sm px-2 py-0.5 font-medium">
                            อยู่ที่นี่
                          </span>
                        ) : (
                          <span className="text-caption text-fg-muted">
                            {isSelected
                              ? `${semesterCredits(semester)} → ${semesterCredits(semester) + course.credits}`
                              : semesterCredits(semester)}{" "}
                            หน่วยกิต
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </fieldset>
          ) : (
            <p className="text-body text-fg-muted">
              ยังไม่มีภาคเรียนอื่นที่ย้ายไปได้ ลองกด “เพิ่มปีการศึกษา” ก่อน
            </p>
          )}

          {error && (
            <p
              role="alert"
              className="bg-error-soft text-label text-error flex items-start gap-2 rounded-md px-3 py-2"
            >
              <AlertCircle size={16} aria-hidden className="mt-0.5 shrink-0" />
              {error}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 px-5 pb-5">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={pending}
          >
            ยกเลิก
          </Button>
          <Button
            type="submit"
            disabled={!selected || pending}
            className="gap-1.5"
          >
            {pending && (
              <Loader2 size={16} aria-hidden className="animate-spin" />
            )}
            {pending ? "กำลังย้าย…" : "ย้ายวิชา"}
          </Button>
        </div>
      </form>
    </div>
  );
}
