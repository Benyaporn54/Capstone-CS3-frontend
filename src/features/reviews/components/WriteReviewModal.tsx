"use client";

import { useEffect, useState, useTransition } from "react";
import { Info, Loader2, X } from "lucide-react";
import Button from "@/components/ui/Button";
import StarRating from "@/components/ui/StarRating";
import TextArea from "@/components/ui/TextArea";
import { REVIEW_COMMENT_MAX_LENGTH } from "@/types/review";
import { createReviewAction } from "../actions";

type WriteReviewModalProps = {
  isOpen: boolean;
  courseCode: string;
  courseName: string;
  onClose: () => void;
  onSubmitted: () => void;
  /** session หมดอายุ → ให้ผู้เรียกพาไปหน้า login */
  onSignInRequired: () => void;
};

type Ratings = {
  overallRating: number;
  difficultyRating: number;
  workloadRating: number;
};

const EMPTY_RATINGS: Ratings = {
  overallRating: 0,
  difficultyRating: 0,
  workloadRating: 0,
};

/** SCRUM-204: ฟอร์มเขียนรีวิว — ดาว 3 ด้าน (บังคับ) + ความคิดเห็น (ไม่บังคับ) */
export default function WriteReviewModal({
  isOpen,
  courseCode,
  courseName,
  onClose,
  onSubmitted,
  onSignInRequired,
}: WriteReviewModalProps) {
  const [ratings, setRatings] = useState<Ratings>(EMPTY_RATINGS);
  const [comment, setComment] = useState("");
  const [showRatingErrors, setShowRatingErrors] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // ล็อกการเลื่อนหน้าข้างหลังระหว่างเปิด
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !pending) onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, pending, onClose]);

  if (!isOpen) return null;

  const commentLength = comment.trim().length;
  const commentTooLong = commentLength > REVIEW_COMMENT_MAX_LENGTH;
  const missing = (value: number) =>
    showRatingErrors && value === 0 ? "กรุณาให้คะแนน" : undefined;

  const setRating = (field: keyof Ratings) => (value: number) =>
    setRatings((current) => ({ ...current, [field]: value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pending) return;
    const complete = Object.values(ratings).every((value) => value > 0);
    if (!complete) {
      setShowRatingErrors(true);
      return;
    }
    if (commentTooLong) return;

    setFormError(null);
    startTransition(async () => {
      const result = await createReviewAction(courseCode, {
        ...ratings,
        comment,
      });
      if (result.ok) {
        setRatings(EMPTY_RATINGS);
        setComment("");
        setShowRatingErrors(false);
        onSubmitted();
      } else if (result.signIn) {
        onSignInRequired();
      } else {
        setFormError(result.message);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:items-center">
      <div
        className="fixed inset-0 bg-black/40"
        onClick={() => !pending && onClose()}
        aria-hidden
      />

      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="write-review-title"
        onSubmit={submit}
        noValidate
        className="border-border bg-bg shadow-pop relative z-10 my-8 w-full max-w-[480px] rounded-lg border"
      >
        {/* Header */}
        <div className="border-border flex items-start justify-between gap-4 border-b px-6 pt-5 pb-4">
          <div className="flex flex-col gap-0.5">
            <h2 id="write-review-title" className="text-h3 text-fg">
              เขียนรีวิว
            </h2>
            <p className="text-caption text-fg-muted">
              {courseCode} · {courseName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            aria-label="ปิด"
            className="text-fg-muted hover:bg-hover hover:text-fg focus-visible:ring-accent -mr-2 rounded-md p-1.5 transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-5 px-6 py-5">
          <StarRating
            label="คะแนนรวม"
            value={ratings.overallRating}
            onChange={setRating("overallRating")}
            disabled={pending}
            errorMessage={missing(ratings.overallRating)}
          />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <StarRating
              label="ความยาก"
              value={ratings.difficultyRating}
              onChange={setRating("difficultyRating")}
              disabled={pending}
              helperText="1 = ง่าย · 5 = ยากมาก"
              errorMessage={missing(ratings.difficultyRating)}
            />
            <StarRating
              label="ปริมาณงาน"
              value={ratings.workloadRating}
              onChange={setRating("workloadRating")}
              disabled={pending}
              helperText="1 = น้อย · 5 = เยอะมาก"
              errorMessage={missing(ratings.workloadRating)}
            />
          </div>

          <TextArea
            label="ความคิดเห็น (ไม่บังคับ)"
            placeholder="เนื้อหา การสอบ งานที่ต้องส่ง หรือคำแนะนำสำหรับรุ่นน้อง"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={pending}
            rows={5}
            errorMessage={
              commentTooLong
                ? `ยาวได้ไม่เกิน ${REVIEW_COMMENT_MAX_LENGTH} ตัวอักษร`
                : undefined
            }
            helperText={`${commentLength}/${REVIEW_COMMENT_MAX_LENGTH}`}
          />

          <p className="bg-surface text-caption text-fg-muted flex items-start gap-2 rounded-md p-3">
            <Info size={14} className="mt-0.5 shrink-0" aria-hidden />
            ส่งแล้วแก้ไขหรือลบไม่ได้ รีวิวที่วิจารณ์ผู้สอนหรือไม่สุภาพอาจถูกซ่อน
          </p>

          {formError && (
            <p role="alert" className="text-caption text-error">
              {formError}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="border-border flex justify-end gap-2 border-t px-6 py-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={pending}
          >
            ยกเลิก
          </Button>
          <Button
            type="submit"
            disabled={pending || commentTooLong}
            className="gap-1.5"
          >
            {pending && <Loader2 size={16} className="animate-spin" />}
            {pending ? "กำลังส่ง…" : "ส่งรีวิว"}
          </Button>
        </div>
      </form>
    </div>
  );
}
