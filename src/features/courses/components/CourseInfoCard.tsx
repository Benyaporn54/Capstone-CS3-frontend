import type { CourseDetail } from "@/types/course";

type CourseInfoCardProps = {
  course: CourseDetail;
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-caption text-fg-muted shrink-0">{label}</dt>
      <dd className="text-body text-fg text-right">{value}</dd>
    </div>
  );
}

export default function CourseInfoCard({ course }: CourseInfoCardProps) {
  const category = course.categories[0];
  const teachingMode = course.tags.find((tag) =>
    /onsite|online/i.test(tag),
  );

  return (
    <section className="border-border flex flex-col gap-3 rounded-lg border p-5">
      <h2 className="text-label text-fg">ข้อมูลวิชา</h2>
      <dl className="flex flex-col gap-2.5">
        <InfoRow label="หน่วยกิต" value={String(course.credits)} />
        <InfoRow
          label="หมวด"
          value={category?.nameEn ?? category?.nameTh ?? "—"}
        />
        <InfoRow label="Prerequisite" value="ไม่มี" />
        <InfoRow label="รูปแบบการสอน" value={teachingMode ?? "—"} />
      </dl>
    </section>
  );
}
