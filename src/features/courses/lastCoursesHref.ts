const STORAGE_KEY = "planit:lastCoursesHref";

export function saveLastCoursesHref(search: string): void {
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      search ? `/courses?${search}` : "/courses",
    );
  } catch {}
}

export function readLastCoursesHref(): string {
  try {
    const href = sessionStorage.getItem(STORAGE_KEY);
    return href?.startsWith("/courses") ? href : "/courses";
  } catch {
    return "/courses";
  }
}
