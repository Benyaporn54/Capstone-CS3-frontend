import "server-only";

import { apiGet, apiPut } from "@/lib/api";
import type { GradeEnrollment, GradeValue, SavedGrade } from "@/types/grade";

const enrollmentsPath = "/v1/grades/enrollments";
const gradesPath = "/v1/grades";

function headers(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

export function getGradeEnrollments(token: string): Promise<GradeEnrollment[]> {
  return apiGet<GradeEnrollment[]>(enrollmentsPath, undefined, {
    headers: headers(token),
    cache: "no-store",
  });
}

export function saveGrade(
  token: string,
  enrollmentId: number,
  grade: GradeValue,
): Promise<SavedGrade> {
  return apiPut<SavedGrade>(
    gradesPath,
    { enrollmentId, grade },
    { headers: headers(token) },
  );
}
