import "server-only";

import { apiGet, apiPost } from "@/lib/api";
import { formatRelativeTime } from "@/features/planner/utils";
import reviewsMock from "@/mocks/reviews.json";
import {
  REVIEW_PAGE_SIZE,
  type CourseReview,
  type CourseReviewBundle,
  type CourseReviewPage,
  type CreateReviewInput,
  type MyReviewStatus,
  type ReviewSort,
} from "@/types/review";

// USE_MOCK_API=true → ใช้ mock (src/mocks/reviews.json) แทน BE
const USE_MOCK = process.env.USE_MOCK_API === "true";

// ---- รูปแบบที่ BE ส่งมา (SCRUM-206 / SCRUM-203) ----
type ApiReview = {
  reviewId: number;
  displayName: string | null;
  overallRating: number;
  difficultyRating: number;
  workloadRating: number;
  comment: string | null;
  createdAt: string;
};

type ApiCourseReviews = {
  summary: CourseReviewBundle["summary"];
  reviews: {
    content: ApiReview[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
};

type ApiMyReviewStatus = {
  canReview: boolean;
  reason: MyReviewStatus["reason"];
  myReview: ApiReview | null;
};

/** "Staru" → "ST", "นักศึกษา ปี 3" → "น3" */
function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return words
      .slice(0, 2)
      .map((word) => Array.from(word)[0])
      .join("")
      .toUpperCase();
  }
  return Array.from(words[0] ?? "?")
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function toCourseReview(review: ApiReview): CourseReview {
  const displayName = review.displayName?.trim() || "นักศึกษา";
  const written = new Date(review.createdAt);
  return {
    id: review.reviewId,
    displayName,
    initials: initialsOf(displayName),
    writtenAt: Number.isNaN(written.getTime())
      ? ""
      : written.toLocaleDateString("th-TH", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
    relativeTime: formatRelativeTime(review.createdAt),
    rating: review.overallRating,
    comment: review.comment,
    difficulty: review.difficultyRating,
    workload: review.workloadRating,
  };
}

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

// ---- mock ----
type MockBundle = {
  summary: CourseReviewBundle["summary"];
  reviews: CourseReview[];
};
const mockBundles = reviewsMock as unknown as Record<string, MockBundle>;

function mockCourseReviews(
  courseCode: string,
  page: number,
  sort: ReviewSort,
): CourseReviewBundle {
  const bundle = mockBundles[courseCode.toUpperCase()];
  const all = [...(bundle?.reviews ?? [])];
  if (sort === "highest")
    all.sort((a, b) => b.rating - a.rating || b.id - a.id);
  else if (sort === "lowest")
    all.sort((a, b) => a.rating - b.rating || b.id - a.id);
  else all.sort((a, b) => b.id - a.id);

  const start = page * REVIEW_PAGE_SIZE;
  return {
    summary: bundle?.summary ?? {
      averageRating: 0,
      reviewCount: 0,
      ratingCounts: [0, 0, 0, 0, 0],
      averageDifficulty: 0,
      averageWorkload: 0,
    },
    reviews: {
      reviews: all.slice(start, start + REVIEW_PAGE_SIZE),
      page,
      totalPages: Math.ceil(all.length / REVIEW_PAGE_SIZE),
      totalElements: all.length,
    },
  };
}

/** GET /v1/courses/{courseCode}/reviews — public (SCRUM-206) */
export async function getCourseReviews(
  courseCode: string,
  { page = 0, sort = "latest" }: { page?: number; sort?: ReviewSort } = {},
): Promise<CourseReviewBundle> {
  if (USE_MOCK) return mockCourseReviews(courseCode, page, sort);

  const data = await apiGet<ApiCourseReviews>(
    `/v1/courses/${encodeURIComponent(courseCode)}/reviews`,
    { page, size: REVIEW_PAGE_SIZE, sort },
    { cache: "no-store" },
  );
  const reviews: CourseReviewPage = {
    reviews: data.reviews.content.map(toCourseReview),
    page: data.reviews.page,
    totalPages: data.reviews.totalPages,
    totalElements: data.reviews.totalElements,
  };
  return { summary: data.summary, reviews };
}

/** GET /v1/courses/{courseCode}/reviews/me — ต้อง login (SCRUM-203) */
export async function getMyReviewStatus(
  token: string,
  courseCode: string,
): Promise<MyReviewStatus> {
  if (USE_MOCK) return { canReview: true, reason: null, myReview: null };

  const data = await apiGet<ApiMyReviewStatus>(
    `/v1/courses/${encodeURIComponent(courseCode)}/reviews/me`,
    undefined,
    { headers: authHeaders(token), cache: "no-store" },
  );
  return {
    canReview: data.canReview,
    reason: data.reason,
    myReview: data.myReview ? toCourseReview(data.myReview) : null,
  };
}

/** POST /v1/courses/{courseCode}/reviews — ต้อง login (SCRUM-203) */
export async function createReview(
  token: string,
  courseCode: string,
  input: CreateReviewInput,
): Promise<void> {
  if (USE_MOCK) return;

  await apiPost<ApiReview>(
    `/v1/courses/${encodeURIComponent(courseCode)}/reviews`,
    {
      overallRating: input.overallRating,
      difficultyRating: input.difficultyRating,
      workloadRating: input.workloadRating,
      comment: input.comment.trim() || null,
    },
    { headers: authHeaders(token) },
  );
}
