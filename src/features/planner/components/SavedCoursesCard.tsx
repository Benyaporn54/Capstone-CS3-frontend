"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Plus, X } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Dropdown from "@/components/ui/Dropdown";
import { useToast } from "@/components/ui/Toast";
import type { CourseListItem } from "@/types/course";
import type { PlanCourse, PlanSemester, PlanYear } from "@/types/plan";
import { addCourseToPlanAction } from "../actions";

type Props = {
  savedCourses: CourseListItem[] | null;
  studyPlanId: number;
  years: PlanYear[];
  plannedCourseIds: ReadonlySet<number>;
  onAdded: (
    year: number,
    semester: number,
    course: PlanCourse,
    updatedSemester?: PlanSemester,
  ) => void;
};

export default function SavedCoursesCard({
  savedCourses,
  studyPlanId,
  years,
  plannedCourseIds,
  onAdded,
}: Props) {
  const [showAll, setShowAll] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<CourseListItem | null>(
    null,
  );
  const [selectedTerm, setSelectedTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const { showToast } = useToast();

  const terms = years.flatMap((year) =>
    year.semesters
      .filter((semester) => semester.status === "upcoming")
      .map((semester) => ({
        value: `${year.year}-${semester.semester}`,
        label: `ปี ${year.year} · ภาคเรียนที่ ${semester.semester}`,
      })),
  );
  const visibleCourses = showAll ? savedCourses : savedCourses?.slice(0, 3);

  const addSelected = () => {
    if (!selectedCourse || pending) return;
    const [year, semester] = (selectedTerm || terms[0]?.value || "")
      .split("-")
      .map(Number);
    if (!year || !semester) return;
    setError(null);
    startTransition(async () => {
      const result = await addCourseToPlanAction({
        studyPlanId,
        courseId: selectedCourse.id,
        studyYear: year,
        studySemester: semester,
      });
      if (result.ok) {
        onAdded(year, semester, result.course, result.updatedSemester);
        showToast(`เพิ่ม ${selectedCourse.courseCode} ในแผนแล้ว`);
        setSelectedCourse(null);
        router.refresh();
      } else {
        setError(result.message);
      }
    });
  };

  return (
    <>
      <Card
        aria-labelledby="saved-courses-heading"
        variant="surface"
        className="p-4"
      >
        <h2
          id="saved-courses-heading"
          className="text-label text-fg font-semibold"
        >
          วิชาที่บันทึกไว้{savedCourses ? ` ${savedCourses.length}` : ""}
        </h2>
        <p className="text-caption text-fg-muted mt-1">
          กด + เพื่อเลือกภาคเรียนที่จะเพิ่ม
        </p>

        {savedCourses === null ? (
          <div className="mt-4 flex flex-col items-start gap-2">
            <p role="alert" className="text-caption text-error">
              โหลดวิชาที่บันทึกไว้ไม่สำเร็จ
            </p>
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.refresh()}
            >
              ลองอีกครั้ง
            </Button>
          </div>
        ) : savedCourses.length === 0 ? (
          <p className="text-caption text-fg-muted mt-4">
            ยังไม่มีวิชาที่บันทึกไว้
          </p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {visibleCourses?.map((course) => {
              const alreadyInPlan = plannedCourseIds.has(course.id);
              const category = course.categories?.[0];
              return (
                <li
                  key={course.id}
                  className="border-border bg-bg flex items-center gap-2 rounded-md border p-2.5"
                >
                  <Link
                    href={`/courses/${course.courseCode}`}
                    className="hover:text-accent min-w-0 flex-1"
                  >
                    <span className="text-caption text-fg-muted block truncate">
                      {course.courseCode} ·{" "}
                      {category?.nameTh ?? `${course.credits} หน่วยกิต`}
                    </span>
                    <span className="text-label text-fg block truncate font-medium">
                      {course.nameEn || course.nameTh}
                    </span>
                  </Link>
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={
                      alreadyInPlan || terms.length === 0 || !course.isActive
                    }
                    onClick={() => {
                      setSelectedCourse(course);
                      setSelectedTerm(terms[0]?.value ?? "");
                      setError(null);
                    }}
                    aria-label={
                      alreadyInPlan
                        ? `${course.courseCode} อยู่ในแผนแล้ว`
                        : `เพิ่ม ${course.courseCode} ในแผน`
                    }
                    title={
                      alreadyInPlan
                        ? "อยู่ในแผนแล้ว"
                        : terms.length === 0
                          ? "ไม่มีภาคเรียนที่เพิ่มวิชาได้"
                          : "เพิ่มในแผน"
                    }
                    className="!size-7 !shrink-0 !p-0"
                  >
                    <Plus size={15} aria-hidden />
                  </Button>
                </li>
              );
            })}
          </ul>
        )}

        {savedCourses && savedCourses.length > 3 && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => setShowAll((current) => !current)}
            className="text-caption !text-accent mt-4 w-full"
          >
            {showAll ? "แสดงน้อยลง" : "ดูวิชาเพิ่ม"}
          </Button>
        )}
        {savedCourses && savedCourses.length <= 3 && (
          <Link
            href="/courses"
            className="text-caption text-accent hover:text-accent-hover mt-4 block text-center"
          >
            ดูรายวิชาเพิ่ม
          </Link>
        )}
      </Card>

      {selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="bg-fg/40 absolute inset-0"
            onClick={() => !pending && setSelectedCourse(null)}
            aria-hidden
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="saved-course-add-title"
            className="border-border bg-bg shadow-pop relative z-10 w-full max-w-sm rounded-lg border p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="saved-course-add-title" className="text-h3 text-fg">
                  เพิ่มวิชาในแผน
                </h2>
                <p className="text-body text-fg-muted mt-1">
                  {selectedCourse.courseCode} · {selectedCourse.nameTh}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setSelectedCourse(null)}
                disabled={pending}
                aria-label="ปิด"
                className="!size-7 !p-0"
              >
                <X size={18} aria-hidden />
              </Button>
            </div>
            <div className="mt-5">
              <Dropdown
                label="ภาคเรียน"
                value={selectedTerm}
                onChange={(event) => setSelectedTerm(event.target.value)}
                options={terms}
                disabled={pending}
              />
            </div>
            {error && (
              <p
                role="alert"
                className="bg-error-soft text-caption text-error mt-3 rounded-md p-2"
              >
                {error}
              </p>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setSelectedCourse(null)}
                disabled={pending}
              >
                ยกเลิก
              </Button>
              <Button
                type="button"
                onClick={addSelected}
                disabled={pending || !selectedTerm}
                className="gap-2"
              >
                {pending && (
                  <Loader2 size={16} className="animate-spin" aria-hidden />
                )}
                เพิ่มในแผน
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
