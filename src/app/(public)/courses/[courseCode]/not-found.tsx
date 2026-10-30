import Link from "next/link";

export default function CourseNotFound() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 px-6 py-20 text-center">
      <h1 className="text-h3 text-fg">ไม่พบรายวิชา</h1>
      <p className="text-body text-fg-muted">
        รหัสวิชานี้ไม่มีในหลักสูตร หรือลิงก์อาจไม่ถูกต้อง
      </p>
      <Link
        href="/courses"
        className="border-border-fg text-body text-fg hover:bg-hover inline-flex h-9 items-center justify-center rounded-md border px-[14px] font-medium"
      >
        กลับไปหน้ารายวิชา
      </Link>
    </main>
  );
}
