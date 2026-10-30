import { apiGet } from "@/lib/api";
import coursesMock from "@/mocks/courses.json";
import type { Page } from "@/types/common";
import type { CourseListItem } from "@/types/course";

const USE_MOCK = process.env.USE_MOCK_API === "true";

export const COURSE_PAGE_SIZE = 24;

type GetCoursesParams = {
  /** 0-based, same as the API */
  page: number;
  size?: number;
};

export async function getCourses({
  page,
  size = COURSE_PAGE_SIZE,
}: GetCoursesParams): Promise<Page<CourseListItem>> {
  if (USE_MOCK) {
    return paginateMock(coursesMock as CourseListItem[], page, size);
  }

  return apiGet<Page<CourseListItem>>("/v1/courses", {
    page,
    size,
    sort: "courseCode,asc",
  });
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
