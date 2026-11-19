import { redirect } from "next/navigation";
import Pagination from "@/components/ui/Pagination";
import { getCourses } from "../api";
import {
  buildCoursesHref,
  parseCourseCategories,
  parseCourseQuery,
} from "../searchParams";
import CourseCard from "./CourseCard";

type CourseListProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

function parsePage(value: string | string[] | undefined): number {
  const page = Number(Array.isArray(value) ? value[0] : value);
  return Number.isInteger(page) && page >= 1 ? page : 1;
}

export default async function CourseList({ searchParams }: CourseListProps) {
  const params = await searchParams;
  const currentPage = parsePage(params.page);
  const q = parseCourseQuery(params.q);
  const categories = parseCourseCategories(params.category);
  const hasFilters = q !== "" || categories.length > 0;
  const data = await getCourses({ page: currentPage - 1, q, categories });

  if (data.totalElements === 0) {
    return (
      <p className="border-border bg-surface text-body text-fg-muted rounded-lg border p-8 text-center">
        {hasFilters ? "ไม่พบรายวิชาที่ตรงกับเงื่อนไข" : "ยังไม่มีข้อมูลรายวิชา"}
      </p>
    );
  }

  if (currentPage > data.totalPages) {
    redirect(buildCoursesHref({ q, categories, page: data.totalPages }));
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-body text-fg-muted">พบ {data.totalElements} วิชา</p>

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.content.map((course) => (
          <li key={course.courseCode}>
            <CourseCard course={course} />
          </li>
        ))}
      </ul>

      <Pagination
        currentPage={currentPage}
        totalPages={data.totalPages}
        basePath="/courses"
        query={{
          q: q || undefined,
          category: categories.length > 0 ? categories.join(",") : undefined,
        }}
      />
    </div>
  );
}
