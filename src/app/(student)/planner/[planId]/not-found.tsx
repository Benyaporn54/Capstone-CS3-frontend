import Link from "next/link";

export default function PlanNotFound() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 px-6 py-20 text-center">
      <h1 className="text-h3 text-fg">ไม่พบแผนการเรียน</h1>
      <p className="text-body text-fg-muted">
        แผนนี้อาจถูกลบไปแล้ว หรือไม่ใช่แผนของบัญชีนี้
      </p>
      <Link
        href="/planner"
        className="border-border text-body text-fg hover:bg-hover inline-flex h-9 items-center justify-center rounded-md border px-[14px] font-medium"
      >
        กลับไปแผนการเรียนของฉัน
      </Link>
    </main>
  );
}
