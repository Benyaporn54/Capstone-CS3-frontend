"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Pencil, Star, Trash2, X } from "lucide-react";
import Button from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import TextField from "@/components/ui/TextField";
import type { PlanDetail } from "@/types/plan";
import {
  deletePlanAction,
  renamePlanAction,
  setDefaultPlanAction,
} from "../actions";
import DefaultPlanBadge from "./DefaultPlanBadge";
import PlanTrackChip from "./PlanTrackChip";

type PlannerHeaderProps = {
  plan: PlanDetail;
  isOnlyDefaultPlan: boolean;
};

export function PlannerBackLink() {
  return (
    <Link
      href="/planner"
      className="text-label text-fg-muted hover:text-fg inline-flex w-fit items-center gap-1.5 transition-colors"
    >
      <ArrowLeft size={16} aria-hidden />
      แผนการเรียนของฉัน
    </Link>
  );
}

export default function PlannerHeader({
  plan,
  isOnlyDefaultPlan,
}: PlannerHeaderProps) {
  const { currentYear, currentSemester } = plan.student;
  const [planName, setPlanName] = useState(plan.planName);
  const isDefault = plan.isDefault;
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [renameError, setRenameError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<
    "rename" | "default" | "delete" | null
  >(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const rename = (newPlanName: string) => {
    setRenameError(null);
    setPendingAction("rename");
    startTransition(async () => {
      const result = await renamePlanAction({
        studyPlanId: plan.studyPlanId,
        planName: newPlanName,
      });
      if (result.ok) {
        setPlanName(newPlanName.trim());
        setRenameOpen(false);
        router.refresh();
      } else {
        setRenameError(result.message);
      }
      setPendingAction(null);
    });
  };

  const makeDefault = () => {
    if (isDefault || pending) return;
    setActionError(null);
    setPendingAction("default");
    startTransition(async () => {
      const result = await setDefaultPlanAction(plan.studyPlanId);
      if (result.ok) {
        router.refresh();
      } else {
        setActionError(result.message);
      }
      setPendingAction(null);
    });
  };

  const removePlan = () => {
    if (pending) return;
    setActionError(null);
    setPendingAction("delete");
    startTransition(async () => {
      const result = await deletePlanAction(plan.studyPlanId);
      if (!result.ok) {
        setActionError(result.message);
      }
      setPendingAction(null);
    });
  };

  return (
    <header className="flex flex-col gap-4">
      <PlannerBackLink />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-h1 text-fg break-words">{planName}</h1>
            {isDefault && <DefaultPlanBadge />}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <PlanTrackChip track={plan.track} />
            <p className="text-body text-fg-muted">
              {plan.curriculum.name} · กำลังเรียนปี {currentYear} ภาคเรียนที่{" "}
              {currentSemester}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 sm:justify-end">
          <Button
            variant="secondary"
            disabled={pending}
            onClick={() => {
              setRenameError(null);
              setRenameOpen(true);
            }}
            className="gap-1.5"
          >
            <Pencil size={14} aria-hidden />
            เปลี่ยนชื่อ
          </Button>
          <Button
            variant={isDefault ? "secondary" : "ghost"}
            disabled={pending || isDefault}
            onClick={makeDefault}
            className="gap-1.5"
          >
            {pendingAction === "default" ? (
              <Loader2 size={14} className="animate-spin" aria-hidden />
            ) : (
              <Star size={14} aria-hidden />
            )}
            {isDefault
              ? "แผนหลักปัจจุบัน"
              : pendingAction === "default"
                ? "กำลังตั้งแผนหลัก…"
                : "ตั้งเป็นแผนหลัก"}
          </Button>
          <Button
            variant="danger-light"
            disabled={pending || isOnlyDefaultPlan}
            onClick={() => {
              setActionError(null);
              setDeleteOpen(true);
            }}
            className="gap-1.5"
          >
            <Trash2 size={14} aria-hidden />
            ลบแผน
          </Button>
        </div>
      </div>
      {isOnlyDefaultPlan && (
        <p role="status" className="text-caption text-warning">
          ไม่สามารถลบแผนหลักที่เป็นแผนเดียวในระบบได้
        </p>
      )}
      {actionError && !deleteOpen && (
        <p
          role="alert"
          className="bg-error-soft text-caption text-error rounded-md px-3 py-2"
        >
          {actionError}
        </p>
      )}
      {renameOpen && (
        <RenamePlanModal
          planName={planName}
          error={renameError}
          pending={pending}
          onClose={() => {
            if (!pending) setRenameOpen(false);
          }}
          onSubmit={rename}
        />
      )}
      <Modal
        isOpen={deleteOpen}
        onClose={() => {
          if (!pending) {
            setDeleteOpen(false);
            setActionError(null);
          }
        }}
        type="danger"
        title="ยืนยันการลบแผน"
        description={
          <>
            ต้องการลบแผน <strong className="text-fg">{planName}</strong>{" "}
            ใช่หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้
          </>
        }
        confirmLabel="ลบแผน"
        loadingLabel="กำลังลบ…"
        onConfirm={removePlan}
        showCancel
        closeOnConfirm={false}
        loading={pending}
        errorMessage={actionError}
      />
    </header>
  );
}

type RenamePlanModalProps = {
  planName: string;
  error: string | null;
  pending: boolean;
  onClose: () => void;
  onSubmit: (planName: string) => void;
};

function RenamePlanModal({
  planName,
  error,
  pending,
  onClose,
  onSubmit,
}: RenamePlanModalProps) {
  const [value, setValue] = useState(planName);
  const [nameError, setNameError] = useState<string | null>(null);

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedName = value.trim();
    if (!normalizedName) {
      setNameError("กรุณาตั้งชื่อแผน");
      return;
    }
    if (normalizedName.length > 100) {
      setNameError("ชื่อแผนยาวได้ไม่เกิน 100 ตัวอักษร");
      return;
    }
    setNameError(null);
    onSubmit(normalizedName);
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
        aria-labelledby="rename-plan-title"
        onSubmit={submit}
        noValidate
        className="border-border bg-bg shadow-pop relative z-10 my-8 w-full max-w-[480px] rounded-lg border"
      >
        <div className="border-border flex items-start justify-between gap-4 border-b px-6 pt-5 pb-4">
          <div className="flex flex-col gap-0.5">
            <h2 id="rename-plan-title" className="text-h3 text-fg">
              เปลี่ยนชื่อแผน
            </h2>
            <p className="text-caption text-fg-muted">
              ชื่อแผนยาวได้ไม่เกิน 100 ตัวอักษร
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            aria-label="ปิด"
            className="text-fg-muted hover:bg-hover hover:text-fg focus-visible:ring-accent -mr-2 rounded-md p-1.5 transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40"
          >
            <X size={18} aria-hidden />
          </button>
        </div>

        <div className="flex flex-col gap-5 px-6 py-5">
          <TextField
            label="ชื่อแผน"
            value={value}
            maxLength={100}
            disabled={pending}
            errorMessage={nameError ?? undefined}
            onChange={(event) => {
              setValue(event.target.value);
              setNameError(null);
            }}
          />
          {error && (
            <p
              role="alert"
              className="bg-error-soft text-caption text-error rounded-md px-3 py-2"
            >
              {error}
            </p>
          )}
        </div>

        <div className="border-border flex justify-end gap-2 border-t px-6 py-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={pending}
          >
            ยกเลิก
          </Button>
          <Button type="submit" disabled={pending} className="gap-2">
            {pending && (
              <Loader2 size={16} className="animate-spin" aria-hidden />
            )}
            {pending ? "กำลังบันทึก…" : "บันทึก"}
          </Button>
        </div>
      </form>
    </div>
  );
}
