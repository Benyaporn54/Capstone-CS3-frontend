type RawParam = string | string[] | undefined;

export const COURSE_QUERY_MAX_LENGTH = 100;
export const DEFAULT_COURSE_SORT = "courseCode,asc";
export const COURSE_SORT_OPTIONS = [
  { value: "courseCode,asc", label: "รหัสวิชา (น้อยไปมาก)" },
  { value: "courseCode,desc", label: "รหัสวิชา (มากไปน้อย)" },
  { value: "rating,desc", label: "คะแนนรีวิวสูงสุด" },
  { value: "reviewCount,desc", label: "จำนวนรีวิวมากสุด" },
] as const;

export type CourseSort = (typeof COURSE_SORT_OPTIONS)[number]["value"];

function first(value: RawParam): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

export function parseCourseQuery(value: RawParam): string {
  return first(value).trim().slice(0, COURSE_QUERY_MAX_LENGTH);
}

export function parseCourseCategories(value: RawParam): string[] {
  const raw = Array.isArray(value) ? value.join(",") : (value ?? "");
  return Array.from(
    new Set(
      raw
        .split(",")
        .map((code) => code.trim())
        .filter(Boolean),
    ),
  );
}

export function parseCourseSort(value: RawParam): CourseSort {
  const sort = first(value);
  return (
    COURSE_SORT_OPTIONS.find((option) => option.value === sort)?.value ??
    DEFAULT_COURSE_SORT
  );
}

export function buildCoursesHref({
  q = "",
  categories = [],
  page = 1,
  sort = DEFAULT_COURSE_SORT,
}: {
  q?: string;
  categories?: string[];
  page?: number;
  sort?: CourseSort;
}): string {
  const params = new URLSearchParams();
  if (q.trim()) params.set("q", q.trim());
  if (categories.length > 0) params.set("category", categories.join(","));
  if (page > 1) params.set("page", String(page));
  params.set("sort", sort);
  const query = params.toString();
  return query ? `/courses?${query}` : "/courses";
}
