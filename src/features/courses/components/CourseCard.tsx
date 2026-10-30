import Link from "next/link";
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
    </Link>
  );
}
