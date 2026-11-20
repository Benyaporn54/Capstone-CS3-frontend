import Link from "next/link";
import { redirect } from "next/navigation";
import { ApiError } from "@/lib/api";
import { ChevronRight, EyeOff, SquarePen } from "lucide-react";
import DisplayStars from "@/features/courses/components/DisplayStars";
import type { MyReview, ReviewableCourse } from "@/types/review";
import { getMyReviews, getReviewableCourses } from "../api";

export type MyReviewsData = {
  reviewable: ReviewableCourse[] | null;
  reviewed: MyReview[] | null;
};

export async function loadMyReviews(
  token: string,
  callbackUrl: string,
): Promise<MyReviewsData> {
  let unauthorized = false;
  const handleError = (label: string) => (error: unknown) => {
    if (error instanceof ApiError && error.status === 401) {
      unauthorized = true;
    } else {
      console.error(`Failed to load ${label}:`, error);
    }
    return null;
  };

  const [reviewable, reviewed] = await Promise.all([
    getReviewableCourses(token).catch(handleError("reviewable courses")),
    getMyReviews(token).catch(handleError("my reviews")),
  ]);

  if (unauthorized) {
    const params = new URLSearchParams({
      callbackUrl,
      message: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่",
    });
    redirect(`/login?${params}`);
  }
  return { reviewable, reviewed };
}

export function ReviewableList({ reviewable, reviewed }: MyReviewsData) {
  if (reviewable === null) return <LoadError />;
  if (reviewable.length === 0) {
    return (
      <EmptyState>
        {reviewed && reviewed.length > 0
          ? "รีวิวครบทุกวิชาที่เรียนจบแล้ว"
          : "ยังไม่มีวิชาที่รีวิวได้"}
      </EmptyState>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      <p className="text-caption text-fg-muted">
        วิชาที่เรียนจบเทอมแล้วและยังไม่ได้รีวิว
      </p>
      <ul className="border-border divide-border divide-y rounded-lg border">
        {reviewable.map((course) => (
          <ReviewableRow key={course.courseId} course={course} />
        ))}
      </ul>
    </div>
  );
}

export function ReviewedList({ reviewed }: Pick<MyReviewsData, "reviewed">) {
  if (reviewed === null) return <LoadError />;
  if (reviewed.length === 0) {
    return <EmptyState>ยังไม่ได้รีวิววิชาไหน</EmptyState>;
  }
  return (
    <ul className="border-border divide-border divide-y rounded-lg border">
      {reviewed.map((review) => (
        <ReviewedRow key={review.id} review={review} />
      ))}
    </ul>
  );
}

function ReviewableRow({ course }: { course: ReviewableCourse }) {
  return (
    <li className="flex items-center gap-4 px-4 py-3">
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="text-caption text-fg-muted">{course.courseCode}</p>
        <Link
          href={`/courses/${encodeURIComponent(course.courseCode)}?from=my-reviews`}
          className="text-body text-fg hover:text-accent truncate font-medium"
        >
          {course.nameEn}
        </Link>
        <p className="text-caption text-fg-muted">
          เรียนปี {course.studyYear} ภาคเรียนที่ {course.semester} ·{" "}
          {course.credits} หน่วยกิต
        </p>
      </div>
      <Link
        href={`/courses/${encodeURIComponent(course.courseCode)}?review=write&from=my-reviews`}
        className="border-border-fg bg-bg text-body text-fg hover:bg-hover inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border px-3.5 font-medium transition-colors"
      >
        <SquarePen size={16} aria-hidden />
        เขียนรีวิว
      </Link>
    </li>
  );
}

function ReviewedRow({ review }: { review: MyReview }) {
  const hidden = review.status !== "visible";
  return (
    <li>
      <Link
        href={`/courses/${encodeURIComponent(review.courseCode)}?from=my-reviews`}
        className="hover:bg-hover flex items-center gap-4 px-4 py-3 transition-colors"
      >
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-caption text-fg-muted">
              {review.courseCode}
            </span>
            {hidden && (
              <span className="bg-warning-soft text-caption text-warning inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5">
                <EyeOff size={12} aria-hidden />
                ถูกซ่อน
              </span>
            )}
          </div>
          <p className="text-body text-fg truncate font-medium">
            {review.nameEn}
          </p>
          <div className="text-caption text-fg-muted flex flex-wrap items-center gap-x-3 gap-y-1">
            <DisplayStars value={review.rating} size={14} />
            <span>ความยาก {review.difficulty}/5</span>
            <span>ภาระงาน {review.workload}/5</span>
            {review.writtenAt && <span>รีวิวเมื่อ {review.writtenAt}</span>}
          </div>
        </div>
        <ChevronRight
          size={16}
          className="text-fg-muted shrink-0"
          aria-hidden
        />
      </Link>
    </li>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="border-border bg-surface text-body text-fg-muted rounded-lg border p-6 text-center">
      {children}
    </p>
  );
}

function LoadError() {
  return (
    <p
      role="alert"
      className="bg-error-soft text-caption text-error rounded-md px-3 py-2"
    >
      โหลดข้อมูลไม่สำเร็จ กรุณาโหลดหน้าใหม่
    </p>
  );
}
