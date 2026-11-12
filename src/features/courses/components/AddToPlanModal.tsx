"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import Dropdown from "@/components/ui/Dropdown";
import { Modal } from "@/components/ui/Modal";
import {
  addCourseToPlanAction,
  getCoursePlanOptionsAction,
} from "@/features/planner/actions";

type PlanOptions = NonNullable<
  Awaited<ReturnType<typeof getCoursePlanOptionsAction>>
>;

type Props = {
  courseId: number;
  courseCode: string;
  onClose: () => void;
  onAdded: () => void;
};

export default function AddToPlanModal({
  courseId,
  courseCode,
  onClose,
  onAdded,
}: Props) {
  const [plans, setPlans] = useState<PlanOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [planId, setPlanId] = useState("");
  const [year, setYear] = useState("");
  const [semester, setSemester] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    getCoursePlanOptionsAction()
      .then((data) => {
        if (cancelled) return;
        setPlans(data);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError("โหลดแผนการเรียนไม่สำเร็จ กรุณาปิดแล้วลองอีกครั้ง");
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedPlan = plans?.find((plan) => String(plan.id) === planId);
  const years = [
    ...new Set(selectedPlan?.terms.map((term) => term.year) ?? []),
  ];
  const semesters =
    selectedPlan?.terms.filter((term) => String(term.year) === year) ?? [];

  const submit = () => {
    if (!planId || !year || !semester || pending) return;
    setError(null);
    startTransition(async () => {
      try {
        const result = await addCourseToPlanAction({
          studyPlanId: Number(planId),
          courseId,
          studyYear: Number(year),
          studySemester: Number(semester),
        });
        if (result.ok) onAdded();
        else setError(result.message);
      } catch {
        setError("เพิ่มรายวิชาไม่สำเร็จ กรุณาลองอีกครั้ง");
      }
    });
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="เพิ่มเข้าแผน"
      description={`เลือกแผนและภาคเรียนสำหรับ ${courseCode}`}
      showCancel
      closeOnConfirm={false}
      confirmLabel="เพิ่มเข้าแผน"
      loading={pending}
      loadingLabel="กำลังเพิ่ม…"
      confirmDisabled={loading || !planId || !year || !semester}
      onConfirm={submit}
      errorMessage={error}
    >
      {loading ? (
        <p className="text-body text-fg-muted">กำลังโหลดแผนการเรียน…</p>
      ) : plans?.length ? (
        <div className="flex flex-col gap-4">
          <Dropdown
            label="แผนการเรียน"
            placeholder="เลือกแผนการเรียน"
            value={planId}
            disabled={pending}
            options={plans.map((plan) => ({
              value: plan.id,
              label: `${plan.name}${plan.isDefault ? " (แผนหลัก)" : ""}`,
            }))}
            onChange={(event) => {
              setPlanId(event.target.value);
              setYear("");
              setSemester("");
              setError(null);
            }}
          />
          {selectedPlan && selectedPlan.terms.length === 0 && (
            <p className="text-caption text-fg-muted">
              ไม่มีภาคเรียนที่เพิ่มวิชาได้ในแผนนี้
            </p>
          )}
          <Dropdown
            label="ปีการศึกษา"
            placeholder="เลือกปี"
            value={year}
            disabled={pending || !selectedPlan || !years.length}
            options={years.map((value) => ({ value, label: `ปี ${value}` }))}
            onChange={(event) => {
              setYear(event.target.value);
              setSemester("");
              setError(null);
            }}
          />
          <Dropdown
            label="ภาคเรียน"
            placeholder="เลือกภาคเรียน"
            value={semester}
            disabled={pending || !year}
            options={semesters.map((term) => ({
              value: term.semester,
              label: `ภาคเรียนที่ ${term.semester}`,
            }))}
            onChange={(event) => {
              setSemester(event.target.value);
              setError(null);
            }}
          />
        </div>
      ) : !error ? (
        <p className="text-body text-fg-muted">
          ยังไม่มีแผนการเรียน{" "}
          <Link href="/planner" className="text-accent underline">
            ไปที่แผนการเรียน
          </Link>
        </p>
      ) : null}
    </Modal>
  );
}
