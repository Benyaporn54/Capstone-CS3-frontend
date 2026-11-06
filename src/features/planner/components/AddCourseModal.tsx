"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Check, Loader2, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import type { CourseListItem } from "@/types/course";
import type { Page } from "@/types/common";
import type { PlanCourse } from "@/types/plan";
import { addCourseToPlanAction, searchCoursesAction } from "../actions";

type AddCourseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  studyPlanId: number;
  studyYear: number;
  studySemester: number;
  plannedCourseIds: ReadonlySet<number>;
  onAdded: (course: PlanCourse) => void;
};

export default function AddCourseModal({
  isOpen,
  onClose,
  studyPlanId,
  studyYear,
  studySemester,
  plannedCourseIds,
  onAdded,
}: AddCourseModalProps) {
  const [query, setQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<CourseListItem | null>(
    null,
  );
  const [page, setPage] = useState(0);
  const [results, setResults] = useState<Page<CourseListItem> | null>(null);
  const [searching, setSearching] = useState(true);
  const [searchError, setSearchError] = useState(false);
  const [searchAttempt, setSearchAttempt] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const searchRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const data = await searchCoursesAction(query, page);
        if (!cancelled) {
          setResults(data);
          setSearchError(false);
          setSearching(false);
        }
      } catch {
        if (!cancelled) {
          setResults(null);
          setSearchError(true);
          setSearching(false);
        }
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [isOpen, query, page, searchAttempt]);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => searchRef.current?.focus(), 0);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !pending) onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose, pending]);

  if (!isOpen) return null;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (pending) return;
    if (!selectedCourse) {
      setError("กรุณาเลือกรายวิชาที่ต้องการเพิ่ม");
      return;
    }
    if (plannedCourseIds.has(selectedCourse.id)) {
      setError("รายวิชานี้อยู่ในแผนการเรียนแล้ว");
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await addCourseToPlanAction({
        studyPlanId,
        courseId: selectedCourse.id,
        studyYear,
        studySemester,
      });

      if (result.ok) {
        onAdded(result.course);
        onClose();
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
        aria-labelledby="add-course-title"
        onSubmit={submit}
        className="border-border bg-bg shadow-pop relative z-10 my-8 flex max-h-[min(760px,calc(100vh-2rem))] w-full max-w-[640px] flex-col rounded-lg border"
      >
        <div className="border-border flex items-start justify-between gap-4 border-b px-5 pt-5 pb-4 sm:px-6">
          <div className="flex flex-col gap-0.5">
            <h2 id="add-course-title" className="text-h3 text-fg">
              เพิ่มรายวิชา
            </h2>
            <p className="text-caption text-fg-muted">
              ปี {studyYear} · ภาคเรียนที่ {studySemester}
            </p>
          </div>
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

        <div className="flex min-h-0 flex-1 flex-col gap-4 px-5 py-5 sm:px-6">
          <TextField
            ref={searchRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(0);
              setSearching(true);
              setSelectedCourse(null);
            }}
            leftIcon={<Search size={16} aria-hidden />}
            placeholder="ค้นหาด้วยรหัสหรือชื่อวิชา"
            aria-label="ค้นหารายวิชา"
            disabled={pending}
          />

          <div className="flex items-center justify-between gap-3">
            <p className="text-label text-fg">รายวิชาที่เปิดให้เลือก</p>
            <p className="text-caption text-fg-muted">
              {searching
                ? "กำลังค้นหา…"
                : `พบ ${results?.totalElements ?? 0} วิชา`}
            </p>
          </div>

          <div className="border-border min-h-0 overflow-y-auto rounded-lg border">
            {searching ? (
              <p className="text-body text-fg-muted px-6 py-10 text-center">
                กำลังค้นหารายวิชา…
              </p>
            ) : searchError ? (
              <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
                <p role="alert" className="text-body text-error">
                  ค้นหารายวิชาไม่สำเร็จ
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setSearching(true);
                    setSearchAttempt((attempt) => attempt + 1);
                  }}
                >
                  ลองอีกครั้ง
                </Button>
              </div>
            ) : results && results.content.length > 0 ? (
              <ul role="listbox" aria-label="ผลการค้นหารายวิชา">
                {results.content.map((course) => {
                  const isPlanned = plannedCourseIds.has(course.id);
                  const isSelected = selectedCourse?.id === course.id;
                  const category = course.categories[0];

                  return (
                    <li
                      key={course.id}
                      role="option"
                      aria-selected={isSelected}
                      aria-disabled={isPlanned}
                      className="border-border border-b last:border-b-0"
                    >
                      <button
                        type="button"
                        disabled={pending || isPlanned || !course.isActive}
                        onClick={() => {
                          setSelectedCourse(course);
                          setError(null);
                        }}
                        className={`focus-visible:ring-accent flex w-full items-center gap-3 px-4 py-3 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset disabled:cursor-not-allowed ${
                          isSelected
                            ? "bg-accent-soft"
                            : "hover:bg-hover disabled:bg-surface"
                        }`}
                      >
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                            isSelected
                              ? "border-accent bg-accent text-accent-fg"
                              : "border-border-strong"
                          }`}
                        >
                          {isSelected && <Check size={13} aria-hidden />}
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="flex items-start justify-between gap-3">
                            <span className="text-body text-fg truncate font-medium">
                              {course.courseCode} · {course.nameTh}
                            </span>
                            {isPlanned && (
                              <span className="bg-hover text-caption text-fg-muted shrink-0 rounded-sm px-2 py-0.5">
                                อยู่ในแผนแล้ว
                              </span>
                            )}
                          </span>
                          <span className="text-caption text-fg-muted block truncate">
                            {course.credits} หน่วยกิต
                            {category ? ` · ${category.nameTh}` : ""}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="flex flex-col items-center gap-1 px-6 py-10 text-center">
                <Search size={20} className="text-fg-muted" aria-hidden />
                <p className="text-body text-fg">ไม่พบรายวิชา</p>
                <p className="text-caption text-fg-muted">
                  ลองค้นหาด้วยรหัสหรือชื่อวิชาอื่น
                </p>
              </div>
            )}
          </div>

          {!searching && results && results.totalPages > 1 && (
            <div className="flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="ghost"
                disabled={pending || page === 0}
                onClick={() => {
                  setSearching(true);
                  setPage(page - 1);
                }}
              >
                ก่อนหน้า
              </Button>
              <span className="text-caption text-fg-muted">
                หน้า {page + 1} / {results.totalPages}
              </span>
              <Button
                type="button"
                variant="ghost"
                disabled={pending || page + 1 >= results.totalPages}
                onClick={() => {
                  setSearching(true);
                  setPage(page + 1);
                }}
              >
                ถัดไป
              </Button>
            </div>
          )}

          {error && (
            <p
              role="alert"
              className="bg-error-soft text-caption text-error rounded-md px-3 py-2"
            >
              {error}
            </p>
          )}
        </div>

        <div className="border-border flex items-center justify-between gap-3 border-t px-5 py-4 sm:px-6">
          <p className="text-caption text-fg-muted hidden min-w-0 truncate sm:block">
            {selectedCourse
              ? `เลือก ${selectedCourse.courseCode} · ${selectedCourse.credits} หน่วยกิต`
              : "เลือกได้ครั้งละ 1 รายวิชา"}
          </p>
          <div className="ml-auto flex shrink-0 gap-2">
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
              disabled={pending || !selectedCourse}
              className="gap-2"
            >
              {pending && <Loader2 size={16} className="animate-spin" />}
              {pending ? "กำลังเพิ่ม…" : "เพิ่มในแผน"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
