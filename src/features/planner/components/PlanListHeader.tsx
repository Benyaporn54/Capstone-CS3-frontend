import type { ReactNode } from "react";

type PlanListHeaderProps = {
  /** ตัวนับ + ปุ่มสร้างแผน (หรือ skeleton ตอนโหลด) */
  actions?: ReactNode;
};

export default function PlanListHeader({ actions }: PlanListHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex max-w-2xl flex-col gap-2">
        <h1 className="text-h1 text-fg">แผนการเรียนของฉัน</h1>
        <p className="text-body text-fg-muted">
          ลองวางได้หลายแบบ เช่น แยกตาม Track ที่สนใจ
          แล้วเลือกเปิดแผนที่ต้องการดู
        </p>
      </div>
      {actions}
    </div>
  );
}
