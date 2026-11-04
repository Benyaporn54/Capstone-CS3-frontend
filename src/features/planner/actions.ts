"use server";

import { revalidatePath } from "next/cache";
import { createPlan, PLAN_NAME_MAX_LENGTH } from "./api";
import type { CreatePlanResult } from "@/types/plan";

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
