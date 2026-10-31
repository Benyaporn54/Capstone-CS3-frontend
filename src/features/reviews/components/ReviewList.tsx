"use client";

import { useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import type { CourseReview, ReviewSort } from "@/types/review";
import ReviewCard from "./ReviewCard";

const SORT_OPTIONS: { value: ReviewSort; label: string }[] = [
  { value: "latest", label: "ล่าสุด" },
  { value: "highest", label: "คะแนนสูง" },
  { value: "lowest", label: "คะแนนต่ำ" },
];

const INITIAL_VISIBLE = 3;

type ReviewListProps = {
  reviews: CourseReview[];
  totalCount: number;
};

export default function ReviewList({ reviews, totalCount }: ReviewListProps) {
  const [sort, setSort] = useState<ReviewSort>("latest");
  const [visible, setVisible] = useState(INITIAL_VISIBLE);

  const sorted = useMemo(() => {
    const next = [...reviews];
    if (sort === "highest") {
      next.sort((a, b) => b.rating - a.rating || b.id - a.id);
    } else if (sort === "lowest") {
      next.sort((a, b) => a.rating - b.rating || b.id - a.id);
    } else {
      next.sort((a, b) => b.id - a.id);
    }
    return next;
  }, [reviews, sort]);

  const shown = sorted.slice(0, visible);
  const hasMore = visible < sorted.length;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-h3 text-fg">รีวิว {totalCount}</h2>
        <div className="flex items-center gap-3">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                setSort(option.value);
                setVisible(INITIAL_VISIBLE);
              }}
              className={`text-label cursor-pointer ${
                sort === option.value
                  ? "text-fg font-medium"
                  : "text-fg-muted hover:text-fg"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {shown.length === 0 ? (
        <p className="border-border bg-surface text-body text-fg-muted rounded-lg border p-8 text-center">
          ยังไม่มีรีวิวสำหรับวิชานี้
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {shown.map((review) => (
            <li key={review.id}>
              <ReviewCard review={review} />
            </li>
          ))}
        </ul>
      )}

      {hasMore && (
        <div className="flex justify-center">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setVisible((count) => count + INITIAL_VISIBLE)}
          >
            ดูรีวิวเพิ่ม
          </Button>
        </div>
      )}
    </section>
  );
}
