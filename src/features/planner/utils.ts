import type {
  PlanCourse,
  PlanSemester,
  PlanYear,
  TermStatus,
} from "@/types/plan";

/** หลักสูตร 4 ปี — ปีที่ 5 ขึ้นไปคือปีที่นักศึกษาเพิ่มเอง */
export const STANDARD_YEARS = 4;

const UNITS: { limit: number; divisor: number; label: string }[] = [
  { limit: 60, divisor: 1, label: "นาที" },
  { limit: 60 * 24, divisor: 60, label: "ชั่วโมง" },
  { limit: 60 * 24 * 7, divisor: 60 * 24, label: "วัน" },
  { limit: 60 * 24 * 30, divisor: 60 * 24 * 7, label: "สัปดาห์" },
  { limit: 60 * 24 * 365, divisor: 60 * 24 * 30, label: "เดือน" },
  { limit: Infinity, divisor: 60 * 24 * 365, label: "ปี" },
];

/** "2 ชั่วโมงที่แล้ว", "3 วันที่แล้ว" — ต่ำกว่า 1 นาที = "เมื่อสักครู่" */
export function formatRelativeTime(
  iso: string,
  now: Date = new Date(),
): string {
  const minutes = Math.floor((now.getTime() - new Date(iso).getTime()) / 60000);
  if (!Number.isFinite(minutes) || minutes < 1) return "เมื่อสักครู่";

  const unit = UNITS.find((u) => minutes < u.limit) ?? UNITS[UNITS.length - 1];
  return `${Math.floor(minutes / unit.divisor)} ${unit.label}ที่แล้ว`;
}

// ---- Planner View ----

/** หน่วยกิตสุทธิไม่นับวิชาถอนและวิชาที่ไม่ได้ลงทะเบียน */
export function countsCredits(course: PlanCourse): boolean {
  return course.status === "registered" || course.status === "planned";
}

export function sumCourseCredits(courses: PlanCourse[]): number {
  return courses.reduce(
    (total, course) => total + (countsCredits(course) ? course.credits : 0),
    0,
  );
}

export function semesterCredits(semester: PlanSemester): number {
  return sumCourseCredits(semester.courses);
}

export function yearCredits(year: PlanYear): number {
  return year.semesters.reduce(
    (total, semester) => total + semesterCredits(semester),
    0,
  );
}

/** จำนวนวิชาที่ทะเบียนจริงไม่ตรงแผน: ลงนอกแผน + วางแผนไว้แต่ไม่ได้ลง */
export function countMismatch(semester: PlanSemester): number {
  return semester.courses.filter(
    (c) => c.source === "registrar" || c.status === "not_registered",
  ).length;
}

export function yearHasMismatch(year: PlanYear): boolean {
  return year.semesters.some((s) => countMismatch(s) > 0);
}

export const SEMESTER_STATUS_LABEL: Partial<Record<TermStatus, string>> = {
  completed: "ผ่านแล้ว",
  current: "กำลังเรียน",
};

export function yearAnchorId(year: number): string {
  return `year-${year}`;
}

/**
 * SCRUM-209: ลบปีได้เมื่อเป็นปีที่เพิ่มเอง (ปี 5 ขึ้นไป) ยังไม่ถึง
 * และมีแต่วิชาที่นักศึกษาเพิ่มเอง (ไม่มีวิชาบังคับ/วิชาที่ลงทะเบียนจริง)
 * การบังคับให้ลบได้เฉพาะปีสุดท้าย (เลขปีต่อเนื่อง) ทำที่ผู้เรียกใช้
 */
export function isRemovableYear(year: PlanYear): boolean {
  return (
    year.year > STANDARD_YEARS &&
    year.status === "upcoming" &&
    year.semesters.every((semester) =>
      semester.courses.every(
        (course) =>
          course.source === "user" && course.studyPlanCourseId !== null,
      ),
    )
  );
}
