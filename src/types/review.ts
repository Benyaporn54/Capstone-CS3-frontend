export type ReviewSort = "latest" | "highest" | "lowest";

export type CourseReview = {
  id: number;
  displayName: string;
  initials: string;
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
  ratingCounts: number[];
  averageDifficulty: number;
  averageWorkload: number;
};

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

export type ReviewIneligibleReason = "NOT_ENROLLED" | "ALREADY_REVIEWED";

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
  writtenAt: string;
};
