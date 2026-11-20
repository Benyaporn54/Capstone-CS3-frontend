"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { readLastCoursesHref } from "../lastCoursesHref";

export default function BackToCoursesLink() {
  const router = useRouter();
  const fromMyReviews = useSearchParams().get("from") === "my-reviews";
  const label = fromMyReviews ? "กลับไปหน้ารีวิวของฉัน" : "กลับไปหน้ารายวิชา";

  return (
    <Link
      href={fromMyReviews ? "/profile/reviews" : "/courses"}
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey) return;
        event.preventDefault();
        if (fromMyReviews) {
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
