// --- Types สำหรับหน้ารายการแผน (GET /v1/plans, POST /v1/plans) ---
// ตรงกับการ์ด SCRUM-179 / SCRUM-180

export type PlanTrack = {
  id: number;
  nameTh: string;
  nameEn: string;
};

export type PlanCurriculum = {
  id: number;
  name: string;
};

export type PlanSummary = {
  studyPlanId: number;
  planName: string;
  isDefault: boolean;
  /** null = ยังไม่เลือก Track */
  track: PlanTrack | null;
  /** ยังไม่มีใน response ของ BE (SCRUM-179) — ถ้าไม่มีจะไม่แสดงบนการ์ด */
  curriculum?: PlanCurriculum | null;
  /** ISO datetime */
  updatedAt: string;
};

export type PlanListResponse = {
  maxPlans: number;
  plans: PlanSummary[];
};

export type CreatePlanInput = {
  planName: string;
  /** null = ยังไม่เลือก Track */
  trackId: number | null;
};

export type CreatePlanResult =
  | { ok: true; plan: PlanSummary }
  | { ok: false; message: string; field?: "planName" | "trackId" };
