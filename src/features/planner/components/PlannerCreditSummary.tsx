import type { PlanSemester, PlanYear } from "@/types/plan";

type CreditField =
  | "itFoundationCredits"
  | "generalEducationCredits"
  | "trackCredits"
  | "projectAndWorkCredits"
  | "freeElectiveCredits";

const categories: { label: string; field: CreditField }[] = [
  { label: "วิชาพื้นฐาน IT", field: "itFoundationCredits" },
  { label: "ศึกษาทั่วไป", field: "generalEducationCredits" },
  { label: "เชิงลึก (Track)", field: "trackCredits" },
  { label: "โครงงานและการทำงาน", field: "projectAndWorkCredits" },
  { label: "เลือกเสรี", field: "freeElectiveCredits" },
];

function sumCategory(semesters: PlanSemester[], field: CreditField) {
  if (semesters.some((semester) => typeof semester[field] !== "number")) {
    return null;
  }
  return semesters.reduce(
    (total, semester) => total + (semester[field] ?? 0),
    0,
  );
}

export default function PlannerCreditSummary({
  years,
  requiredCredits,
}: {
  years: PlanYear[];
  requiredCredits: number;
}) {
  const semesters = years.flatMap((year) => year.semesters);
  const totalCredits = semesters.reduce(
    (total, semester) => total + semester.totalCredits,
    0,
  );
  const percentage =
    requiredCredits > 0
      ? Math.min(100, Math.max(0, (totalCredits / requiredCredits) * 100))
      : 0;

  return (
    <section
      aria-labelledby="credit-summary-heading"
      className="border-border bg-bg rounded-lg border p-4"
    >
      <div className="flex items-baseline justify-between gap-2">
        <h2 id="credit-summary-heading" className="text-label text-fg-muted">
          หน่วยกิตในแผน
        </h2>
        <p className="text-fg-muted text-body whitespace-nowrap">
          <span className="text-h3 text-fg">{totalCredits}</span> /{" "}
          {requiredCredits}
        </p>
      </div>
      <div
        role="progressbar"
        aria-label="หน่วยกิตในแผนเทียบกับหลักสูตร"
        aria-valuemin={0}
        aria-valuemax={requiredCredits > 0 ? requiredCredits : 1}
        aria-valuenow={
          requiredCredits > 0 ? Math.min(totalCredits, requiredCredits) : 0
        }
        aria-valuetext={`${totalCredits} จาก ${requiredCredits} หน่วยกิต`}
        className="bg-hover mt-3 h-1.5 overflow-hidden rounded-full"
      >
        <div
          className="bg-accent h-full rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <dl className="mt-4 flex flex-col gap-2">
        {categories.map(({ label, field }) => {
          const credits = sumCategory(semesters, field);
          return (
            <div
              key={field}
              className="text-body flex items-baseline justify-between gap-2"
            >
              <dt className="text-fg">{label}</dt>
              <dd className="text-fg-muted shrink-0 tabular-nums">
                {credits === null ? "—" : `${credits} หน่วยกิต`}
              </dd>
            </div>
          );
        })}
      </dl>
      {categories.some(
        ({ field }) => sumCategory(semesters, field) === null,
      ) && (
        <p className="text-caption text-fg-muted mt-3">
          ยังไม่มีข้อมูลหน่วยกิตแยกหมวด
        </p>
      )}
    </section>
  );
}
