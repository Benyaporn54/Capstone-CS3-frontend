export type ReviewSort = "latest" | "highest" | "lowest";

export type CourseReview = {
  id: number;
  displayName: string;
  initials: string;
  writtenAt: string;
  relativeTime: string;
  rating: number;
  comment: string;
  difficulty: number;
  workload: number;
  verified?: boolean;
};

export type CourseReviewSummary = {
  averageRating: number;
  reviewCount: number;
  /** counts for stars 1–5 */
  ratingCounts: number[];
  averageDifficulty: number;
  averageWorkload: number;
  tags: string[];
};

export type CourseReviewBundle = {
  summary: CourseReviewSummary;
  reviews: CourseReview[];
};
