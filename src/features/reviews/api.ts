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
  type MyReview,
  type MyReviewStatus,
  type ReviewableCourse,
  type ReviewSort,
} from "@/types/review";

const USE_MOCK = process.env.USE_MOCK_API === "true";

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

function formatThaiDate(iso: string): string {
  const written = new Date(iso);
  return Number.isNaN(written.getTime())
    ? ""
    : written.toLocaleDateString("th-TH", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
}

function toCourseReview(review: ApiReview): CourseReview {
  const displayName = review.displayName?.trim() || "นักศึกษา";
  return {
    id: review.reviewId,
    displayName,
    initials: initialsOf(displayName),
    writtenAt: formatThaiDate(review.createdAt),
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

type ApiMyReview = {
  reviewId: number;
  courseCode: string;
  nameTh: string;
  nameEn: string;
  overallRating: number;
  difficultyRating: number;
  workloadRating: number;
  comment: string | null;
  status: MyReview["status"];
  createdAt: string;
};

const MOCK_REVIEWABLE_COURSES: ReviewableCourse[] = [
  {
    courseId: 12,
    courseCode: "INT102",
    nameTh: "การเขียนโปรแกรมเว็บ",
    nameEn: "Web Programming",
    credits: 3,
    academicYear: 2568,
    studyYear: 2,
    semester: 1,
  },
  {
    courseId: 3,
    courseCode: "GEN101",
    nameTh: "พลานามัย",
    nameEn: "Physical Education",
    credits: 1,
    academicYear: 2567,
    studyYear: 1,
    semester: 2,
  },
];

const MOCK_MY_REVIEWS: MyReview[] = [
  {
    id: 101,
    courseCode: "INT100",
    nameTh: "พื้นฐานเทคโนโลยีสารสนเทศ",
    nameEn: "Information Technology Fundamentals",
    rating: 4,
    difficulty: 2,
    workload: 3,
    comment: "เนื้อหาปูพื้นฐานดี งานไม่หนักมาก",
    status: "visible",
    writtenAt: "8 พ.ย. 2569",
  },
  {
    id: 99,
    courseCode: "LNG220",
    nameTh: "การสื่อสารภาษาอังกฤษเชิงวิชาการ",
    nameEn: "Academic Communication in English",
    rating: 2,
    difficulty: 4,
    workload: 4,
    comment: null,
    status: "hidden",
    writtenAt: "1 พ.ย. 2569",
  },
];

export async function getReviewableCourses(
  token: string,
): Promise<ReviewableCourse[]> {
  if (USE_MOCK) return MOCK_REVIEWABLE_COURSES;

  return apiGet<ReviewableCourse[]>("/v1/me/reviewable-courses", undefined, {
    headers: authHeaders(token),
    cache: "no-store",
  });
}

export async function getMyReviews(token: string): Promise<MyReview[]> {
  if (USE_MOCK) return MOCK_MY_REVIEWS;

  const data = await apiGet<ApiMyReview[]>("/v1/me/reviews", undefined, {
    headers: authHeaders(token),
    cache: "no-store",
  });
  return data.map((review) => ({
    id: review.reviewId,
    courseCode: review.courseCode,
    nameTh: review.nameTh,
    nameEn: review.nameEn,
    rating: review.overallRating,
    difficulty: review.difficultyRating,
    workload: review.workloadRating,
    comment: review.comment,
    status: review.status,
    writtenAt: formatThaiDate(review.createdAt),
  }));
}
