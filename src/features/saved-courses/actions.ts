"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { ApiError } from "@/lib/api";
import { removeSavedCourse, saveCourse } from "./api";

export type SavedCourseActionResult =
  { ok: true } | { ok: false; message: string; signIn?: boolean };

export async function setCourseSavedAction(
  courseId: number,
  saved: boolean,
): Promise<SavedCourseActionResult> {
  if (
    !Number.isInteger(courseId) ||
    courseId <= 0 ||
    typeof saved !== "boolean"
  ) {
    return { ok: false, message: "ข้อมูลรายวิชาไม่ถูกต้อง" };
  }

  const token = (await auth())?.backendToken;
  if (!token) {
    return {
      ok: false,
      message: "กรุณาเข้าสู่ระบบก่อนบันทึกวิชา",
      signIn: true,
    };
  }

  try {
    if (saved) await saveCourse(token, courseId);
    else await removeSavedCourse(token, courseId);
    revalidatePath("/courses/[courseCode]", "page");
    revalidatePath("/planner/[planId]", "page");
    return { ok: true };
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 401) {
        return {
          ok: false,
          message: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่",
          signIn: true,
        };
      }
      if (error.status === 409) {
        return {
          ok: false,
          message: "วิชานี้ถูกบันทึกไว้แล้ว กรุณาโหลดหน้าใหม่",
        };
      }
      if (error.status === 404) {
        return {
          ok: false,
          message: error.backendMessage ?? "ไม่พบรายวิชาหรือรายการที่บันทึกไว้",
        };
      }
    }
    console.error("Failed to update saved course:", error);
    return { ok: false, message: "เปลี่ยนสถานะการบันทึกไม่สำเร็จ ลองอีกครั้ง" };
  }
}
