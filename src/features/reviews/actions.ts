"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { ApiError } from "@/lib/api";
import {
  REVIEW_COMMENT_MAX_LENGTH,
  type CreateReviewInput,
  type CreateReviewResult,
  type LoadReviewsResult,
  type ReviewSort,
} from "@/types/review";
import { createReview, getCourseReviews } from "./api";

const SORTS: ReviewSort[] = ["latest", "highest", "lowest"];
const COURSE_CODE = /^[A-Za-z0-9]{2,20}$/;

/** ดึงรีวิวหน้าถัดไป / เปลี่ยนการเรียง (public) */
export async function loadReviewsAction(
  courseCode: string,
  page: number,
  sort: ReviewSort,
): Promise<LoadReviewsResult> {
  if (
    !COURSE_CODE.test(courseCode) ||
    !Number.isInteger(page) ||
    page < 0 ||
    !SORTS.includes(sort)
  ) {
    return { ok: false, message: "ข้อมูลไม่ถูกต้อง" };
  }
  try {
    const { reviews } = await getCourseReviews(courseCode, { page, sort });
    return { ok: true, page: reviews };
  } catch (error) {
    console.error("Failed to load reviews:", error);
    return { ok: false, message: "โหลดรีวิวไม่สำเร็จ ลองอีกครั้ง" };
  }
}

function isRating(value: unknown): value is number {
  return (
    Number.isInteger(value) && (value as number) >= 1 && (value as number) <= 5
  );
}

/** SCRUM-204: ส่งรีวิว (เขียนแล้วแก้/ลบไม่ได้) */
export async function createReviewAction(
  courseCode: string,
  input: CreateReviewInput,
): Promise<CreateReviewResult> {
  if (
    !COURSE_CODE.test(courseCode) ||
    !isRating(input.overallRating) ||
    !isRating(input.difficultyRating) ||
    !isRating(input.workloadRating) ||
    typeof input.comment !== "string" ||
    input.comment.trim().length > REVIEW_COMMENT_MAX_LENGTH
  ) {
    return { ok: false, message: "กรุณาให้คะแนนครบทั้ง 3 ด้าน" };
  }

  const token = (await auth())?.backendToken;
  if (!token) {
    return {
      ok: false,
      message: "กรุณาเข้าสู่ระบบก่อนเขียนรีวิว",
      signIn: true,
    };
  }

  try {
    await createReview(token, courseCode, input);
    revalidatePath("/courses/[courseCode]", "page");
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
        return { ok: false, message: "คุณรีวิววิชานี้ไปแล้ว" };
      }
      if (error.status === 403) {
        return {
          ok: false,
          message: "รีวิวได้เฉพาะวิชาที่เคยเรียนจบเทอมแล้ว",
        };
      }
      if (error.status === 400 || error.status === 404) {
        return {
          ok: false,
          message: error.backendMessage ?? "ส่งรีวิวไม่สำเร็จ",
        };
      }
    }
    console.error("Failed to create review:", error);
    return { ok: false, message: "ส่งรีวิวไม่สำเร็จ ลองอีกครั้ง" };
  }
}
