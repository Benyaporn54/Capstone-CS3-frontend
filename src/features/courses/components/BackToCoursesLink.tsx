"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { readLastCoursesHref } from "../lastCoursesHref";

/**
 * ปุ่มกลับในหน้า Course Detail
 * - มาจากหน้า "รีวิวของฉัน" (?from=my-reviews) → กลับไปหน้านั้น (แท็บเดิม)
 * - ปกติ → หน้ารายวิชาพร้อมคำค้น / หมวด / หน้าที่ดูไว้ล่าสุด
 */
export default function BackToCoursesLink() {
  const router = useRouter();
  const fromMyReviews = useSearchParams().get("from") === "my-reviews";
  const label = fromMyReviews ? "กลับไปหน้ารีวิวของฉัน" : "กลับไปหน้ารายวิชา";

  return (
    <Link
      href={fromMyReviews ? "/profile/reviews" : "/courses"}
      onClick={(event) => {
        // เปิดแท็บใหม่ (cmd/ctrl/shift-click) → ใช้ href ตามปกติ
        if (event.metaKey || event.ctrlKey || event.shiftKey) return;
        event.preventDefault();
        if (fromMyReviews) {
          // ย้อน history เพื่อกลับแท็บเดิม — เปิดหน้านี้ตรง ๆ ไม่มีหน้าก่อนหน้า → ไปหน้ารีวิวของฉัน
          if (window.history.length > 1) router.back();
          else router.push("/profile/reviews");
          return;
        }
        router.push(readLastCoursesHref());
      }}
      aria-label={label}
      title={label}
      className="text-fg-muted hover:bg-hover hover:text-fg focus-visible:ring-accent -ml-2 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md transition-colors focus-visible:ring-2 focus-visible:outline-none"
    >
      <ArrowLeft size={20} aria-hidden />
    </Link>
  );
}
