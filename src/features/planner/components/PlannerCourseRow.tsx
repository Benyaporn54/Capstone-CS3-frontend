"use client";

import { useEffect, useRef } from "react";
import { ArrowRight, Check, Info, Lock, Trash2 } from "lucide-react";
import ActionMenu, { type ActionMenuItem } from "@/components/ui/ActionMenu";
import type { PlanCourse, TermStatus } from "@/types/plan";

/** ตำแหน่งของวิชาในแผน (ชั้นปี + ภาคเรียน) */
export type CourseLocation = { year: number; semester: number };

export type CourseAction = "move" | "remove";

type PlannerCourseRowProps = {
  course: PlanCourse;
  semesterStatus: TermStatus;
  /** SCRUM-172: เมนู ⋯ ของวิชาที่เพิ่มเอง */
  onAction?: (action: CourseAction, course: PlanCourse) => void;
  /** ไฮไลต์แวบหนึ่งหลังย้ายมาเทอมนี้ */
  highlighted?: boolean;
};

/** ตัวเลือกในเมนู ⋯ — ตามการ์ด SCRUM-172 */
function getMenuItems(
  course: PlanCourse,
  semesterStatus: TermStatus,
  onAction: (action: CourseAction, course: PlanCourse) => void,
): ActionMenuItem[] {
  const items: ActionMenuItem[] = [];
  if (semesterStatus === "upcoming" && course.status === "planned") {
    items.push({
      key: "move",
      label: "ย้ายไปภาคเรียนอื่น",
      icon: <ArrowRight size={16} aria-hidden />,
      onSelect: () => onAction("move", course),
    });
  }
  items.push({
    key: "detail",
    label: "ดูรายละเอียดและรีวิว",
    icon: <Info size={16} aria-hidden />,
    href: `/courses/${encodeURIComponent(course.courseCode)}`,
  });
  if (course.status === "planned" || course.status === "not_registered") {
    items.push({
      key: "remove",
      label: "เอาออกจากแผน",
      icon: <Trash2 size={16} aria-hidden />,
      danger: true,
      separatorBefore: true,
      onSelect: () => onAction("remove", course),
    });
  }
  return items;
}

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
  onAction,
  highlighted = false,
}: PlannerCourseRowProps) {
  const rowRef = useRef<HTMLLIElement>(null);
  const tag = getTag(course);
  const isInactive =
    course.status === "withdrawn" || course.status === "not_registered";
  const isDone =
    course.status === "registered" && semesterStatus === "completed" && !tag;
  // ล็อกเฉพาะวิชาบังคับที่ยังไม่ได้เรียน (ไม่มีเมนูย้าย/ลบ)
  const showLock = course.locked && course.status === "planned";
  const hasMenu =
    onAction !== undefined &&
    course.source === "user" &&
    course.studyPlanCourseId !== null;

  // เลื่อนให้เห็นแถวที่เพิ่งย้ายมา
  useEffect(() => {
    if (highlighted) {
      rowRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlighted]);

  return (
    <li
      ref={rowRef}
      className={`border-border flex items-center gap-3 border-b px-4 py-2.5 transition-colors duration-700 last:border-b-0 ${
        highlighted ? "bg-accent-soft" : ""
      }`}
    >
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
        {hasMenu && (
          <ActionMenu
            label={`จัดการวิชา ${course.courseCode}`}
            items={getMenuItems(course, semesterStatus, onAction)}
          />
        )}
      </div>
    </li>
  );
}
