import "server-only";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ApiError, apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api";
import { getTracks } from "@/features/tracks/api";
import coursesMock from "@/mocks/courses.json";
import planDetailsMock from "@/mocks/planDetails.json";
import plansMock from "@/mocks/plans.json";
import trackOptionsMock from "@/mocks/planTrackOptions.json";
import type {
  AddPlanCourseInput,
  AddPlanCourseResult,
  CreatePlanInput,
  CreatePlanResult,
  MovePlanCourseInput,
  MovePlanCourseResult,
  PlanCourse,
  PlanDetail,
  PlanListResponse,
  PlanMutationResult,
  PlanSummary,
  PlanYear,
  RemovePlanCourseInput,
  RemovePlanCourseResult,
} from "@/types/plan";
import type { CourseListItem } from "@/types/course";
import type { TrackListItem } from "@/types/track";
import { countsCredits } from "./utils";

// USE_MOCK_PLANS=true → ใช้ mock ทั้งหมด (รายการแผน, สร้างแผน, รายละเอียดแผน)
// เรียก BE จริงเป็นค่าเริ่มต้น: GET /v1/plans (SCRUM-179) ✓, POST /v1/plans (SCRUM-180),
// GET /v1/plans/{id} (SCRUM-168)
export const USE_MOCK_PLANS =
  process.env.USE_MOCK_API === "true" || process.env.USE_MOCK_PLANS === "true";

export const PLAN_NAME_MAX_LENGTH = 100;

/** session ไม่มี token ของ BE (login ไว้ก่อนมีระบบ token) หรือ token หมดอายุ → ให้ login ใหม่ */
function redirectToLogin(callbackUrl: string): never {
  const params = new URLSearchParams({
    callbackUrl,
    message: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่",
  });
  redirect(`/login?${params}`);
}

/** Authorization header จาก token ที่ BE ออกให้ตอน login (session.backendToken) */
export async function authHeaders(): Promise<HeadersInit> {
  const session = await auth();
  if (!session?.backendToken) {
    throw new ApiError(401, "No backend session token: sign in again");
  }
  return { Authorization: `Bearer ${session.backendToken}` };
}

// ---- mock store (อยู่ใน memory ของ server process, รีเซ็ตเมื่อ restart) ----
const mockStore: PlanListResponse = structuredClone(
  plansMock as PlanListResponse,
);

/** แผนหลักก่อน แล้วตามลำดับที่สร้าง */
function sortPlans(plans: PlanSummary[]): PlanSummary[] {
  return [...plans].sort(
    (a, b) =>
      Number(b.isDefault) - Number(a.isDefault) ||
      a.studyPlanId - b.studyPlanId,
  );
}

/** null = BE ตอบ 404: บัญชีนี้ไม่มีในระบบทะเบียน (เช่น staff หรือรหัสที่ยังไม่มีใน registrar_students) */
export async function getPlans(): Promise<PlanListResponse | null> {
  if (USE_MOCK_PLANS) {
    return { ...mockStore, plans: sortPlans(mockStore.plans) };
  }

  try {
    const data = await apiGet<PlanListResponse>("/v1/plans", undefined, {
      headers: await authHeaders(),
      cache: "no-store",
    });
    return { maxPlans: data.maxPlans ?? 5, plans: sortPlans(data.plans ?? []) };
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirectToLogin("/planner");
    }
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export async function createPlan(
  input: CreatePlanInput,
): Promise<CreatePlanResult> {
  if (USE_MOCK_PLANS) {
    if (mockStore.plans.length >= mockStore.maxPlans) {
      return {
        ok: false,
        message: `สร้างแผนได้ไม่เกิน ${mockStore.maxPlans} แผน`,
      };
    }
    const track =
      input.trackId === null
        ? null
        : (trackOptionsMock as TrackListItem[]).find(
            (t) => t.id === input.trackId,
          );
    if (track === undefined) {
      return { ok: false, field: "trackId", message: "ไม่พบ Track ที่เลือก" };
    }

    const plan: PlanSummary = {
      studyPlanId:
        Math.max(0, ...mockStore.plans.map((p) => p.studyPlanId)) + 1,
      planName: input.planName,
      isDefault: mockStore.plans.length === 0,
      track: track && {
        id: track.id,
        nameTh: track.nameTh,
        nameEn: track.nameEn,
      },
      curriculum: { id: 1, name: "หลักสูตร IT 2567" },
      updatedAt: new Date().toISOString(),
    };
    mockStore.plans.push(plan);
    return { ok: true, plan };
  }

  try {
    const plan = await apiPost<PlanSummary>("/v1/plans", input, {
      headers: await authHeaders(),
    });
    return { ok: true, plan };
  } catch (error) {
    if (error instanceof ApiError && error.status === 409) {
      return { ok: false, message: "สร้างแผนได้ไม่เกิน 5 แผน" };
    }
    if (error instanceof ApiError && error.status === 400) {
      return { ok: false, message: "ข้อมูลไม่ถูกต้อง ตรวจชื่อแผนและ Track" };
    }
    if (error instanceof ApiError && error.status === 401) {
      return { ok: false, message: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่" };
    }
    if (error instanceof ApiError && error.status === 404) {
      return { ok: false, message: "ไม่พบข้อมูลนักศึกษาในระบบทะเบียน" };
    }
    console.error("Failed to create plan:", error);
    return { ok: false, message: "สร้างแผนไม่สำเร็จ ลองใหม่อีกครั้ง" };
  }
}

const planDetailsStore = planDetailsMock as unknown as Record<
  string,
  PlanDetail
>;

/**
 * mock: แผนที่สร้างใหม่ระหว่างทดสอบยังไม่มีรายละเอียดใน planDetails.json
 * → ยืมเทอมที่ผ่านมาจากแผนแรก ตัดวิชาที่เพิ่มเองและวิชา track ออก (เหมือนแผนเปล่า)
 * ไม่มีวิชาของ track ใหม่ เพราะ mock ไม่ได้คำนวณจากหลักสูตรจริง
 */
function mockDetailFromSummary(plan: PlanSummary): PlanDetail {
  const base = structuredClone(Object.values(planDetailsStore)[0]);
  const years = base.years.map((year) => {
    const semesters = year.semesters.map((sem) => {
      const courses = sem.courses.flatMap((c) => {
        if (c.source === "user") return [];
        if (c.source !== "track") return [c];
        // วิชา track ของแผนต้นแบบ: ที่ลงจริงแล้วกลายเป็น "นอกแผน", ที่ยังไม่ลงตัดทิ้ง
        if (c.status === "registered" || c.status === "withdrawn") {
          return [{ ...c, source: "registrar" as const, locked: false }];
        }
        return [];
      });
      const totalCredits = courses
        .filter((c) => c.status === "registered" || c.status === "planned")
        .reduce((sum, c) => sum + c.credits, 0);
      return { ...sem, courses, totalCredits };
    });
    return {
      ...year,
      semesters,
      totalCredits: semesters.reduce((sum, s) => sum + s.totalCredits, 0),
    };
  });
  return {
    ...base,
    studyPlanId: plan.studyPlanId,
    planName: plan.planName,
    isDefault: plan.isDefault,
    track: plan.track,
    years,
  };
}

/** รายละเอียดแผน 1 แผน — คืน null เมื่อไม่พบ / ไม่ใช่แผนของ user นี้ (BE ตอบ 404) */
export async function getPlanDetail(
  planId: number,
): Promise<PlanDetail | null> {
  if (USE_MOCK_PLANS) {
    const summary = mockStore.plans.find((p) => p.studyPlanId === planId);
    if (!summary) return null;
    const detail = planDetailsStore[String(planId)];
    return detail ? structuredClone(detail) : mockDetailFromSummary(summary);
  }

  try {
    return await apiGet<PlanDetail>(`/v1/plans/${planId}`, undefined, {
      headers: await authHeaders(),
      cache: "no-store",
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    if (error instanceof ApiError && error.status === 401) {
      redirectToLogin(`/planner/${planId}`);
    }
    throw error;
  }
}

function planMutationErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    if (error.status === 401) return "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่";
    if (error.status === 404) return "ไม่พบแผนการเรียนนี้";
    return error.backendMessage ?? fallback;
  }
  console.error("Failed to update plan:", error);
  return fallback;
}

/** เปลี่ยนชื่อแผน — PATCH /v1/plans/{id} */
export async function renamePlan(
  planId: number,
  planName: string,
): Promise<PlanMutationResult> {
  if (USE_MOCK_PLANS) {
    const summary = mockStore.plans.find((plan) => plan.studyPlanId === planId);
    if (!summary) return { ok: false, message: "ไม่พบแผนการเรียนนี้" };
    summary.planName = planName;
    const detail = planDetailsStore[String(planId)];
    if (detail) detail.planName = planName;
    return { ok: true };
  }

  try {
    await apiPatch<void>(
      `/v1/plans/${planId}`,
      { planName },
      { headers: await authHeaders() },
    );
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      message: planMutationErrorMessage(
        error,
        "เปลี่ยนชื่อแผนไม่สำเร็จ ลองใหม่อีกครั้ง",
      ),
    };
  }
}

/** ตั้งแผนหลัก — PATCH /v1/plans/{id}/default */
export async function setDefaultPlan(
  planId: number,
): Promise<PlanMutationResult> {
  if (USE_MOCK_PLANS) {
    const selected = mockStore.plans.find(
      (plan) => plan.studyPlanId === planId,
    );
    if (!selected) return { ok: false, message: "ไม่พบแผนการเรียนนี้" };
    for (const plan of mockStore.plans) {
      plan.isDefault = plan.studyPlanId === planId;
      const detail = planDetailsStore[String(plan.studyPlanId)];
      if (detail) detail.isDefault = plan.isDefault;
    }
    return { ok: true };
  }

  try {
    await apiPatch<void>(`/v1/plans/${planId}/default`, undefined, {
      headers: await authHeaders(),
    });
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      message: planMutationErrorMessage(
        error,
        "ตั้งแผนหลักไม่สำเร็จ ลองใหม่อีกครั้ง",
      ),
    };
  }
}

/** ลบแผน — DELETE /v1/plans/{id} */
export async function deletePlan(planId: number): Promise<PlanMutationResult> {
  if (USE_MOCK_PLANS) {
    const index = mockStore.plans.findIndex(
      (plan) => plan.studyPlanId === planId,
    );
    if (index < 0) return { ok: false, message: "ไม่พบแผนการเรียนนี้" };
    const [deleted] = mockStore.plans.splice(index, 1);
    delete planDetailsStore[String(planId)];
    if (deleted.isDefault && mockStore.plans.length > 0) {
      mockStore.plans[0].isDefault = true;
      const detail = planDetailsStore[String(mockStore.plans[0].studyPlanId)];
      if (detail) detail.isDefault = true;
    }
    return { ok: true };
  }

  try {
    await apiDelete(`/v1/plans/${planId}`, {
      headers: await authHeaders(),
    });
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      message: planMutationErrorMessage(
        error,
        "ลบแผนไม่สำเร็จ ลองใหม่อีกครั้ง",
      ),
    };
  }
}

/**
 * ตัวเลือก Track ใน modal สร้างแผน — ดึงจาก GET /v1/tracks (API เดียวกับหน้า Track)
 * ไม่ผูกกับ USE_MOCK_PLANS เพราะ API นี้มีแล้วและไม่ต้อง login
 * ใช้ mock เฉพาะตอน USE_MOCK_API=true หรือเรียก BE ไม่ได้
 */
export async function getTrackOptions(): Promise<TrackListItem[]> {
  if (process.env.USE_MOCK_API !== "true") {
    const tracks = await getTracks();
    if (tracks.length > 0) return tracks;
  }
  return trackOptionsMock as TrackListItem[];
}

function hasCourse(plan: PlanDetail, courseId: number): boolean {
  return plan.years.some((year) =>
    year.semesters.some((semester) =>
      semester.courses.some((course) => course.courseId === courseId),
    ),
  );
}

function addCourseToMockPlan(input: AddPlanCourseInput): AddPlanCourseResult {
  const summary = mockStore.plans.find(
    (plan) => plan.studyPlanId === input.studyPlanId,
  );
  if (!summary) return { ok: false, message: "ไม่พบแผนการเรียนนี้" };

  const plan =
    planDetailsStore[String(input.studyPlanId)] ??
    mockDetailFromSummary(summary);
  planDetailsStore[String(input.studyPlanId)] = plan;

  if (hasCourse(plan, input.courseId)) {
    return {
      ok: false,
      field: "courseId",
      message: "รายวิชานี้อยู่ในแผนการเรียนแล้ว",
    };
  }

  const course = (coursesMock as CourseListItem[]).find(
    (item) => item.id === input.courseId && item.isActive,
  );
  if (!course) return { ok: false, message: "ไม่พบรายวิชาที่เลือก" };

  let year = plan.years.find((item) => item.year === input.studyYear);
  if (!year) {
    year = {
      year: input.studyYear,
      academicYear: plan.student.admissionYear + input.studyYear - 1,
      status: "upcoming",
      totalCredits: 0,
      semesters: [1, 2].map((semester) => ({
        semester,
        status: "upcoming",
        totalCredits: 0,
        courses: [],
      })),
    };
    plan.years.push(year);
    plan.years.sort((a, b) => a.year - b.year);
  }

  const semester = year.semesters.find(
    (item) => item.semester === input.studySemester,
  );
  if (!semester) return { ok: false, message: "ไม่พบภาคเรียนที่เลือก" };

  const existingIds = plan.years.flatMap((item) =>
    item.semesters.flatMap((term) =>
      term.courses.flatMap((itemCourse) =>
        itemCourse.studyPlanCourseId === null
          ? []
          : [itemCourse.studyPlanCourseId],
      ),
    ),
  );
  const category = course.categories[0];
  const addedCourse: PlanCourse = {
    courseId: course.id,
    courseCode: course.courseCode,
    nameTh: course.nameTh,
    nameEn: course.nameEn,
    credits: course.credits,
    source: "user",
    locked: false,
    category: {
      code: category?.code ?? "ELECTIVE",
      label: category?.nameTh ?? "วิชาเลือก",
    },
    status: "planned",
    studyPlanCourseId: Math.max(0, ...existingIds) + 1,
  };
  semester.courses.push(addedCourse);
  semester.totalCredits += course.credits;
  year.totalCredits += course.credits;
  summary.updatedAt = new Date().toISOString();
  return { ok: true, course: addedCourse };
}

/** เพิ่มวิชาเลือกลงแผน — BE ตรวจ ownership จาก token ซ้ำอีกชั้น */
export async function addCourseToPlan(
  input: AddPlanCourseInput,
): Promise<AddPlanCourseResult> {
  if (USE_MOCK_PLANS) return addCourseToMockPlan(input);

  try {
    const { studyPlanId, ...body } = input;
    const course = await apiPost<PlanCourse>(
      `/v1/plans/${studyPlanId}/courses`,
      body,
      {
        headers: await authHeaders(),
      },
    );
    return { ok: true, course };
  } catch (error) {
    if (error instanceof ApiError && error.status === 409) {
      return {
        ok: false,
        field: "courseId",
        message: error.backendMessage ?? "รายวิชานี้อยู่ในแผนการเรียนแล้ว",
      };
    }
    if (error instanceof ApiError && error.status === 400) {
      return {
        ok: false,
        message: error.backendMessage ?? "ข้อมูลรายวิชาหรือภาคเรียนไม่ถูกต้อง",
      };
    }
    if (error instanceof ApiError && error.status === 401) {
      return { ok: false, message: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่" };
    }
    if (error instanceof ApiError && error.status === 404) {
      return { ok: false, message: "ไม่พบแผนการเรียนหรือรายวิชาที่เลือก" };
    }
    console.error("Failed to add course to plan:", error);
    return { ok: false, message: "เพิ่มรายวิชาไม่สำเร็จ ลองใหม่อีกครั้ง" };
  }
}

// ---------- ย้าย / เอาวิชาออกจากแผน (SCRUM-172 FE, SCRUM-173 BE) ----------

/** ลำดับเทอมแบบนับต่อกัน ใช้เทียบว่าเทอมผ่านแล้ว / ปัจจุบัน / ยังไม่ถึง */
function termIndex(year: number, semester: number): number {
  return (year - 1) * 2 + semester;
}

function isUpcomingTerm(plan: PlanDetail, year: number, semester: number) {
  const { currentYear, currentSemester } = plan.student;
  return termIndex(year, semester) > termIndex(currentYear, currentSemester);
}

function findUserCourse(plan: PlanDetail, studyPlanCourseId: number) {
  for (const year of plan.years) {
    for (const semester of year.semesters) {
      const index = semester.courses.findIndex(
        (course) => course.studyPlanCourseId === studyPlanCourseId,
      );
      if (index >= 0) {
        return { year, semester, index, course: semester.courses[index] };
      }
    }
  }
  return null;
}

function ensureMockYear(plan: PlanDetail, studyYear: number): PlanYear {
  let year = plan.years.find((item) => item.year === studyYear);
  if (!year) {
    year = {
      year: studyYear,
      academicYear: plan.student.admissionYear + studyYear - 1,
      status: "upcoming",
      totalCredits: 0,
      semesters: [1, 2].map((semester) => ({
        semester,
        status: "upcoming",
        totalCredits: 0,
        courses: [],
      })),
    };
    plan.years.push(year);
    plan.years.sort((a, b) => a.year - b.year);
  }
  return year;
}

function getMockPlanForEdit(studyPlanId: number): PlanDetail | null {
  const summary = mockStore.plans.find(
    (plan) => plan.studyPlanId === studyPlanId,
  );
  if (!summary) return null;
  const plan =
    planDetailsStore[String(studyPlanId)] ?? mockDetailFromSummary(summary);
  planDetailsStore[String(studyPlanId)] = plan;
  summary.updatedAt = new Date().toISOString();
  return plan;
}

function moveCourseInMockPlan(
  input: MovePlanCourseInput,
): MovePlanCourseResult {
  const plan = getMockPlanForEdit(input.studyPlanId);
  if (!plan) return { ok: false, message: "ไม่พบแผนการเรียน" };
  const found = findUserCourse(plan, input.studyPlanCourseId);
  if (!found) return { ok: false, message: "ไม่พบวิชานี้ในแผน" };

  const { year, semester, index, course } = found;
  if (!isUpcomingTerm(plan, year.year, semester.semester)) {
    return {
      ok: false,
      message: "ย้ายได้เฉพาะวิชาในภาคเรียนที่ยังไม่ถึง",
    };
  }
  if (!isUpcomingTerm(plan, input.studyYear, input.studySemester)) {
    return { ok: false, message: "ย้ายได้เฉพาะไปภาคเรียนที่ยังไม่ถึง" };
  }
  if (
    year.year === input.studyYear &&
    semester.semester === input.studySemester
  ) {
    return { ok: false, message: "วิชานี้อยู่ภาคเรียนนี้อยู่แล้ว" };
  }

  const targetYear = ensureMockYear(plan, input.studyYear);
  const target = targetYear.semesters.find(
    (item) => item.semester === input.studySemester,
  );
  if (!target) return { ok: false, message: "ไม่พบภาคเรียนที่เลือก" };
  if (target.courses.some((item) => item.courseId === course.courseId)) {
    return { ok: false, message: "มีวิชานี้ในภาคเรียนที่เลือกแล้ว" };
  }

  semester.courses.splice(index, 1);
  target.courses.push(course);
  if (countsCredits(course)) {
    semester.totalCredits -= course.credits;
    year.totalCredits -= course.credits;
    target.totalCredits += course.credits;
    targetYear.totalCredits += course.credits;
  }
  return { ok: true, course };
}

function removeCourseFromMockPlan(
  input: RemovePlanCourseInput,
): RemovePlanCourseResult {
  const plan = getMockPlanForEdit(input.studyPlanId);
  if (!plan) return { ok: false, message: "ไม่พบแผนการเรียน" };
  const found = findUserCourse(plan, input.studyPlanCourseId);
  if (!found) return { ok: false, message: "ไม่พบวิชานี้ในแผน" };

  const { year, semester, index, course } = found;
  semester.courses.splice(index, 1);
  if (countsCredits(course)) {
    semester.totalCredits -= course.credits;
    year.totalCredits -= course.credits;
  }
  return { ok: true };
}

/** แปลง error ของ BE เป็นข้อความที่แสดงใน modal (BE ส่ง message ภาษาไทยมาให้แล้ว) */
function planCourseErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    if (error.status === 401) return "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่";
    if (error.backendMessage) return error.backendMessage;
    if (error.status === 404) return "ไม่พบวิชานี้ในแผน";
  }
  return fallback;
}

/** ย้ายวิชาที่เพิ่มเองไปภาคเรียนอื่น — PATCH /v1/plans/{id}/courses/{studyPlanCourseId} */
export async function moveCourseInPlan(
  input: MovePlanCourseInput,
): Promise<MovePlanCourseResult> {
  if (USE_MOCK_PLANS) return moveCourseInMockPlan(input);

  try {
    const { studyPlanId, studyPlanCourseId, ...body } = input;
    const course = await apiPatch<PlanCourse>(
      `/v1/plans/${studyPlanId}/courses/${studyPlanCourseId}`,
      body,
      { headers: await authHeaders() },
    );
    return { ok: true, course };
  } catch (error) {
    if (!(error instanceof ApiError)) {
      console.error("Failed to move course:", error);
    }
    return {
      ok: false,
      message: planCourseErrorMessage(
        error,
        "ย้ายวิชาไม่สำเร็จ ลองใหม่อีกครั้ง",
      ),
    };
  }
}

/** เอาวิชาที่เพิ่มเองออกจากแผน — DELETE /v1/plans/{id}/courses/{studyPlanCourseId} */
export async function removeCourseFromPlan(
  input: RemovePlanCourseInput,
): Promise<RemovePlanCourseResult> {
  if (USE_MOCK_PLANS) return removeCourseFromMockPlan(input);

  try {
    await apiDelete(
      `/v1/plans/${input.studyPlanId}/courses/${input.studyPlanCourseId}`,
      { headers: await authHeaders() },
    );
    return { ok: true };
  } catch (error) {
    if (!(error instanceof ApiError)) {
      console.error("Failed to remove course:", error);
    }
    return {
      ok: false,
      message: planCourseErrorMessage(
        error,
        "เอาวิชาออกไม่สำเร็จ ลองใหม่อีกครั้ง",
      ),
    };
  }
}
