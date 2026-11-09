import "server-only";

import { apiDelete, apiGet, apiPost } from "@/lib/api";
import type { CourseListItem } from "@/types/course";

const path = "/v1/saved-courses";

function headers(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

export function getSavedCourses(token: string): Promise<CourseListItem[]> {
  return apiGet<CourseListItem[]>(path, undefined, {
    headers: headers(token),
    cache: "no-store",
  });
}

export function saveCourse(
  token: string,
  courseId: number,
): Promise<CourseListItem> {
  return apiPost<CourseListItem>(`${path}/${courseId}`, undefined, {
    headers: headers(token),
  });
}

export function removeSavedCourse(
  token: string,
  courseId: number,
): Promise<void> {
  return apiDelete(`${path}/${courseId}`, { headers: headers(token) });
}
