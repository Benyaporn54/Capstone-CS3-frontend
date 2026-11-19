import { Suspense } from "react";
import type { Metadata } from "next";
import CourseList from "@/features/courses/components/CourseList";
import CourseListSkeleton from "@/features/courses/components/CourseListSkeleton";
import CourseSearchFilterSection from "@/features/courses/components/CourseSearchFilterSection";

export const metadata: Metadata = {
  title: "รายวิชา | planIT",
};

export default function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
      <header className="flex flex-col gap-1">
        <h1 className="text-h1 text-fg">รายวิชา</h1>
        <p className="text-body text-fg-muted">วิชาในหลักสูตร IT 2567</p>
      </header>

      <Suspense
        fallback={
          <div className="bg-surface h-10 w-full animate-pulse rounded-md" />
        }
      >
        <CourseSearchFilterSection searchParams={searchParams} />
      </Suspense>

      <Suspense fallback={<CourseListSkeleton />}>
        <CourseList searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
