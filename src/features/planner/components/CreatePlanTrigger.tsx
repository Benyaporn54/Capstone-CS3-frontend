"use client";

import { useCallback, useState } from "react";
import { Lock, Plus } from "lucide-react";
import Button from "@/components/ui/Button";
import type { TrackListItem } from "@/types/track";
import CreatePlanModal from "./CreatePlanModal";

type CreatePlanTriggerProps = {
  variant: "button" | "bar";
  planCount: number;
  maxPlans: number;
  trackOptions: TrackListItem[];
};

/** ปุ่ม "+ สร้างแผนใหม่" (หัวหน้า) หรือแถบเส้นประท้ายรายการ — เปิด modal สร้างแผน */
export default function CreatePlanTrigger({
  variant,
  planCount,
  maxPlans,
  trackOptions,
}: CreatePlanTriggerProps) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const remaining = Math.max(0, maxPlans - planCount);
  const isFull = remaining === 0;

  // mount เฉพาะตอนเปิด → ฟอร์มเริ่มใหม่ทุกครั้ง
  const modal = open && (
    <CreatePlanModal
      isOpen
      onClose={close}
      remaining={remaining}
      maxPlans={maxPlans}
      trackOptions={trackOptions}
      // TODO (SCRUM-169): พาไปหน้า Planner ของแผนใหม่ router.push(`/planner/${id}`)
    />
  );

  if (variant === "button") {
    return (
      <>
        <Button
          onClick={() => setOpen(true)}
          disabled={isFull}
          className="h-11 gap-1.5 sm:h-9"
        >
          <Plus size={16} aria-hidden />
          สร้างแผนใหม่
        </Button>
        {modal}
      </>
    );
  }

  if (isFull) {
    return (
      <div className="border-border bg-surface text-body text-fg-muted flex h-14 items-center justify-center gap-2 rounded-lg border border-dashed">
        <Lock size={14} aria-hidden />
        สร้างได้สูงสุด {maxPlans} แผน
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="border-border-strong/60 text-body text-fg-muted hover:border-accent hover:bg-accent-soft hover:text-accent focus-visible:ring-accent flex h-14 w-full items-center justify-center gap-2 rounded-lg border border-dashed transition-colors focus-visible:ring-2 focus-visible:outline-none"
      >
        <Plus size={16} aria-hidden />
        สร้างแผนใหม่
        <span className="text-caption">· สร้างได้อีก {remaining} แผน</span>
      </button>
      {modal}
    </>
  );
}
