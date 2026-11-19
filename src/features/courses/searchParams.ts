type RawParam = string | string[] | undefined;

export const COURSE_QUERY_MAX_LENGTH = 100;

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

export function buildCoursesHref({
  q = "",
  categories = [],
  page = 1,
}: {
  q?: string;
  categories?: string[];
  page?: number;
}): string {
  const params = new URLSearchParams();
  if (q.trim()) params.set("q", q.trim());
  if (categories.length > 0) params.set("category", categories.join(","));
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/courses?${query}` : "/courses";
}
