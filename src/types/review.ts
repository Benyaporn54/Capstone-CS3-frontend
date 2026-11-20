export type ReviewSort = "latest" | "highest" | "lowest";

export type CourseReview = {
  id: number;
  displayName: string;
  initials: string;
  /** วันที่เขียน เช่น "8 พ.ย. 2569" */
  writtenAt: string;
  relativeTime: string;
  rating: number;
  comment: string | null;
  difficulty: number;
  workload: number;
};

export type CourseReviewSummary = {
  averageRating: number;
  reviewCount: number;
  /** counts for stars 1–5 */
  ratingCounts: number[];
  averageDifficulty: number;
  averageWorkload: number;
};

/** รีวิว 1 หน้า (GET /v1/courses/{courseCode}/reviews — SCRUM-206) */
export type CourseReviewPage = {
  reviews: CourseReview[];
  page: number;
  totalPages: number;
  totalElements: number;
};

export type CourseReviewBundle = {
  summary: CourseReviewSummary;
  reviews: CourseReviewPage;
};

// --- เขียนรีวิว (SCRUM-203 / SCRUM-204) ---

export type ReviewIneligibleReason = "NOT_ENROLLED" | "ALREADY_REVIEWED";

/** GET /v1/courses/{courseCode}/reviews/me */
export type MyReviewStatus = {
  canReview: boolean;
  reason: ReviewIneligibleReason | null;
  myReview: CourseReview | null;
};

export type CreateReviewInput = {
  overallRating: number;
  difficultyRating: number;
  workloadRating: number;
  comment: string;
};

export type CreateReviewResult =
  { ok: true } | { ok: false; message: string; signIn?: boolean };

export type LoadReviewsResult =
  { ok: true; page: CourseReviewPage } | { ok: false; message: string };

export const REVIEW_COMMENT_MAX_LENGTH = 2000;
export const REVIEW_PAGE_SIZE = 5;

// --- หน้าโปรไฟล์: วิชาที่รีวิวได้ / รีวิวของฉัน (SCRUM-244) ---

/** GET /v1/me/reviewable-courses */
export type ReviewableCourse = {
  courseId: number;
  courseCode: string;
  nameTh: string;
  nameEn: string;
  credits: number;
  academicYear: number;
  studyYear: number;
  semester: number;
};

export type MyReviewStatusValue = "visible" | "hidden";

/** GET /v1/me/reviews */
export type MyReview = {
  id: number;
  courseCode: string;
  nameTh: string;
  nameEn: string;
  rating: number;
  difficulty: number;
  workload: number;
  comment: string | null;
  status: MyReviewStatusValue;
  /** วันที่เขียน เช่น "8 พ.ย. 2569" */
  writtenAt: string;
};
