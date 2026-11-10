"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, Check, Plus, SquarePen } from "lucide-react";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { setCourseSavedAction } from "@/features/saved-courses/actions";
import WriteReviewModal from "@/features/reviews/components/WriteReviewModal";
import type { MyReviewStatus } from "@/types/review";

type CourseDetailActionsProps = {
  courseId: number;
  courseCode: string;
  courseName: string;
  initialSaved: boolean;
  canSave: boolean;
  savedStatusAvailable: boolean;
  /** null = ยังไม่ login หรือโหลดสถานะไม่สำเร็จ (SCRUM-204) */
  reviewStatus: Pick<MyReviewStatus, "canReview" | "reason"> | null;
};

export default function CourseDetailActions({
  courseId,
  courseCode,
  courseName,
  initialSaved,
  canSave,
  savedStatusAvailable,
  reviewStatus,
}: CourseDetailActionsProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [saved, setSaved] = useState(initialSaved);
  const [error, setError] = useState<string | null>(
    savedStatusAvailable
      ? null
      : "โหลดสถานะการบันทึกไม่สำเร็จ กรุณาโหลดหน้าใหม่",
  );
  const [pending, startTransition] = useTransition();
  const [reviewOpen, setReviewOpen] = useState(false);

  const goToLogin = () =>
    router.push(
      `/login?callbackUrl=${encodeURIComponent(`/courses/${courseCode}`)}`,
    );

  const toggleSaved = () => {
    if (!canSave) {
      goToLogin();
      return;
    }
    if (!savedStatusAvailable || pending) return;
    setError(null);
    startTransition(async () => {
      const result = await setCourseSavedAction(courseId, !saved);
      if (result.ok) {
        setSaved(!saved);
        showToast(
          saved
            ? `เอา ${courseCode} ออกจากวิชาที่บันทึกไว้แล้ว`
            : `บันทึก ${courseCode} แล้ว`,
        );
      } else if (result.signIn) {
        goToLogin();
      } else {
        setError(result.message);
      }
    });
  };

  return (
    <div className="flex flex-col items-start gap-2 sm:items-end">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          className="px-2.5"
          aria-label={saved ? "เอาออกจากที่บันทึก" : "บันทึกวิชา"}
          aria-pressed={saved}
          disabled={pending || !savedStatusAvailable}
          onClick={toggleSaved}
        >
          <Bookmark
            size={16}
            className={saved ? "text-accent fill-accent" : undefined}
          />
        </Button>
        {reviewStatus?.reason === "ALREADY_REVIEWED" ? (
          <span className="text-label text-fg-muted inline-flex h-10 items-center gap-1.5 px-2">
            <Check size={16} className="text-success" aria-hidden />
            รีวิวแล้ว
          </span>
        ) : (
          <Button
            type="button"
            variant="secondary"
            className="gap-1.5"
            disabled={canSave && !reviewStatus?.canReview}
            title={
              !canSave
                ? undefined
                : reviewStatus === null
                  ? "โหลดสถานะรีวิวไม่สำเร็จ กรุณาโหลดหน้าใหม่"
                  : reviewStatus.reason === "NOT_ENROLLED"
                    ? "รีวิวได้เฉพาะวิชาที่เคยเรียนจบเทอมแล้ว"
                    : undefined
            }
            onClick={() => (canSave ? setReviewOpen(true) : goToLogin())}
          >
            <SquarePen size={16} />
            เขียนรีวิว
          </Button>
        )}
        <Button
          type="button"
          className="gap-1.5"
          onClick={() => router.push("/planner")}
        >
          <Plus size={16} />
          เพิ่มเข้าแผน
        </Button>
      </div>
      {error && (
        <div className="flex items-center gap-2">
          <p role="alert" className="text-caption text-error">
            {error}
          </p>
          {!savedStatusAvailable && (
            <button
              type="button"
              onClick={() => router.refresh()}
              className="text-caption text-accent hover:text-accent-hover"
            >
              ลองอีกครั้ง
            </button>
          )}
        </div>
      )}
      <WriteReviewModal
        isOpen={reviewOpen}
        courseCode={courseCode}
        courseName={courseName}
        onClose={() => setReviewOpen(false)}
        onSubmitted={() => {
          setReviewOpen(false);
          showToast(`ส่งรีวิว ${courseCode} แล้ว`);
          router.refresh();
        }}
        onSignInRequired={goToLogin}
      />
    </div>
  );
}
