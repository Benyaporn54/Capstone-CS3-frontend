import Link from "next/link";
import { notFound } from "next/navigation";
import { getTrackById } from "@/features/tracks/api";

type TrackDetailProps = {
  params: Promise<{ id: string }>;
};

const CATEGORY_COLORS = [
  "bg-border-strong",
  "bg-fg",
  "bg-accent",
  "bg-border",
  "bg-signature",
];

// Icon ข้อมูล (Information Circle)
function InfoIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
      />
    </svg>
  );
}

export default async function TrackDetail({ params }: TrackDetailProps) {
  const { id } = await params;
  const trackId = Number(id);
  const track = Number.isInteger(trackId) ? await getTrackById(trackId) : null;

  if (!track) notFound();

  // ดึงหน่วยกิตหมวดวิชาเชิงลึกจาก curriculumSummary (Default = 21)
  const advancedCategory = track.curriculumSummary?.categories?.find(
    (cat) =>
      cat.key === "MAJOR_ADVANCED" ||
      cat.label === "วิชาเชิงลึกทางเทคโนโลยีสารสนเทศ",
  );
  const advancedCategoryCredits = advancedCategory?.credits ?? 21;

  // ดึงหน่วยกิตบังคับเลือกของ Track นี้ ( totalCredits )
  const requiredCredits = track.totalCredits ?? 0;

  // คำนวณหน่วยกิตวิชาเลือกที่ต้องเก็บเพิ่มอัตโนมัติ
  const remainingCredits = Math.max(
    0,
    advancedCategoryCredits - requiredCredits,
  );

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
      {/* Breadcrumb Navigation */}
      <nav aria-label="breadcrumb" className="text-caption text-fg-muted">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/tracks" className="hover:text-fg transition-colors">
              Track
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li className="text-fg font-bold">{track.nameEn}</li>
        </ol>
      </nav>

      {/* Header section */}
      <header className="border-border flex flex-col gap-3 border-b pb-6 md:flex-row md:items-start md:justify-between">
        <div className="flex max-w-3xl flex-col gap-2">
          <h1 className="text-h1 text-fg font-bold">{track.nameEn}</h1>
          <p className="text-body text-fg-muted">
            {track.nameTh ? `${track.nameTh} · ` : ""}
            {track.description}
          </p>
        </div>

        <button className="bg-accent hover:bg-accent/90 self-start rounded-lg px-5 py-2.5 font-medium text-white transition-colors">
          ดูในแผนการเรียน
        </button>
      </header>

      {/* Grid Layout: Main content & Sidebar */}
      <div className="grid grid-cols-1 gap-8 pt-4 lg:grid-cols-3">
        {/* Left Column: Course List grouped by Semester */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          <div>
            <h2 className="text-h3 text-fg font-bold">
              วิชาบังคับเลือกของ Track
            </h2>
            <p className="text-caption text-fg-muted">
              เรียนตามภาคเรียนที่กำหนด ระบบจะใส่ให้ในแผนอัตโนมัติเมื่อเลือก
              Track นี้
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {track.semesters?.map((sem) => (
              <div
                key={`${sem.year}-${sem.semester}`}
                className="border-border bg-bg overflow-hidden rounded-xl border"
              >
                {/* Semester Header */}
                <div className="border-border bg-bg flex items-center justify-between border-b px-5 py-3">
                  <h3 className="text-body text-fg font-semibold">
                    ปี {sem.year} ภาคเรียนที่ {sem.semester}
                  </h3>
                  <span className="text-caption text-fg-muted">
                    {sem.totalCredits} หน่วยกิต
                  </span>
                </div>

                {/* Course List */}
                <ul className="divide-border divide-y">
                  {sem.courses?.map((course) => (
                    <li
                      key={course.id || course.courseCode}
                      className="hover:bg-accent-soft flex items-center justify-between px-5 py-4 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-caption text-fg-muted w-16 font-medium">
                          {course.courseCode}
                        </span>
                        <span className="text-body text-fg font-medium">
                          {course.nameEn || course.nameTh}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-caption text-fg-muted">
                          {course.credits} หน่วยกิต
                        </span>
                        {course.rating ? (
                          <span className="text-caption flex items-center gap-1 font-semibold text-amber-500">
                            ★{" "}
                            <span className="text-fg">
                              {course.rating.toFixed(1)}
                            </span>
                          </span>
                        ) : (
                          <span className="text-caption text-fg-muted">
                            ยังไม่มีรีวิว
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* 🟢 Banner สรุปคำนวณหน่วยกิตอัตโนมัติ */}
          <div className="border-accent/20 bg-accent-soft text-fg flex items-center gap-3 rounded-xl border p-4">
            <InfoIcon className="text-accent h-5 w-5 shrink-0" />
            <p className="text-caption sm:text-body">
              วิชาบังคับเลือกรวม{" "}
              <span className="font-semibold">{requiredCredits}</span> หน่วยกิต
              {remainingCredits > 0 && (
                <>
                  {" "}
                  ที่เหลือ{" "}
                  <span className="font-semibold">{remainingCredits}</span>{" "}
                  หน่วยกิตเลือกจาก{" "}
                  <Link
                    href="/courses"
                    className="text-accent hover:text-accent/80 font-medium underline underline-offset-2 transition-colors"
                  >
                    วิชาเลือกทางเทคโนโลยีสารสนเทศ
                  </Link>
                </>
              )}{" "}
              ให้ครบ{" "}
              <span className="font-semibold">{advancedCategoryCredits}</span>{" "}
              หน่วยกิตของหมวดวิชาเชิงลึก
            </p>
          </div>
        </div>

        {/* Right Column: Sidebar (Curriculum Summary & Related Tracks) */}
        <aside className="flex flex-col gap-6">
          {/* Curriculum Summary Card */}
          {track.curriculumSummary && (
            <div className="border-border bg-bg flex flex-col gap-4 rounded-xl border p-5">
              <h3 className="text-body text-fg font-bold">
                {track.curriculumSummary.title}
              </h3>

              <div
                aria-hidden
                className="flex h-2 w-full gap-0.5 overflow-hidden rounded-full"
              >
                {track.curriculumSummary.categories?.map((cat, i) => (
                  <span
                    key={cat.key}
                    className={`h-full ${CATEGORY_COLORS[i % CATEGORY_COLORS.length]}`}
                    style={{ flex: `${cat.credits} 0 0%` }}
                  />
                ))}
              </div>

              {/* Curriculum Categories Breakdown */}
              <ul className="flex flex-col gap-2.5">
                {track.curriculumSummary.categories?.map((cat, i) => {
                  const isAdvanced =
                    cat.key === "MAJOR_ADVANCED" ||
                    cat.label === "วิชาเชิงลึกทางเทคโนโลยีสารสนเทศ";

                  return (
                    <li
                      key={cat.key}
                      className={`flex justify-between ${
                        isAdvanced ? "text-fg font-bold" : "text-fg-muted"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className={`h-3 w-3 rounded-sm ${
                            CATEGORY_COLORS[i % CATEGORY_COLORS.length]
                          }`}
                        />
                        {cat.label}
                      </span>
                      <span className="text-fg font-semibold">
                        {cat.credits}
                      </span>
                    </li>
                  );
                })}
              </ul>

              <div className="border-border text-caption flex justify-between border-t pt-3">
                <span className="text-fg-muted">รวม</span>
                <span className="text-body text-fg font-bold">
                  {track.curriculumSummary.totalCredits} หน่วยกิต
                </span>
              </div>
            </div>
          )}

          {/* Related Tracks */}
          {track.relatedTracks && track.relatedTracks.length > 0 && (
            <div className="border-border bg-bg flex flex-col gap-3 rounded-xl border p-5">
              <h3 className="text-body text-fg font-bold">
                Track ที่ใกล้เคียง
              </h3>
              <div className="flex flex-wrap gap-2">
                {track.relatedTracks.map((item) => (
                  <Link
                    key={item.id}
                    href={`/tracks/${item.id}`}
                    className="border-border bg-bg text-caption text-fg hover:border-accent hover:text-accent flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 font-medium transition-colors"
                  >
                    {item.nameEn || item.nameTh}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
