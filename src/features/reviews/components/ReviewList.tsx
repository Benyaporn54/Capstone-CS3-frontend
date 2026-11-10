"use client";

import { useState, useTransition } from "react";
import Button from "@/components/ui/Button";
import type { CourseReviewPage, ReviewSort } from "@/types/review";
import { loadReviewsAction } from "../actions";
import ReviewCard from "./ReviewCard";

const SORT_OPTIONS: { value: ReviewSort; label: string }[] = [
  { value: "latest", label: "ล่าสุด" },
  { value: "highest", label: "คะแนนสูง" },
  { value: "lowest", label: "คะแนนต่ำ" },
];

type ReviewListProps = {
  courseCode: string;
  /** หน้าแรก (เรียงล่าสุด) ที่ server ดึงมาแล้ว */
  initialPage: CourseReviewPage;
  totalCount: number;
  /** โหลดรีวิวจาก BE ไม่สำเร็จตอน render หน้า */
  loadFailed?: boolean;
};

/** SCRUM-204: แสดงรีวิวในหน้า Course Detail — "ดูรีวิวเพิ่ม" ดึงหน้าถัดไปจาก BE */
export default function ReviewList({
  courseCode,
  initialPage,
  totalCount,
  loadFailed = false,
}: ReviewListProps) {
  const [sort, setSort] = useState<ReviewSort>("latest");
  const [reviews, setReviews] = useState(initialPage.reviews);
  const [page, setPage] = useState(initialPage.page);
  const [totalPages, setTotalPages] = useState(initialPage.totalPages);
  const [error, setError] = useState<string | null>(
    loadFailed ? "โหลดรีวิวไม่สำเร็จ" : null,
  );
  const [pendingAction, setPendingAction] = useState<"sort" | "more" | null>(
    null,
  );
  const [pending, startTransition] = useTransition();

  const load = (
    nextPage: number,
    nextSort: ReviewSort,
    mode: "replace" | "append",
  ) => {
    setError(null);
    setPendingAction(mode === "append" ? "more" : "sort");
    startTransition(async () => {
      const result = await loadReviewsAction(courseCode, nextPage, nextSort);
      if (result.ok) {
        setReviews((current) =>
          mode === "append"
            ? [...current, ...result.page.reviews]
            : result.page.reviews,
        );
        setPage(result.page.page);
        setTotalPages(result.page.totalPages);
      } else {
        setError(result.message);
      }
      setPendingAction(null);
    });
  };

  const changeSort = (next: ReviewSort) => {
    if (next === sort || pending) return;
    setSort(next);
    load(0, next, "replace");
  };

  const hasMore = page + 1 < totalPages;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-h3 text-fg">รีวิว {totalCount}</h2>
        {totalCount > 1 && (
          <div className="flex items-center gap-3">
            {SORT_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => changeSort(option.value)}
                disabled={pending}
                aria-pressed={sort === option.value}
                className={`text-label cursor-pointer disabled:cursor-wait ${
                  sort === option.value
                    ? "text-fg font-medium"
                    : "text-fg-muted hover:text-fg"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {reviews.length === 0 && !error ? (
        <p className="border-border bg-surface text-body text-fg-muted rounded-lg border p-8 text-center">
          ยังไม่มีรีวิวสำหรับวิชานี้
        </p>
      ) : (
        <ul
          className={`flex flex-col gap-3 transition-opacity ${
            pendingAction === "sort" ? "opacity-50" : ""
          }`}
        >
          {reviews.map((review) => (
            <li key={review.id}>
              <ReviewCard review={review} />
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p role="alert" className="text-caption text-error text-center">
          {error}
        </p>
      )}

      {hasMore && (
        <div className="flex justify-center">
          <Button
            type="button"
            variant="secondary"
            disabled={pending}
            onClick={() => load(page + 1, sort, "append")}
          >
            {pendingAction === "more" ? "กำลังโหลด…" : "ดูรีวิวเพิ่ม"}
          </Button>
        </div>
      )}
    </section>
  );
}
