import Link from "next/link";
import { notFound } from "next/navigation";
import { Star } from "lucide-react";
import type { CourseDetail as CourseDetailType } from "@/types/course";
import { getCourseByCode } from "../api";
import { getCourseReviews } from "@/features/reviews/api";
import ReviewList from "@/features/reviews/components/ReviewList";
import CourseDetailActions from "./CourseDetailActions";
import CourseInfoCard from "./CourseInfoCard";
import CourseRatingPanel from "./CourseRatingPanel";

type CourseDetailProps = {
  params: Promise<{ courseCode: string }>;
};

function categoryLabel(course: CourseDetailType): string {
  const category = course.categories[0];
  if (!category) return "";
  if (category.code.startsWith("GE")) return "General Education";
  return category.nameEn;
}

export default async function CourseDetail({ params }: CourseDetailProps) {
  const { courseCode } = await params;
  const course =
    (await getCourseByCode(courseCode)) ??
    (await getCourseByCode(courseCode.toUpperCase()));

  if (!course) notFound();

  const { summary, reviews } = getCourseReviews(course.courseCode);
  const category = categoryLabel(course);
  const isRecommended = summary.averageRating >= 4 && summary.reviewCount >= 20;
  const tags = summary.tags.length > 0 ? summary.tags : course.tags;

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-8">
      <nav aria-label="breadcrumb" className="text-caption text-fg-muted">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/courses" className="hover:text-fg">
              รายวิชา
            </Link>
          </li>
          {category && (
            <>
              <li aria-hidden>/</li>
              <li>{category}</li>
            </>
          )}
          <li aria-hidden>/</li>
          <li className="text-fg">{course.courseCode}</li>
        </ol>
      </nav>

      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-label text-fg-muted">{course.courseCode}</span>
            {isRecommended && (
              <span className="bg-signature-soft text-signature-text rounded-sm px-2 py-0.5 text-caption">
                วิชาแนะนำ
              </span>
            )}
          </div>
          <h1 className="text-h1 text-fg">{course.nameEn}</h1>
          <p className="text-body text-fg-muted">{course.nameTh}</p>
          <p className="text-body text-fg-muted mt-1 flex flex-wrap items-center gap-x-2">
            {summary.reviewCount > 0 && (
              <>
                <span className="text-fg inline-flex items-center gap-1">
                  <Star
                    size={14}
                    className="text-signature fill-signature"
                    aria-hidden
                  />
                  {summary.averageRating.toFixed(1)}
                </span>
                <span>({summary.reviewCount} รีวิว)</span>
                <span aria-hidden>·</span>
              </>
            )}
            <span>{course.credits} หน่วยกิต</span>
            {category && (
              <>
                <span aria-hidden>·</span>
                <span>{category}</span>
              </>
            )}
          </p>
        </div>

        <CourseDetailActions />
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="flex flex-col gap-8">
          <section className="flex flex-col gap-3">
            <h2 className="text-h3 text-fg">เกี่ยวกับวิชา</h2>
            <p className="text-body text-fg">{course.descriptionTh}</p>
            {tags.length > 0 && (
              <ul className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <li
                    key={tag}
                    className="bg-surface text-caption text-fg-muted rounded-sm px-2 py-0.5"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <ReviewList reviews={reviews} totalCount={summary.reviewCount} />
        </div>

        <aside className="flex flex-col gap-4">
          <CourseRatingPanel summary={summary} />
          <CourseInfoCard course={course} />
        </aside>
      </div>
    </main>
  );
}
