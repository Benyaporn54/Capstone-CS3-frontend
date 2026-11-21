import { getCategories } from "../api";
import {
  parseCourseCategories,
  parseCourseQuery,
  parseCourseSort,
} from "../searchParams";
import type { CourseCategory } from "@/types/course";
import CourseSearchFilter from "./CourseSearchFilter";

type CourseSearchFilterSectionProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function CourseSearchFilterSection({
  searchParams,
}: CourseSearchFilterSectionProps) {
  const params = await searchParams;

  let categories: CourseCategory[] | null = null;
  try {
    categories = await getCategories();
  } catch (error) {
    console.error("Failed to load course categories:", error);
  }

  return (
    <CourseSearchFilter
      categories={categories}
      initialQuery={parseCourseQuery(params.q)}
      initialCategories={parseCourseCategories(params.category)}
      initialSort={parseCourseSort(params.sort)}
    />
  );
}
