"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { readLastCoursesHref } from "../lastCoursesHref";

export default function BackToCoursesLink() {
  const router = useRouter();

  return (
    <Link
      href="/courses"
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey) return;
        event.preventDefault();
        router.push(readLastCoursesHref());
      }}
      aria-label="กลับไปหน้ารายวิชา"
      title="กลับไปหน้ารายวิชา"
      className="text-fg-muted hover:bg-hover hover:text-fg focus-visible:ring-accent -ml-2 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md transition-colors focus-visible:ring-2 focus-visible:outline-none"
    >
      <ArrowLeft size={20} aria-hidden />
    </Link>
  );
}
