import { Suspense } from "react";
import type { Metadata } from "next";
import CourseDetail from "@/features/courses/components/CourseDetail";
import CourseDetailSkeleton from "@/features/courses/components/CourseDetailSkeleton";
import { getCourseByCode } from "@/features/courses/api";

type CourseDetailPageProps = {
  params: Promise<{ courseCode: string }>;
};

export async function generateMetadata({
  params,
}: CourseDetailPageProps): Promise<Metadata> {
  const { courseCode } = await params;
  const course =
    (await getCourseByCode(courseCode)) ??
    (await getCourseByCode(courseCode.toUpperCase()));

  if (!course) {
    return { title: "ไม่พบรายวิชา | planIT" };
  }

  return {
    title: `${course.courseCode} ${course.nameEn} | planIT`,
  };
}

export default function CourseDetailPage({ params }: CourseDetailPageProps) {
  return (
    <Suspense fallback={<CourseDetailSkeleton />}>
      <CourseDetail params={params} />
    </Suspense>
  );
}
