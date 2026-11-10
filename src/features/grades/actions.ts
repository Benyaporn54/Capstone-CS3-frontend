"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { ApiError } from "@/lib/api";
import { GRADE_VALUES, type GradeValue, type SavedGrade } from "@/types/grade";
import { saveGrade } from "./api";

export type SaveGradeResult =
  | { ok: true; grade: SavedGrade }
  | { ok: false; message: string; signIn?: boolean };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isGradeValue(value: unknown): value is GradeValue {
  return (
    typeof value === "string" &&
    GRADE_VALUES.some((supportedGrade) => supportedGrade === value)
  );
}

export async function saveGradeAction(input: unknown): Promise<SaveGradeResult> {
  if (!isRecord(input)) {
    return { ok: false, message: "ข้อมูลเกรดไม่ถูกต้อง" };
  }

  const { enrollmentId, grade } = input;
  if (
    typeof enrollmentId !== "number" ||
    !Number.isInteger(enrollmentId) ||
    enrollmentId <= 0 ||
    !isGradeValue(grade)
  ) {
    return { ok: false, message: "กรุณาเลือกรายวิชาและเกรดให้ถูกต้อง" };
  }

  const token = (await auth())?.backendToken;
  if (!token) {
    return {
      ok: false,
      message: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่",
      signIn: true,
    };
  }

  try {
    const savedGrade = await saveGrade(token, enrollmentId, grade);
    revalidatePath("/planner/[planId]", "page");
    return { ok: true, grade: savedGrade };
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 401) {
        return {
          ok: false,
          message: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่",
          signIn: true,
        };
      }
      if (error.status === 403) {
        return { ok: false, message: "คุณไม่มีสิทธิ์บันทึกเกรดรายการนี้" };
      }
      if (error.status === 404) {
        return {
          ok: false,
          message: error.backendMessage ?? "ไม่พบรายการลงทะเบียนเรียนนี้",
        };
      }
      if (error.status === 400) {
        return {
          ok: false,
          message: error.backendMessage ?? "เกรดไม่ถูกต้อง กรุณาเลือกเกรดใหม่",
        };
      }
      if (error.status === 409) {
        return {
          ok: false,
          message:
            error.backendMessage ??
            "บันทึกเกรดได้เฉพาะรายวิชาที่มีสถานะลงทะเบียนแล้ว",
        };
      }

      console.error("Failed to save grade:", error);
      return {
        ok: false,
        message: error.backendMessage ?? "บันทึกเกรดไม่สำเร็จ กรุณาลองอีกครั้ง",
      };
    }

    console.error("Failed to save grade:", error);
    return { ok: false, message: "บันทึกเกรดไม่สำเร็จ กรุณาลองอีกครั้ง" };
  }
}
