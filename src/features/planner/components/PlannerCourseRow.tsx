import { Check, Lock } from "lucide-react";
import type { PlanCourse, TermStatus } from "@/types/plan";

type PlannerCourseRowProps = {
  course: PlanCourse;
  semesterStatus: TermStatus;
};

type Tag = { label: string; className: string; title?: string };

/**
 * สถานะทางขวาของแถว (ตาม Figma planIT/CourseRow)
 * W / ไม่ได้ลง / นอกแผน / เพิ่มเอง — วิชาที่ลงแล้วในเทอมที่ผ่านแสดงเป็นเครื่องหมายถูก
 * เทอมปัจจุบันไม่ใส่ป้าย เพราะหัวการ์ดบอก "กำลังเรียน" อยู่แล้ว
 */
function getTag(course: PlanCourse): Tag | null {
  if (course.status === "withdrawn") {
    return {
      label: "W",
      title: "ถอนรายวิชา (W)",
      className: "bg-warning-soft text-warning",
    };
  }
  if (course.status === "not_registered") {
    return {
      label: "ไม่ได้ลงทะเบียน",
      title: "วางแผนไว้แต่ไม่ได้ลงทะเบียนจริงในเทอมนี้",
      className: "bg-error-soft text-error",
    };
  }
  if (course.source === "registrar") {
    return {
      label: "นอกแผน",
      title: "ลงทะเบียนจริงแต่ไม่ได้อยู่ในแผนนี้",
      className: "bg-warning-soft text-warning",
    };
  }
  if (course.source === "user" && course.status === "planned") {
    return { label: "เพิ่มเอง", className: "bg-hover text-fg-muted" };
  }
  return null;
}

export default function PlannerCourseRow({
  course,
  semesterStatus,
}: PlannerCourseRowProps) {
  const tag = getTag(course);
  const isInactive =
    course.status === "withdrawn" || course.status === "not_registered";
  const isDone =
    course.status === "registered" && semesterStatus === "completed" && !tag;
  // ล็อกเฉพาะวิชาบังคับที่ยังไม่ได้เรียน — ตรงนี้คือที่ปุ่มย้าย/ลบจะอยู่ (SCRUM-173)
  const showLock = course.locked && course.status === "planned";

  return (
    <li className="border-border flex items-center gap-3 border-b px-4 py-2.5 last:border-b-0">
      <div className="min-w-0 flex-1">
        <p
          title={course.nameEn}
          className={`text-body truncate ${
            isInactive ? "text-fg-muted" : "text-fg"
          } ${course.status === "withdrawn" ? "line-through" : ""}`}
        >
          {course.nameTh}
        </p>
        <p className="text-caption text-fg-muted flex min-w-0 items-center gap-1.5">
          <span className="text-fg font-medium">{course.courseCode}</span>
          <span aria-hidden>·</span>
          <span className="shrink-0">{course.credits} หน่วยกิต</span>
          <span aria-hidden>·</span>
          <span
            className={`truncate ${
              course.source === "track" ? "text-accent font-medium" : ""
            }`}
          >
            {course.category.label}
          </span>
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {tag && (
          <span
            title={tag.title}
            className={`text-caption rounded-sm px-2 py-0.5 font-medium ${tag.className}`}
          >
            {tag.label}
          </span>
        )}
        {isDone && (
          <Check
            size={16}
            className="text-success"
            aria-label="ลงทะเบียนแล้ว"
          />
        )}
        {showLock && (
          <span
            title={
              course.source === "track"
                ? "วิชาบังคับของ Track ลบออกจากแผนไม่ได้"
                : "วิชาบังคับตามหลักสูตร ลบออกจากแผนไม่ได้"
            }
            className="text-fg-muted"
          >
            <Lock size={14} aria-label="วิชาบังคับ" />
          </span>
        )}
        {/* TODO (SCRUM-173): source = user → ปุ่มย้ายเทอม / ลบ ใช้ studyPlanCourseId */}
      </div>
    </li>
  );
}
