"use client";

import { useState } from "react";
import { AlertTriangle, Plus } from "lucide-react";
import type { PlanCourse, PlanSemester } from "@/types/plan";
import { countMismatch, SEMESTER_STATUS_LABEL } from "../utils";
import AddCourseModal from "./AddCourseModal";
import PlannerCourseRow, { type CourseAction } from "./PlannerCourseRow";

type PlannerSemesterCardProps = {
  semester: PlanSemester;
  studyPlanId: number;
  studyYear: number;
  plannedCourseIds: ReadonlySet<number>;
  onCourseAdded: (course: PlanCourse, updatedSemester?: PlanSemester) => void;
  onCourseAction?: (action: CourseAction, course: PlanCourse) => void;
  highlightedCourseId?: number | null;
};

export default function PlannerSemesterCard({
  semester,
  studyPlanId,
  studyYear,
  plannedCourseIds,
  onCourseAdded,
  onCourseAction,
  highlightedCourseId = null,
}: PlannerSemesterCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const statusLabel = SEMESTER_STATUS_LABEL[semester.status];
  const mismatch = countMismatch(semester);
  const isCurrent = semester.status === "current";

  return (
    <section
      aria-label={`ภาคเรียนที่ ${semester.semester}`}
      className={`bg-bg flex flex-col overflow-hidden rounded-lg border ${
        isCurrent ? "border-accent" : "border-border"
      }`}
    >
      <header className="border-border flex items-center justify-between gap-3 border-b px-4 py-2.5">
        <div className="flex items-center gap-2">
          <h3 className="text-label text-fg">
            ภาคเรียนที่ {semester.semester}
          </h3>
          {statusLabel && (
            <span
              className={`text-caption rounded-sm px-2 py-0.5 font-medium ${
                isCurrent
                  ? "bg-accent-soft text-accent"
                  : "bg-success-soft text-success"
              }`}
            >
              {statusLabel}
            </span>
          )}
        </div>
        <span className="text-caption text-fg-muted">
          {semester.totalCredits} หน่วยกิต
        </span>
      </header>

      {mismatch > 0 && (
        <p className="bg-warning-soft text-label text-warning border-border flex items-center gap-2 border-b px-4 py-2.5">
          <AlertTriangle size={16} aria-hidden className="shrink-0" />
          ลงทะเบียนจริงไม่ตรงแผน {mismatch} วิชา
        </p>
      )}

      {semester.courses.length > 0 ? (
        <ul>
          {semester.courses.map((course, i) => (
            <PlannerCourseRow
              // วิชาเดียวกันอาจอยู่ 2 แถวในเทอมเดียวกันไม่ได้ แต่กันไว้ด้วย index
              key={`${course.courseId}-${course.source}-${i}`}
              course={course}
              semesterStatus={semester.status}
              onAction={onCourseAction}
              highlighted={
                highlightedCourseId !== null &&
                course.studyPlanCourseId === highlightedCourseId
              }
            />
          ))}
        </ul>
      ) : (
        <p className="text-caption text-fg-muted px-4 py-6 text-center">
          ยังไม่มีวิชาในเทอมนี้
        </p>
      )}

      {semester.status === "upcoming" && (
        <div className="border-border mt-auto border-t p-2">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="text-body text-fg-muted hover:bg-hover hover:text-fg flex h-9 w-full items-center justify-center gap-1.5 rounded-md transition-colors disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-transparent"
          >
            <Plus size={16} aria-hidden />
            เพิ่มวิชา
          </button>
        </div>
      )}

      {isModalOpen && (
        <AddCourseModal
          isOpen
          onClose={() => setIsModalOpen(false)}
          studyPlanId={studyPlanId}
          studyYear={studyYear}
          studySemester={semester.semester}
          plannedCourseIds={plannedCourseIds}
          onAdded={onCourseAdded}
        />
      )}
    </section>
  );
}
