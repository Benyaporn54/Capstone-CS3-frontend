import reviewsMock from "@/mocks/reviews.json";
import type { CourseReviewBundle, ReviewSort } from "@/types/review";

const EMPTY_BUNDLE: CourseReviewBundle = {
  summary: {
    averageRating: 0,
    reviewCount: 0,
    ratingCounts: [0, 0, 0, 0, 0],
    averageDifficulty: 0,
    averageWorkload: 0,
    tags: [],
  },
  reviews: [],
};

const bundles = reviewsMock as Record<string, CourseReviewBundle>;

/** Reviews API is not ready yet — serve mock data for the course detail page. */
export function getCourseReviews(
  courseCode: string,
  sort: ReviewSort = "latest",
): CourseReviewBundle {
  const bundle = bundles[courseCode.toUpperCase()] ?? EMPTY_BUNDLE;
  const reviews = [...bundle.reviews];

  if (sort === "highest") {
    reviews.sort((a, b) => b.rating - a.rating || b.id - a.id);
  } else if (sort === "lowest") {
    reviews.sort((a, b) => a.rating - b.rating || b.id - a.id);
  } else {
    reviews.sort((a, b) => b.id - a.id);
  }

  return { ...bundle, reviews };
}
