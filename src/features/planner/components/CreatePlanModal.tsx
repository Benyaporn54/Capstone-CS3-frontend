"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Info, Loader2, X } from "lucide-react";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import type { TrackListItem } from "@/types/track";
import { createPlanAction } from "../actions";
import TrackSelect from "./TrackSelect";

type CreatePlanModalProps = {
  isOpen: boolean;
  onClose: () => void;
  remaining: number;
  maxPlans: number;
  trackOptions: TrackListItem[];
  onCreated?: (studyPlanId: number) => void;
};

export default function CreatePlanModal({
  isOpen,
  onClose,
  remaining,
  maxPlans,
  trackOptions,
  onCreated,
}: CreatePlanModalProps) {
  const [planName, setPlanName] = useState("");
  const [trackId, setTrackId] = useState<number | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const nameRef = useRef<HTMLInputElement>(null);

  // state เริ่มใหม่ทุกครั้งที่เปิด เพราะ CreatePlanTrigger mount modal ใหม่ตอนเปิด
  // effect นี้แค่โฟกัสช่องชื่อ + ล็อก scroll หน้าหลัง
  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(() => nameRef.current?.focus(), 0);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(t);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !pending) onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, pending, onClose]);

  if (!isOpen) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pending) return;
    if (!planName.trim()) {
      setNameError("กรุณาตั้งชื่อแผน");
      nameRef.current?.focus();
      return;
    }
    setFormError(null);
    startTransition(async () => {
      const result = await createPlanAction({ planName, trackId });
      if (result.ok) {
        onCreated?.(result.plan.studyPlanId);
        onClose();
      } else if (result.field === "planName") {
        setNameError(result.message);
      } else {
        setFormError(result.message);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:items-center">
      <div
        className="fixed inset-0 bg-black/40"
        onClick={() => !pending && onClose()}
        aria-hidden
      />

      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-plan-title"
        onSubmit={submit}
        noValidate
        className="border-border bg-bg shadow-pop relative z-10 my-8 w-full max-w-[480px] rounded-lg border"
      >
        {/* Header */}
        <div className="border-border flex items-start justify-between gap-4 border-b px-6 pt-5 pb-4">
          <div className="flex flex-col gap-0.5">
            <h2 id="create-plan-title" className="text-h3 text-fg">
              สร้างแผนใหม่
            </h2>
            <p className="text-caption text-fg-muted">
              สร้างได้อีก {remaining} แผน (สูงสุด {maxPlans} แผน)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            aria-label="ปิด"
            className="text-fg-muted hover:bg-hover hover:text-fg focus-visible:ring-accent -mr-2 rounded-md p-1.5 transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-5 px-6 py-5">
          <TextField
            ref={nameRef}
            label="ชื่อแผน"
            placeholder="เช่น แผนหลัก, ลองสาย UX/UI"
            value={planName}
            maxLength={100}
            disabled={pending}
            errorMessage={nameError ?? undefined}
            onChange={(e) => {
              setPlanName(e.target.value);
              if (nameError) setNameError(null);
            }}
          />

          <TrackSelect
            label="Track"
            tracks={trackOptions}
            value={trackId}
            onChange={setTrackId}
            disabled={pending}
            helperText="วิชาบังคับของหลักสูตรและของ Track จะถูกใส่ในแผนให้อัตโนมัติ"
          />

          <div className="border-border bg-surface text-caption text-fg-muted flex items-start gap-2 rounded-md border px-3 py-2.5">
            <Info size={14} className="mt-0.5 shrink-0" aria-hidden />
            แผนใหม่เริ่มจากแผนว่าง ไม่คัดลอกวิชาเลือกจากแผนอื่น
          </div>

          {formError && (
            <p
              role="alert"
              className="bg-error-soft text-caption text-error rounded-md px-3 py-2"
            >
              {formError}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="border-border flex justify-end gap-2 border-t px-6 py-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={pending}
          >
            ยกเลิก
          </Button>
          <Button
            type="submit"
            disabled={pending}
            className={pending ? "gap-2 disabled:opacity-100" : "gap-2"}
          >
            {pending && (
              <Loader2 size={16} className="animate-spin" aria-hidden />
            )}
            {pending ? "กำลังสร้าง…" : "สร้างแผน"}
          </Button>
        </div>
      </form>
    </div>
  );
}
