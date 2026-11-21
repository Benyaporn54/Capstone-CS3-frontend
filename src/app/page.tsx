import { Suspense } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  GitBranch,
  List,
  Search,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import TextField from "@/components/ui/TextField";
import CourseCard from "@/features/courses/components/CourseCard";
import { getCategories, getCourses } from "@/features/courses/api";
import { buildCoursesHref } from "@/features/courses/searchParams";

const features = [
  {
    title: "รายวิชา",
    description:
      "ดูรายละเอียดวิชา prerequisite และรีวิว ค้นหาวิชาที่เหมาะกับคุณ",
    href: "/courses",
    icon: List,
  },
  {
    title: "Track",
    description: "เทียบแต่ละ Track ว่าต้องเรียนวิชาอะไร ก่อนตัดสินใจเลือก",
    href: "/tracks",
    icon: GitBranch,
  },
  {
    title: "แผนการเรียน",
    description: "วางแผนรายวิชาในแต่ละภาคเรียน และติดตามหน่วยกิตในแผน",
    href: "/planner",
    icon: CalendarDays,
  },
];

const semesters = [
  {
    title: "ปี 2 ภาคเรียนที่ 1",
    credits: 15,
    courses: [
      ["INT201", "Client-Side Programming I", "ผ่านแล้ว"],
      ["INT202", "Server-Side Programming I", "ผ่านแล้ว"],
      ["INT205", "Database Management System", "กำลังเรียน"],
      ["INT207", "Network I", "กำลังเรียน"],
      ["GEN111", "Man and Ethics of Living", "กำลังเรียน"],
    ],
  },
  {
    title: "ปี 2 ภาคเรียนที่ 2",
    credits: 12,
    courses: [
      ["INT203", "Client-Side Programming II", "วางแผนไว้"],
      ["INT204", "Server-Side Programming II", "วางแผนไว้"],
      ["INT206", "Software Development Process I", "วางแผนไว้"],
      ["GEN231", "Miracle of Thinking", "วางแผนไว้"],
    ],
  },
];

async function CategoryLinks() {
  const categories = await getCategories().catch(() => null);
  if (categories) {
    return (
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="text-caption text-fg-muted">ดูตามหมวด</span>
        {categories.map((category) => (
          <Link
            key={category.code}
            href={buildCoursesHref({ categories: [category.code] })}
            className="text-caption border-border text-fg hover:border-accent hover:text-accent rounded-full border px-3 py-1.5"
          >
            {category.nameEn || category.nameTh}
          </Link>
        ))}
      </div>
    );
  } else {
    return (
      <Link
        href="/courses"
        className="text-label text-accent hover:text-accent-hover"
      >
        ดูรายวิชาทั้งหมด <ArrowRight size={14} className="inline" aria-hidden />
      </Link>
    );
  }
}

async function ReviewedCourses() {
  const result = await getCourses({
    page: 0,
    size: 3,
    sort: "reviewCount,desc",
  }).catch(() => null);
  if (result) {
    const courses = result.content.filter((course) => course.reviewCount > 0);
    if (courses.length === 0)
      return (
        <p className="text-body text-fg-muted">ยังไม่มีรายวิชาที่มีรีวิว</p>
      );
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    );
  } else {
    return (
      <p className="text-body text-fg-muted">
        ไม่สามารถโหลดรายวิชาได้ในขณะนี้{" "}
        <Link className="text-accent hover:text-accent-hover" href="/courses">
          ไปหน้ารายวิชา
        </Link>
      </p>
    );
  }
}

export default function Home() {
  return (
    <>
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-14 px-4 py-12 sm:px-6 sm:py-16">
        <section
          className="flex flex-col items-center text-center"
          aria-labelledby="home-heading"
        >
          <h1 id="home-heading" className="text-h1 text-fg">
            plan it. แล้วเรียนให้สนุก
          </h1>
          <p className="text-body text-fg-muted mt-4 max-w-xl">
            รวมรายวิชา Track และรีวิวของนักศึกษา IT มจธ. ไว้ที่เดียว
            จัดวิชาลงแต่ละภาคเรียน แล้วดูหน่วยกิตที่เก็บได้ทันที
          </p>
          <form
            action="/courses"
            className="mt-8 flex w-full max-w-xl items-start gap-2"
          >
            <TextField
              name="q"
              maxLength={100}
              aria-label="ค้นหารหัสวิชาหรือชื่อวิชา"
              placeholder="ค้นหารหัสวิชาหรือชื่อวิชา"
              leftIcon={<Search size={16} aria-hidden />}
            />
            <Button type="submit" className="!h-10 shrink-0">
              ค้นหา
            </Button>
          </form>
          <div className="mt-5">
            <Suspense
              fallback={
                <span className="text-caption text-fg-muted">
                  กำลังโหลดหมวดวิชา…
                </span>
              }
            >
              <CategoryLinks />
            </Suspense>
          </div>
        </section>

        <section
          aria-label="สำรวจ planIT"
          className="grid gap-4 sm:grid-cols-3"
        >
          {features.map(({ title, description, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group focus-visible:ring-accent rounded-lg focus-visible:ring-2 focus-visible:outline-none"
            >
              <Card className="hover:border-accent h-full p-5 transition-colors">
                <Icon className="text-accent" size={20} aria-hidden />
                <h2 className="text-body text-fg group-hover:text-accent mt-3 font-semibold">
                  {title}
                </h2>
                <p className="text-caption text-fg-muted mt-2">{description}</p>
              </Card>
            </Link>
          ))}
        </section>

        <section
          aria-labelledby="planner-preview-heading"
          className="flex flex-col gap-5"
        >
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="planner-preview-heading" className="text-h2 text-fg">
                เห็นทั้งปีการศึกษาในหน้าเดียว
              </h2>
              <p className="text-caption text-fg-muted mt-1">
                ตัวอย่างแผนปี 2 เข้าสู่ระบบเพื่อสร้างแผนของตัวเอง
              </p>
            </div>
            <Link
              href="/planner"
              className="text-label text-accent hover:text-accent-hover"
            >
              เปิดแผนการเรียน{" "}
              <ArrowRight size={14} className="inline" aria-hidden />
            </Link>
          </div>
          <div className="border-border bg-surface grid gap-4 rounded-lg border p-3 md:grid-cols-2">
            {semesters.map((semester) => (
              <div
                key={semester.title}
                className="border-border bg-bg overflow-hidden rounded-lg border"
              >
                <div className="border-border flex items-center justify-between gap-2 border-b px-4 py-3">
                  <h3 className="text-label text-fg font-semibold">
                    {semester.title}
                  </h3>
                  <span className="text-caption text-fg-muted">
                    {semester.credits} หน่วยกิต
                  </span>
                </div>
                <ul>
                  {semester.courses.map(([code, name, status]) => (
                    <li
                      key={code}
                      className="border-border flex items-center gap-2 border-b px-4 py-3 last:border-b-0"
                    >
                      <span className="text-caption text-fg-muted w-14 shrink-0">
                        {code}
                      </span>
                      <span className="text-label text-fg min-w-0 flex-1">
                        {name}
                      </span>
                      <span
                        className={`text-caption shrink-0 rounded-sm px-2 py-1 ${status === "ผ่านแล้ว" ? "bg-success-soft text-success" : status === "กำลังเรียน" ? "bg-accent-soft text-accent" : "bg-hover text-fg-muted"}`}
                      >
                        {status}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="reviewed-courses-heading"
          className="flex flex-col gap-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="reviewed-courses-heading" className="text-h2 text-fg">
              วิชาที่มีรีวิว
            </h2>
            <Link
              href="/courses"
              className="text-label text-accent hover:text-accent-hover"
            >
              ดูรายวิชาทั้งหมด{" "}
              <ArrowRight size={14} className="inline" aria-hidden />
            </Link>
          </div>
          <Suspense
            fallback={
              <p className="text-body text-fg-muted">กำลังโหลดรายวิชา…</p>
            }
          >
            <ReviewedCourses />
          </Suspense>
        </section>
      </main>
      <footer className="border-border border-t">
        <div className="text-caption text-fg-muted mx-auto flex max-w-6xl flex-wrap justify-between gap-2 px-4 py-6 sm:px-6">
          <span>
            IT Curriculum Planner · Capstone Project คณะเทคโนโลยีสารสนเทศ มจธ.
          </span>
          <span>ข้อมูลรายวิชาอ้างอิงหลักสูตร IT 2567</span>
        </div>
      </footer>
    </>
  );
}
