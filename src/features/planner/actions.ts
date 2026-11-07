"use server";

import { revalidatePath } from "next/cache";
import { getCourses } from "@/features/courses/api";
import {
  addCourseToPlan,
  createPlan,
  getPlanDetail,
  PLAN_NAME_MAX_LENGTH,
} from "./api";
import type {
  AddPlanCourseInput,
  AddPlanCourseResult,
  CreatePlanResult,
} from "@/types/plan";

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
