/** จำ URL หน้า /courses ล่าสุด (คำค้น + หมวด + หน้า) ไว้ใน sessionStorage ให้ปุ่มกลับจากหน้า detail ใช้ */

const STORAGE_KEY = "planit:lastCoursesHref";

export function saveLastCoursesHref(search: string): void {
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      search ? `/courses?${search}` : "/courses",
    );
  } catch {
    // storage ใช้ไม่ได้ (เช่น private mode) → ปุ่มกลับไป /courses เฉย ๆ
  }
}

export function readLastCoursesHref(): string {
  try {
    const href = sessionStorage.getItem(STORAGE_KEY);
    return href?.startsWith("/courses") ? href : "/courses";
  } catch {
    return "/courses";
  }
}
