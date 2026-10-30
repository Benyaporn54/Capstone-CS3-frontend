"use client";

import { useEffect } from "react";
import Button from "@/components/ui/Button";

// Next.js 16: the recovery prop is `retry` (not `reset`)
export default function CoursesError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 px-6 py-20 text-center">
      <h1 className="text-h3 text-fg">โหลดข้อมูลรายวิชาไม่สำเร็จ</h1>
      <p className="text-body text-fg-muted">
        กรุณาลองใหม่อีกครั้ง หากยังไม่ได้ ติดต่อผู้ดูแลระบบ
      </p>
      <Button variant="secondary" onClick={() => retry()}>
        ลองใหม่
      </Button>
    </main>
  );
}
