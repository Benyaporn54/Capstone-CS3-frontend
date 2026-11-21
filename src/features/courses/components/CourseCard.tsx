import Link from "next/link";
import { Star } from "lucide-react";
import type { CourseListItem } from "@/types/course";

type CourseCardProps = {
  course: CourseListItem;
};

export default function CourseCard({ course }: CourseCardProps) {
  const category = course.categories[0];

  return (
    <Link
      href={`/courses/${course.courseCode}`}
      className="group border-border bg-bg hover:border-border-strong focus-visible:ring-accent flex h-full flex-col gap-2 rounded-lg border p-5 transition-colors focus-visible:ring-2 focus-visible:outline-none"
    >
      <span className="text-label text-fg-muted">{course.courseCode}</span>

      <div className="flex flex-col gap-0.5">
        <h3 className="text-body-lg text-fg group-hover:text-accent font-semibold">
          {course.nameEn}
        </h3>
        <p className="text-caption text-fg-muted">{course.nameTh}</p>
      </div>

      <p className="text-body text-fg-muted">
        {course.credits} หน่วยกิต
        {category && <> · {category.nameEn}</>}
      </p>

      {course.tags.length > 0 && (
        <ul className="mt-1 flex flex-wrap gap-1.5">
          {course.tags.map((tag) => (
            <li
              key={tag}
              className="bg-surface text-caption text-fg-muted rounded-sm px-2 py-0.5"
            >
              {tag}
            </li>
          ))}
        </ul>
      )}

      <div className="border-border text-body mt-auto flex items-center gap-2 border-t pt-3">
        {course.reviewCount > 0 ? (
          <>
            <span className="text-fg inline-flex items-center gap-1 font-semibold">
              <Star
                size={14}
                className="text-signature fill-signature"
                aria-hidden
              />
              {course.averageRating.toFixed(1)}
            </span>
            <span className="text-fg-muted">{course.reviewCount} รีวิว</span>
          </>
        ) : (
          <span className="text-fg-muted">ยังไม่มีรีวิว</span>
        )}
      </div>
    </Link>
  );
}
