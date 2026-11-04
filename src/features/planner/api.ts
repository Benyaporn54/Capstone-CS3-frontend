import { ApiError, apiGet, apiPost } from "@/lib/api";
import { getTracks } from "@/features/tracks/api";
import plansMock from "@/mocks/plans.json";
import trackOptionsMock from "@/mocks/planTrackOptions.json";
import type {
  CreatePlanInput,
  CreatePlanResult,
  PlanListResponse,
  PlanSummary,
} from "@/types/plan";
import type { TrackListItem } from "@/types/track";

// Plan API (SCRUM-179, SCRUM-180) ยังไม่พร้อม และ FE ยังไม่มี token ส่งให้ BE
// → ใช้ mock เป็นค่าเริ่มต้น ตั้ง USE_MOCK_PLANS=false เมื่อ BE + auth พร้อม
const USE_MOCK =
  process.env.USE_MOCK_API === "true" || process.env.USE_MOCK_PLANS !== "false";

export const PLAN_NAME_MAX_LENGTH = 100;

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

export async function getPlans(): Promise<PlanListResponse> {
  if (USE_MOCK) {
    return { ...mockStore, plans: sortPlans(mockStore.plans) };
  }

  // TODO: แนบ Authorization header เมื่อ auth ส่ง token ให้ BE ได้แล้ว
  const data = await apiGet<PlanListResponse>("/v1/plans", undefined, {
    cache: "no-store",
  });
  return { ...data, plans: sortPlans(data.plans) };
}

export async function createPlan(
  input: CreatePlanInput,
): Promise<CreatePlanResult> {
  if (USE_MOCK) {
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
    // TODO: แนบ Authorization header เมื่อ auth ส่ง token ให้ BE ได้แล้ว
    const plan = await apiPost<PlanSummary>("/v1/plans", input);
    return { ok: true, plan };
  } catch (error) {
    if (error instanceof ApiError && error.status === 409) {
      return { ok: false, message: "สร้างแผนได้ไม่เกิน 5 แผน" };
    }
    if (error instanceof ApiError && error.status === 400) {
      return { ok: false, message: "ข้อมูลไม่ถูกต้อง ตรวจชื่อแผนและ Track" };
    }
    console.error("Failed to create plan:", error);
    return { ok: false, message: "สร้างแผนไม่สำเร็จ ลองใหม่อีกครั้ง" };
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
