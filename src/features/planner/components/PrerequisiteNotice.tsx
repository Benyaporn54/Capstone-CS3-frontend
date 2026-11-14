import { AlertTriangle, Info } from "lucide-react";
import type { PlanCourse } from "@/types/plan";

export default function PrerequisiteNotice({
  course,
}: {
  course: PlanCourse;
}) {
  const missingGroups = course.missingGroups ?? [];
  const hasMissingPrerequisites = course.isEligible === false;
  const note = course.prerequisiteNote?.trim();

  if (!hasMissingPrerequisites && !note) return null;

  return (
    <div className="mt-2 flex flex-col gap-2">
      {hasMissingPrerequisites && (
        <div
          role="status"
          className="bg-error-soft text-caption text-error rounded-md px-2.5 py-2"
        >
          <p className="flex items-start gap-1.5 font-medium">
            <AlertTriangle
              size={14}
              aria-hidden
              className="mt-0.5 shrink-0"
            />
            <span>ยังขาดวิชาบังคับก่อนหน้า</span>
          </p>
          {missingGroups.length > 0 ? (
            <ol className="mt-1.5 flex flex-col gap-1 pl-5">
              {missingGroups.map((group, index) => (
                <li key={group.groupNo}>
                  {index > 0 && <span className="font-medium">และ </span>}
                  <span className="font-medium">
                    กลุ่ม {group.groupNo}:
                  </span>{" "}
                  {group.courses.length > 0 ? (
                    group.courses.map((prerequisite, courseIndex) => (
                      <span key={prerequisite.courseId}>
                        {courseIndex > 0 && " หรือ "}
                        {prerequisite.isCorequisite
                          ? "เรียนร่วม "
                          : "ต้องผ่าน "}
                        <span
                          className="font-medium"
                          title={`${prerequisite.nameTh} (${prerequisite.nameEn})`}
                        >
                          {prerequisite.courseCode}
                        </span>
                      </span>
                    ))
                  ) : (
                    <span>ระบบไม่ได้ระบุรายวิชาในกลุ่มนี้</span>
                  )}
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-1 pl-5">
              ระบบแจ้งว่ายังไม่ผ่านเงื่อนไข แต่ไม่ได้ระบุรายวิชาที่ต้องเรียนก่อน
            </p>
          )}
          {missingGroups.length > 1 && (
            <p className="mt-1 pl-5">ต้องทำให้ครบทุกกลุ่ม</p>
          )}
        </div>
      )}

      {note && (
        <p className="bg-accent-soft text-caption text-fg flex items-start gap-1.5 rounded-md px-2.5 py-2">
          <Info size={14} aria-hidden className="mt-0.5 shrink-0" />
          <span>{note}</span>
        </p>
      )}
    </div>
  );
}
