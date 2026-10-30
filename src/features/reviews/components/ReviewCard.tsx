import { BadgeCheck } from "lucide-react";
import type { CourseReview } from "@/types/review";
import DisplayStars from "@/features/courses/components/DisplayStars";
import MetricBar from "@/features/courses/components/MetricBar";

type ReviewCardProps = {
  review: CourseReview;
};

export default function ReviewCard({ review }: ReviewCardProps) {
  return (
    <article className="border-border flex flex-col gap-3 rounded-lg border p-5">
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="bg-surface text-caption text-fg-muted flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
            {review.initials}
          </span>
          <div className="flex flex-col">
            <p className="text-body text-fg flex items-center gap-1 font-medium">
              {review.displayName}
              {review.verified && (
                <BadgeCheck
                  size={14}
                  className="text-success fill-success-soft"
                  aria-label="บัญชีที่ยืนยันแล้ว"
                />
              )}
            </p>
            <p className="text-caption text-fg-muted">
              เขียนเมื่อ {review.writtenAt} · {review.relativeTime}
            </p>
          </div>
        </div>
        <DisplayStars value={review.rating} size={14} />
      </header>

      <p className="text-body text-fg">{review.comment}</p>

      <dl className="flex flex-wrap items-center gap-x-5 gap-y-1">
        <div className="flex items-center gap-2">
          <dt className="text-caption text-fg-muted">ความยาก</dt>
          <dd className="text-caption text-fg-muted flex items-center gap-1.5">
            <MetricBar value={review.difficulty} />
            {review.difficulty}/5
          </dd>
        </div>
        <div className="flex items-center gap-2">
          <dt className="text-caption text-fg-muted">ปริมาณงาน</dt>
          <dd className="text-caption text-fg-muted flex items-center gap-1.5">
            <MetricBar value={review.workload} />
            {review.workload}/5
          </dd>
        </div>
      </dl>
    </article>
  );
}
