import { ApiError, apiGet } from "@/lib/api";
import coursesMock from "@/mocks/courses.json";
import reviewsMock from "@/mocks/reviews.json";
import type { Page } from "@/types/common";
import type {
  CourseCategory,
  CourseDetail,
  CourseListItem,
} from "@/types/course";

const USE_MOCK = process.env.USE_MOCK_API === "true";

export const COURSE_PAGE_SIZE = 24;

type MockCourse = Omit<CourseListItem, "averageRating" | "reviewCount"> &
  Partial<Pick<CourseListItem, "averageRating" | "reviewCount">>;
type MockCourseSummary = Pick<CourseListItem, "averageRating" | "reviewCount">;

const mockReviewSummaries = reviewsMock as Record<
  string,
  { summary: MockCourseSummary }
>;
const mockCourses: CourseListItem[] = (coursesMock as MockCourse[]).map(
  (course) => {
    const summary =
      mockReviewSummaries[course.courseCode.toUpperCase()]?.summary;
    return {
      ...course,
      averageRating: course.averageRating ?? summary?.averageRating ?? 0,
      reviewCount: course.reviewCount ?? summary?.reviewCount ?? 0,
    };
  },
);

type GetCoursesParams = {
  /** 0-based, same as the API */
  page: number;
  size?: number;
  q?: string;
  categories?: string[];
};

export async function getCourses({
  page,
  size = COURSE_PAGE_SIZE,
  q,
  categories = [],
}: GetCoursesParams): Promise<Page<CourseListItem>> {
  if (USE_MOCK) {
    const keyword = q?.trim().toLocaleLowerCase() ?? "";
    const courses = mockCourses.filter(
      (course) =>
        [course.courseCode, course.nameTh, course.nameEn].some((value) =>
          value.toLocaleLowerCase().includes(keyword),
        ) &&
        (categories.length === 0 ||
          course.categories.some((category) =>
            categories.includes(category.code),
          )),
    );
    return paginateMock(courses, page, size);
  }

  return apiGet<Page<CourseListItem>>("/v1/courses", {
    page,
    size,
    q: q?.trim() || undefined,
    category: categories.length > 0 ? categories.join(",") : undefined,
    sort: "courseCode,asc",
  });
}

export async function getCategories(): Promise<CourseCategory[]> {
  if (USE_MOCK) {
    return Array.from(
      new Map(
        mockCourses
          .flatMap((course) => course.categories)
          .map((category) => [category.code, category]),
      ).values(),
    );
  }
  return apiGet<CourseCategory[]>("/v1/categories");
}

export async function getCourseByCode(
  courseCode: string,
): Promise<CourseDetail | null> {
  const code = courseCode.trim();
  if (!code) return null;

  if (USE_MOCK) {
    const found = mockCourses.find(
      (course) => course.courseCode.toUpperCase() === code.toUpperCase(),
    );
    if (!found) return null;
    return {
      ...found,
      descriptionTh: found.nameTh,
      descriptionEn: found.nameEn,
    };
  }

  try {
    return await apiGet<CourseDetail>(
      `/v1/courses/${encodeURIComponent(code)}`,
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

function paginateMock<T>(items: T[], page: number, size: number): Page<T> {
  return {
    content: items.slice(page * size, (page + 1) * size),
    page,
    size,
    totalElements: items.length,
    totalPages: Math.ceil(items.length / size),
  };
}
