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
  /** BE (PlanDto) ยังไม่ส่ง field นี้ — FE ซ่อนบรรทัดหลักสูตรถ้าไม่มี */
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

/** POST /v1/plans/{id}/courses — เพิ่มวิชาเลือกลงแผน */
export type AddPlanCourseInput = {
  studyPlanId: number;
  courseId: number;
  studyYear: number;
  studySemester: number;
};

export type AddPlanCourseResult =
  | { ok: true; course: PlanCourse; updatedSemester?: PlanSemester }
  | { ok: false; message: string; field?: "courseId" };

// --- ย้าย / เอาวิชาออกจากแผน (SCRUM-172 / SCRUM-173) ---
export type MovePlanCourseInput = {
  studyPlanId: number;
  studyPlanCourseId: number;
  studyYear: number;
  studySemester: number;
};

export type MovePlanCourseResult =
  { ok: true; course: PlanCourse } | { ok: false; message: string };

export type RemovePlanCourseInput = {
  studyPlanId: number;
  studyPlanCourseId: number;
};

export type RemovePlanCourseResult =
  { ok: true } | { ok: false; message: string };

// --- Types สำหรับหน้า Planner View (GET /v1/plans/{id}) ---
// ตรงกับการ์ด SCRUM-168

/** completed = ผ่านไปแล้ว, current = เทอม/ปีปัจจุบัน, upcoming = ยังไม่ถึง */
export type TermStatus = "completed" | "current" | "upcoming";

/** curriculum / track = วิชาบังคับ (ล็อก), user = เพิ่มเอง, registrar = ลงจริงแต่ไม่อยู่ในแผน */
export type PlanCourseSource = "curriculum" | "track" | "user" | "registrar";

/** registered = ลงจริง, withdrawn = W, planned = วางแผนไว้, not_registered = เทอมผ่านแล้วแต่ไม่ได้ลง */
export type PlanCourseStatus =
  "registered" | "withdrawn" | "planned" | "not_registered";

export type PlanCourseCategory = {
  /** code ในตาราง categories เช่น GE, MAJOR_FOUNDATION, FREE_ELECTIVE */
  code: string;
  /** ชื่อหมวด — วิชา source = track ใช้ track.nameEn */
  label: string;
};

export type PlanCourse = {
  courseId: number;
  courseCode: string;
  nameTh: string;
  nameEn: string;
  credits: number;
  source: PlanCourseSource;
  /** true เมื่อ source = curriculum หรือ track → ซ่อนปุ่มย้าย/ลบ */
  locked: boolean;
  category: PlanCourseCategory;
  status: PlanCourseStatus;
  /** มีเฉพาะ source = user (ใช้กับ PATCH/DELETE ใน SCRUM-173) */
  studyPlanCourseId: number | null;
};

export type PlanSemester = {
  semester: number;
  status: TermStatus;
  /** ไม่นับวิชาที่ withdrawn / not_registered */
  totalCredits: number;
  /** สรุปตามหมวดที่ backend คำนวณให้ อาจยังไม่มีใน API รุ่นเก่า */
  itFoundationCredits?: number;
  generalEducationCredits?: number;
  trackCredits?: number;
  projectAndWorkCredits?: number;
  freeElectiveCredits?: number;
  courses: PlanCourse[];
};

export type PlanYear = {
  /** ชั้นปี 1, 2, 3, ... */
  year: number;
  /** ปีการศึกษา พ.ศ. = admissionYear + year - 1 */
  academicYear: number;
  status: TermStatus;
  totalCredits: number;
  semesters: PlanSemester[];
};

export type PlanStudent = {
  studentId: string;
  admissionYear: number;
  currentYear: number;
  currentSemester: number;
};

export type PlanDetail = {
  studyPlanId: number;
  planName: string;
  isDefault: boolean;
  student: PlanStudent;
  curriculum: PlanCurriculum & { totalCredits: number };
  /** null = ยังไม่เลือก Track */
  track: PlanTrack | null;
  years: PlanYear[];
};
