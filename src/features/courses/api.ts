import { ApiError, apiGet } from "@/lib/api";
import coursesMock from "@/mocks/courses.json";
import type { Page } from "@/types/common";
import type { CourseDetail, CourseListItem } from "@/types/course";

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

export async function getCourseByCode(
  courseCode: string,
): Promise<CourseDetail | null> {
  const code = courseCode.trim();
  if (!code) return null;

  if (USE_MOCK) {
    const found = (coursesMock as CourseListItem[]).find(
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
