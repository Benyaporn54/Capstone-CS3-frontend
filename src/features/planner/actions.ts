"use server";

import { revalidatePath } from "next/cache";
import { getCourses } from "@/features/courses/api";
import {
  addCourseToPlan,
  createPlan,
  getPlanDetail,
  moveCourseInPlan,
  PLAN_NAME_MAX_LENGTH,
  removeCourseFromPlan,
} from "./api";
import type {
  AddPlanCourseInput,
  AddPlanCourseResult,
  CreatePlanResult,
  MovePlanCourseInput,
  MovePlanCourseResult,
  RemovePlanCourseInput,
  RemovePlanCourseResult,
  RemovePlanYearInput,
  RemovePlanYearResult,
} from "@/types/plan";
import { isRemovableYear } from "./utils";

export async function createPlanAction(input: {
  planName: string;
  trackId: number | null;
}): Promise<CreatePlanResult> {
  const planName = input.planName.trim();

  if (!planName) {
    return { ok: false, field: "planName", message: "กรุณาตั้งชื่อแผน" };
  }
  if (planName.length > PLAN_NAME_MAX_LENGTH) {
    return {
      ok: false,
      field: "planName",
      message: `ชื่อแผนยาวได้ไม่เกิน ${PLAN_NAME_MAX_LENGTH} ตัวอักษร`,
    };
  }

  const result = await createPlan({ planName, trackId: input.trackId });
  if (result.ok) revalidatePath("/planner");
  return result;
}

export async function addCourseToPlanAction(
  input: AddPlanCourseInput,
): Promise<AddPlanCourseResult> {
  if (
    !Number.isInteger(input.studyPlanId) ||
    input.studyPlanId <= 0 ||
    !Number.isInteger(input.courseId) ||
    input.courseId <= 0 ||
    !Number.isInteger(input.studyYear) ||
    input.studyYear < 1 ||
    input.studyYear > 8 ||
    ![1, 2].includes(input.studySemester)
  ) {
    return { ok: false, message: "ข้อมูลรายวิชาหรือภาคเรียนไม่ถูกต้อง" };
  }

  const plan = await getPlanDetail(input.studyPlanId);
  if (!plan) return { ok: false, message: "ไม่พบแผนการเรียนนี้" };

  const duplicate = plan.years.some((year) =>
    year.semesters.some((semester) =>
      semester.courses.some((course) => course.courseId === input.courseId),
    ),
  );
  if (duplicate) {
    return {
      ok: false,
      field: "courseId",
      message: "รายวิชานี้อยู่ในแผนการเรียนแล้ว",
    };
  }

  const result = await addCourseToPlan(input);
  if (result.ok) {
    revalidatePath(`/planner/${input.studyPlanId}`);
    revalidatePath("/planner");
    try {
      const updatedPlan = await getPlanDetail(input.studyPlanId);
      const updatedSemester = updatedPlan?.years
        .find((year) => year.year === input.studyYear)
        ?.semesters.find(
          (semester) => semester.semester === input.studySemester,
        );
      if (
        updatedSemester?.courses.some(
          (course) => course.courseId === input.courseId,
        )
      ) {
        return { ...result, updatedSemester };
      }
    } catch (error) {
      console.error("Failed to refresh plan after adding course:", error);
    }
  }
  return result;
}

export async function searchCoursesAction(q: string, page: number) {
  if (!Number.isInteger(page) || page < 0) throw new Error("Invalid page");
  return getCourses({ q, page, size: 10 });
}

function isPositiveInt(value: number): boolean {
  return Number.isInteger(value) && value > 0;
}

export async function moveCourseAction(
  input: MovePlanCourseInput,
): Promise<MovePlanCourseResult> {
  if (
    !isPositiveInt(input.studyPlanId) ||
    !isPositiveInt(input.studyPlanCourseId) ||
    !Number.isInteger(input.studyYear) ||
    input.studyYear < 1 ||
    input.studyYear > 8 ||
    ![1, 2].includes(input.studySemester)
  ) {
    return { ok: false, message: "ข้อมูลภาคเรียนไม่ถูกต้อง" };
  }

  const result = await moveCourseInPlan(input);
  if (result.ok) {
    revalidatePath(`/planner/${input.studyPlanId}`);
    revalidatePath("/planner");
  }
  return result;
}

export async function removeCourseAction(
  input: RemovePlanCourseInput,
): Promise<RemovePlanCourseResult> {
  if (
    !isPositiveInt(input.studyPlanId) ||
    !isPositiveInt(input.studyPlanCourseId)
  ) {
    return { ok: false, message: "ไม่พบวิชานี้ในแผน" };
  }

  const result = await removeCourseFromPlan(input);
  if (result.ok) {
    revalidatePath(`/planner/${input.studyPlanId}`);
    revalidatePath("/planner");
  }
  return result;
}

/**
 * SCRUM-209: ลบปีการศึกษาที่เพิ่มเอง = เอาวิชาทุกตัวในปีนั้นออกจากแผน
 * (ปีไม่ได้เก็บใน DB — ไม่มีวิชาเหลือ ปีก็หายไปเอง)
 */
export async function removeYearAction(
  input: RemovePlanYearInput,
): Promise<RemovePlanYearResult> {
  if (!isPositiveInt(input.studyPlanId) || !isPositiveInt(input.studyYear)) {
    return { ok: false, message: "ข้อมูลปีการศึกษาไม่ถูกต้อง" };
  }

  const plan = await getPlanDetail(input.studyPlanId);
  if (!plan) return { ok: false, message: "ไม่พบแผนการเรียนนี้" };

  const year = plan.years.find((item) => item.year === input.studyYear);
  // ปีที่ยังไม่มีวิชา (เพิ่มไว้แค่ฝั่ง FE) ไม่ต้องเรียก API
  if (!year) return { ok: true, removedCourseIds: [] };

  const lastYear = Math.max(...plan.years.map((item) => item.year));
  if (year.year !== lastYear || !isRemovableYear(year)) {
    return { ok: false, message: "ลบได้เฉพาะปีสุดท้ายที่เพิ่มเอง" };
  }

  const courses = year.semesters.flatMap((semester) => semester.courses);
  const removedCourseIds: number[] = [];
  let failed = false;
  for (const course of courses) {
    const result = await removeCourseFromPlan({
      studyPlanId: input.studyPlanId,
      studyPlanCourseId: course.studyPlanCourseId!,
    });
    if (!result.ok) {
      failed = true;
      break;
    }
    removedCourseIds.push(course.courseId);
  }

  if (removedCourseIds.length > 0) {
    revalidatePath(`/planner/${input.studyPlanId}`);
    revalidatePath("/planner");
  }
  if (failed) {
    return {
      ok: false,
      message: `ลบปี ${year.year} ไม่สำเร็จ (เอาออกแล้ว ${removedCourseIds.length} จาก ${courses.length} วิชา) ลองใหม่อีกครั้ง`,
    };
  }
  return { ok: true, removedCourseIds };
}
